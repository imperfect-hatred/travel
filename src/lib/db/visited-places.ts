import { db } from './index'
import { visitedPlaces, NewVisitedPlace, VisitedPlace } from './schema'
import { eq, and, InferSelectModel } from 'drizzle-orm'
import { getCountryById } from './countries'
import { getCityById, createCityFromFallback } from './cities'
import { getAttractionById } from './attractions'

export type VisitedPlaceWithDetails = InferSelectModel<typeof visitedPlaces> & {
  country: {
    id: string;
    name: string;
  } | null;
  city: {
    id: string;
    name: string;
  } | null;
  attraction: {
    id: string;
    name: string;
  } | null;
}

export async function getVisitedPlacesForUser(userId: string): Promise<VisitedPlaceWithDetails[]> {
  return db.query.visitedPlaces.findMany({
    where: eq(visitedPlaces.userId, userId),
    with: {
      country: {
        columns: { id: true, name: true },
      },
      city: {
        columns: { id: true, name: true },
      },
      attraction: {
        columns: { id: true, name: true },
      },
    },
    orderBy: (visitedPlaces, { desc }) => [desc(visitedPlaces.visitDate)],
  });
}

export async function addVisitedPlace(data: NewVisitedPlace): Promise<VisitedPlace | undefined> {
  try {
    // Проверяем существование и устанавливаем null если не найдено
    // Это позволяет работать с fallback данными без нарушения foreign key constraints
    const insertData: NewVisitedPlace = {
      userId: data.userId,
      countryId: null,
      cityId: null,
      attractionId: null,
      visitDate: data.visitDate || null,
      notes: data.notes || null,
    };

    const missingIds: string[] = [];

    if (data.countryId) {
      const country = await getCountryById(data.countryId);
      if (country) {
        insertData.countryId = data.countryId;
      } else {
        missingIds.push(`страна: ${data.countryId}`);
        console.warn(`Предупреждение: Страна с ID ${data.countryId} не найдена в БД, будет сохранено без привязки к стране.`);
      }
    }
    if (data.cityId) {
      let city = await getCityById(data.cityId);
      if (!city) {
        // Пробуем создать город из fallback данных
        console.log(`Попытка создать город с ID ${data.cityId} из fallback данных...`);
        try {
          // Импортируем fallback данные динамически из страницы городов
          const { citiesData } = await import('../../app/cities/page');
          let fallbackCity = citiesData.find((c: any) => c.id === data.cityId);
          
          // Если не нашли в citiesData, пробуем расширенные fallback данные
          if (!fallbackCity) {
            try {
              const { fallbackCitiesData } = await import('../../app/cities/[id]/page');
              fallbackCity = fallbackCitiesData?.[data.cityId];
            } catch (e) {
              // Игнорируем ошибку импорта
            }
          }
          
          if (fallbackCity) {
            const createdCityId = await createCityFromFallback(fallbackCity);
            if (createdCityId) {
              city = await getCityById(createdCityId);
              if (city) {
                insertData.cityId = createdCityId;
                console.log(`✅ Город создан и привязан: ${createdCityId}`);
              } else {
                // Если создали, но не получили обратно, используем созданный ID
                insertData.cityId = createdCityId;
                console.log(`✅ Город создан с ID: ${createdCityId}`);
              }
            }
          }
        } catch (importError) {
          console.warn('Не удалось импортировать fallback данные:', importError);
        }
      }
      
      if (city || insertData.cityId) {
        // Используем cityId из city или уже установленный insertData.cityId
        if (!insertData.cityId && city) {
          insertData.cityId = city.id;
        }
      } else {
        missingIds.push(`город: ${data.cityId}`);
        console.warn(`Предупреждение: Город с ID ${data.cityId} не найден в БД и не может быть создан.`);
      }
    }
    if (data.attractionId) {
      const attraction = await getAttractionById(data.attractionId);
      if (attraction) {
        insertData.attractionId = data.attractionId;
      } else {
        missingIds.push(`достопримечательность: ${data.attractionId}`);
        console.warn(`Предупреждение: Достопримечательность с ID ${data.attractionId} не найдена в БД, будет сохранено без привязки к достопримечательности.`);
      }
    }

    // Если есть несуществующие ID, добавляем информацию о них в notes
    if (missingIds.length > 0 && !insertData.countryId && !insertData.cityId && !insertData.attractionId) {
      const missingInfo = `[Не найдено в БД: ${missingIds.join(', ')}]`;
      insertData.notes = insertData.notes 
        ? `${insertData.notes}\n${missingInfo}` 
        : missingInfo;
    }

    // Разрешаем добавление даже если все ID не найдены (для fallback данных)
    // Информация о несуществующих ID будет сохранена в notes
    const [newVisitedPlace] = await db.insert(visitedPlaces).values(insertData).returning();
    return newVisitedPlace;
  } catch (error: any) {
    console.error('Ошибка при добавлении посещенного места:', error);
    throw new Error(`Не удалось добавить посещенное место: ${error.message}`);
  }
}

export async function removeVisitedPlace(visitedPlaceId: string, userId: string): Promise<boolean> {
  const result = await db.delete(visitedPlaces)
    .where(and(eq(visitedPlaces.id, visitedPlaceId), eq(visitedPlaces.userId, userId)))
    .returning({ id: visitedPlaces.id });
  return result.length > 0;
}

export async function getVisitedPlaceById(visitedPlaceId: string): Promise<VisitedPlaceWithDetails | undefined> {
  return db.query.visitedPlaces.findFirst({
    where: eq(visitedPlaces.id, visitedPlaceId),
    with: {
      country: {
        columns: { id: true, name: true },
      },
      city: {
        columns: { id: true, name: true },
      },
      attraction: {
        columns: { id: true, name: true },
      },
    },
  });
}
