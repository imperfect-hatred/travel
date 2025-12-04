import { db } from './index'
import { wishlists, NewWishlist, Wishlist } from './schema'
import { eq, and, InferSelectModel } from 'drizzle-orm'
import { getCountryById } from './countries'
import { getCityById, createCityFromFallback } from './cities'
import { getAttractionById } from './attractions'

export type WishlistWithDetails = InferSelectModel<typeof wishlists> & {
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

export async function getWishlistForUser(userId: string): Promise<WishlistWithDetails[]> {
  return db.query.wishlists.findMany({
    where: eq(wishlists.userId, userId),
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
    orderBy: (wishlists, { desc }) => [desc(wishlists.createdAt)],
  });
}

export async function addWishlistItem(data: NewWishlist): Promise<Wishlist | undefined> {
  try {
    // Проверяем существование и устанавливаем null если не найдено
    // Это позволяет работать с fallback данными без нарушения foreign key constraints
    const insertData: NewWishlist = {
      userId: data.userId,
      countryId: null,
      cityId: null,
      attractionId: null,
      notes: data.notes || null,
      priority: data.priority || 1,
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
          const { citiesData } = await import('../../app/cities/page');
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

    // Если есть несуществующие ID, добавляем информацию о них в notes
    if (missingIds.length > 0 && !insertData.countryId && !insertData.cityId && !insertData.attractionId) {
      const missingInfo = `[Не найдено в БД: ${missingIds.join(', ')}]`;
      insertData.notes = insertData.notes 
        ? `${insertData.notes}\n${missingInfo}` 
        : missingInfo;
    }

    // Разрешаем добавление даже если все ID не найдены (для fallback данных)
    // Информация о несуществующих ID будет сохранена в notes
    const [newWishlistItem] = await db.insert(wishlists).values(insertData).returning();
    return newWishlistItem;
  } catch (error: any) {
    console.error('Ошибка при добавлении в желаемые направления:', error);
    throw new Error(`Не удалось добавить в желаемые направления: ${error.message}`);
  }
}

export async function removeWishlistItem(wishlistItemId: string, userId: string): Promise<boolean> {
  const result = await db.delete(wishlists)
    .where(and(eq(wishlists.id, wishlistItemId), eq(wishlists.userId, userId)))
    .returning({ id: wishlists.id });
  return result.length > 0;
}

export async function getWishlistItemById(wishlistItemId: string): Promise<WishlistWithDetails | undefined> {
  return db.query.wishlists.findFirst({
    where: eq(wishlists.id, wishlistItemId),
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
