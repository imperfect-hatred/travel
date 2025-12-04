import { db } from './index'
import { attractions } from './schema'
import { eq } from 'drizzle-orm'

/**
 * Получает достопримечательность по ID
 */
export function getAttractionById(id: string) {
  try {
    return db.query.attractions.findFirst({
      where: eq(attractions.id, id),
      with: { city: true, country: true },
    });
  } catch (error: any) {
    console.error('Ошибка при получении достопримечательности:', error)
    return null
  }
}

/**
 * Получает все достопримечательности
 */
export function getAllAttractions() {
  try {
    return db.query.attractions.findMany({
      with: { city: true, country: true },
    });
  } catch (error: any) {
    console.error('Ошибка при получении всех достопримечательностей:', error)
    return []
  }
}

/**
 * Получает достопримечательности по городу
 */
export function getAttractionsByCity(cityId: string) {
  try {
    return db.query.attractions.findMany({
      where: eq(attractions.cityId, cityId),
      with: { city: true, country: true },
    });
  } catch (error: any) {
    console.error('Ошибка при получении достопримечательностей города:', error)
    return []
  }
}

/**
 * Получает достопримечательности по стране
 */
export function getAttractionsByCountry(countryId: string) {
  try {
    return db.query.attractions.findMany({
      where: eq(attractions.countryId, countryId),
      with: { city: true, country: true },
    });
  } catch (error: any) {
    console.error('Ошибка при получении достопримечательностей страны:', error)
    return []
  }
}




