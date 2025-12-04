import { db } from './index'
import { countries } from './schema'
import { eq, ilike } from 'drizzle-orm'

/**
 * Получает страну по имени (регистронезависимо)
 */
export function getCountryByName(name: string) {
  try {
    return db.query.countries.findFirst({
      where: eq(countries.name, name),
      with: { continent: true },
    });
  } catch (error: any) {
    console.error('Ошибка при получении страны:', error)
    return null
  }
}

/**
 * Получает страну по slug (имя в нижнем регистре)
 */
export function getCountryBySlug(slug: string) {
  try {
    // Получаем все страны
    const allCountries = db.select().from(countries).all()
    const normalizedSlug = slug.toLowerCase().trim()
    
    // Ищем точное совпадение по имени
    let country = allCountries.find(c => 
      c.name.toLowerCase() === normalizedSlug
    )
    
    if (country) return country

    // Пробуем найти по имени с заменой дефисов на пробелы
    const nameWithSpaces = normalizedSlug.replace(/-/g, ' ')
    country = allCountries.find(c => 
      c.name.toLowerCase() === nameWithSpaces
    )
    
    if (country) return country

    // Пробуем найти по частичному совпадению
    country = allCountries.find(c => 
      c.name.toLowerCase().replace(/\s+/g, '-') === normalizedSlug ||
      c.name.toLowerCase().replace(/\s+/g, '') === normalizedSlug.replace(/-/g, '')
    )
    
    return country || null
  } catch (error: any) {
    console.error('Ошибка при получении страны по slug:', error)
    return null
  }
}

/**
 * Получает все страны
 */
export function getAllCountries() {
  try {
    return db.query.countries.findMany({
      with: { continent: true },
    });
  } catch (error: any) {
    console.error('Ошибка при получении всех стран:', error)
    return []
  }
}

/**
 * Получает страну по ID
 */
export function getCountryById(id: string) {
  try {
    return db.query.countries.findFirst({
      where: eq(countries.id, id),
      with: { continent: true },
    });
  } catch (error: any) {
    console.error('Ошибка при получении страны по ID:', error)
    return null
  }
}

