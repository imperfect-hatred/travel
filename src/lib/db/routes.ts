import { db } from './index'
import { routes, routePoints } from './schema'
import { eq, desc } from 'drizzle-orm'

/**
 * Получает все публичные маршруты
 */
export function getPublicRoutes() {
  try {
    const publicRoutes = db
      .select()
      .from(routes)
      .where(eq(routes.isPublic, true))
      .orderBy(desc(routes.createdAt))
      .all()

    // Получаем точки для каждого маршрута
    return publicRoutes.map(route => {
      const points = db
        .select()
        .from(routePoints)
        .where(eq(routePoints.routeId, route.id))
        .orderBy(routePoints.day, routePoints.order)
        .all()

      return {
        ...route,
        points,
      }
    })
  } catch (error: any) {
    console.error('Ошибка при получении маршрутов:', error)
    return []
  }
}

/**
 * Получает маршрут по ID
 */
export function getRouteById(id: string) {
  try {
    const route = db
      .select()
      .from(routes)
      .where(eq(routes.id, id))
      .limit(1)
      .get()

    if (!route) return null

    const points = db
      .select()
      .from(routePoints)
      .where(eq(routePoints.routeId, route.id))
      .orderBy(routePoints.day, routePoints.order)
      .all()

    return {
      ...route,
      points,
    }
  } catch (error: any) {
    console.error('Ошибка при получении маршрута:', error)
    return null
  }
}







