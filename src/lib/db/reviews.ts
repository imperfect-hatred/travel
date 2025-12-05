import { db } from './index'
import { reviews } from './schema'
import { eq, and, InferSelectModel, InferInsertModel } from 'drizzle-orm'

type Review = InferSelectModel<typeof reviews>
type NewReview = InferInsertModel<typeof reviews>
import { getCountryById } from './countries'
import { getCityById, createCityFromFallback } from './cities'
import { getAttractionById } from './attractions'

export type ReviewWithUser = InferSelectModel<typeof reviews> & {
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
  } | null;
}

export async function getReviewsForEntity(
  entityType: 'country' | 'city' | 'attraction',
  entityId: string
): Promise<ReviewWithUser[]> {
  let whereClause;
  switch (entityType) {
    case 'country':
      whereClause = eq(reviews.countryId, entityId);
      break;
    case 'city':
      whereClause = eq(reviews.cityId, entityId);
      break;
    case 'attraction':
      whereClause = eq(reviews.attractionId, entityId);
      break;
    default:
      throw new Error('Неизвестный тип сущности');
  }

  const result = await db.query.reviews.findMany({
    where: whereClause,
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
  });

  return result;
}

export async function createReview(data: NewReview): Promise<Review | undefined> {
  try {
    // Проверяем существование и устанавливаем null если не найдено
    // Это позволяет работать с fallback данными без нарушения foreign key constraints
    const insertData: NewReview = {
      userId: data.userId,
      content: data.content,
      rating: data.rating,
      countryId: null,
      cityId: null,
      attractionId: null,
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
          // Импортируем fallback данные динамически
          const { citiesData } = await import('../data/cities');
          const fallbackCity = citiesData.find((c: any) => c.id === data.cityId);
          
          if (fallbackCity) {
            const createdCityId = await createCityFromFallback(fallbackCity);
            if (createdCityId) {
              city = await getCityById(createdCityId);
              if (city) {
                insertData.cityId = createdCityId;
                console.log(`✅ Город создан и привязан: ${createdCityId}`);
              }
            }
          }
        } catch (importError) {
          console.warn('Не удалось импортировать fallback данные:', importError);
        }
      }
      
      if (city) {
        insertData.cityId = data.cityId;
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

    // Если есть несуществующие ID, добавляем информацию о них в content
    if (missingIds.length > 0 && !insertData.countryId && !insertData.cityId && !insertData.attractionId) {
      const missingInfo = `\n\n[Примечание: Место не найдено в БД: ${missingIds.join(', ')}]`;
      insertData.content = `${insertData.content}${missingInfo}`;
    }

    // Разрешаем добавление даже если все ID не найдены (для fallback данных)
    // Информация о несуществующих ID будет добавлена в content
    const [newReview] = await db.insert(reviews).values(insertData).returning();
    return newReview;
  } catch (error: any) {
    console.error('Ошибка при создании отзыва:', error);
    throw new Error(`Не удалось создать отзыв: ${error.message}`);
  }
}

export async function deleteReview(reviewId: string, userId: string): Promise<boolean> {
  const result = await db.delete(reviews)
    .where(and(eq(reviews.id, reviewId), eq(reviews.userId, userId)))
    .returning({ id: reviews.id });
  return result.length > 0;
}

export async function getReviewById(reviewId: string): Promise<ReviewWithUser | undefined> {
  const result = await db.query.reviews.findFirst({
    where: eq(reviews.id, reviewId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });
  return result;
}
