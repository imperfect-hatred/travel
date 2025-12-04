import { db } from './index'
import { cities, countries } from './schema'
import { eq, and } from 'drizzle-orm'
import { getCountryByName, getCountryBySlug } from './countries'

/**
 * Получает город по ID
 */
export async function getCityById(id: string) {
  try {
    return await db.query.cities.findFirst({
      where: eq(cities.id, id),
      with: { country: true },
    });
  } catch (error: any) {
    console.error('Ошибка при получении города:', error)
    return null
  }
}

/**
 * Получает все города
 */
export async function getAllCities() {
  try {
    return await db.query.cities.findMany({
      with: { country: true },
    });
  } catch (error: any) {
    console.error('Ошибка при получении всех городов:', error)
    return []
  }
}

/**
 * Получает города по стране
 */
export async function getCitiesByCountry(countryId: string) {
  try {
    return await db.query.cities.findMany({
      where: eq(cities.countryId, countryId),
      with: { country: true },
    });
  } catch (error: any) {
    console.error('Ошибка при получении городов страны:', error)
    return []
  }
}

/**
 * Создает или получает страну по имени
 */
async function getOrCreateCountry(countryName: string, countrySlug?: string): Promise<string | null> {
  try {
    // Пробуем найти страну по имени
    let country = await getCountryByName(countryName);
    
    if (!country && countrySlug) {
      // Пробуем найти по slug
      country = await getCountryBySlug(countrySlug);
    }
    
    if (country) {
      return country.id;
    }
    
    // Создаем новую страну
    // Генерируем уникальный код страны
    let countryCode = countryName.substring(0, 2).toUpperCase();
    let attempts = 0;
    let uniqueCode = countryCode;
    
    // Проверяем уникальность кода
    while (attempts < 10) {
      const existing = db.select().from(countries).where(eq(countries.code, uniqueCode)).limit(1).get();
      if (!existing) {
        break;
      }
      uniqueCode = `${countryCode}${attempts + 1}`;
      attempts++;
    }
    
    const [newCountry] = await db.insert(countries).values({
      name: countryName,
      code: uniqueCode,
      description: `Страна ${countryName}`,
    }).returning({ id: countries.id });
    
    console.log(`✅ Страна ${countryName} создана в БД с ID: ${newCountry?.id}`);
    return newCountry?.id || null;
  } catch (error: any) {
    // Если ошибка из-за дубликата, пробуем найти существующую страну
    if (error.message?.includes('UNIQUE constraint') || error.message?.includes('unique')) {
      const country = await getCountryByName(countryName);
      if (country) {
        return country.id;
      }
    }
    console.error('Ошибка при создании/получении страны:', error);
    return null;
  }
}

/**
 * Создает город в БД из fallback данных, если он не найден
 */
export async function createCityFromFallback(fallbackCity: any): Promise<string | null> {
  try {
    // Проверяем, существует ли уже город с таким ID
    const existingCityById = await getCityById(fallbackCity.id);
    if (existingCityById) {
      console.log(`✅ Город с ID ${fallbackCity.id} уже существует в БД`);
      return existingCityById.id;
    }
    
    // Получаем или создаем страну
    const countryId = await getOrCreateCountry(fallbackCity.country, fallbackCity.countrySlug);
    if (!countryId) {
      console.error('Не удалось создать или найти страну для города:', fallbackCity.name);
      return null;
    }
    
    // Проверяем, существует ли уже город с таким именем и страной
    const existingCityByName = await db.query.cities.findFirst({
      where: and(eq(cities.name, fallbackCity.name), eq(cities.countryId, countryId)),
    });
    
    if (existingCityByName) {
      console.log(`✅ Город ${fallbackCity.name} уже существует в БД с ID: ${existingCityByName.id}`);
      return existingCityByName.id;
    }
    
    // Парсим population из строки "2.1 млн" в число
    let population: number | null = null;
    if (fallbackCity.population) {
      const popMatch = fallbackCity.population.toString().match(/([\d.]+)/);
      if (popMatch) {
        const popValue = parseFloat(popMatch[1]);
        population = Math.round(popValue * 1000000); // Конвертируем миллионы в число
      }
    }
    
    // Создаем город
    const [newCity] = await db.insert(cities).values({
      id: fallbackCity.id, // Используем тот же ID из fallback данных
      name: fallbackCity.name,
      description: fallbackCity.description || null,
      image: fallbackCity.image || null,
      population: population,
      bestTime: fallbackCity.bestTime || null,
      climate: fallbackCity.climate || null,
      latitude: fallbackCity.latitude || null,
      longitude: fallbackCity.longitude || null,
      countryId: countryId,
    }).returning({ id: cities.id });
    
    console.log(`✅ Город ${fallbackCity.name} создан в БД с ID: ${newCity?.id}`);
    return newCity?.id || null;
  } catch (error: any) {
    // Если ошибка из-за уникального ограничения, пробуем найти существующий город
    if (error.message?.includes('UNIQUE constraint') || error.message?.includes('unique')) {
      console.warn(`Город ${fallbackCity.name} уже существует (нарушение уникального ограничения), ищем существующий...`);
      try {
        // Получаем страну для поиска
        const countryId = await getOrCreateCountry(fallbackCity.country, fallbackCity.countrySlug);
        if (countryId) {
          const existingCity = await db.query.cities.findFirst({
            where: and(eq(cities.name, fallbackCity.name), eq(cities.countryId, countryId)),
          });
          if (existingCity) {
            console.log(`✅ Найден существующий город ${fallbackCity.name} с ID: ${existingCity.id}`);
            return existingCity.id;
          }
        }
      } catch (searchError) {
        console.error('Ошибка при поиске существующего города:', searchError);
      }
    }
    console.error('Ошибка при создании города из fallback данных:', error);
    return null;
  }
}




