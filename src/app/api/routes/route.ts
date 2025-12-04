import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { routes, routePoints } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getUserByEmail } from '@/lib/db/users'

// Получить все маршруты пользователя
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const user = await getUserByEmail(session.user.email)

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    const userRoutes = db
      .select()
      .from(routes)
      .where(eq(routes.userId, user.id))
      .orderBy(desc(routes.createdAt))
      .all()

    // Получаем точки для каждого маршрута
    const routesWithPoints = userRoutes.map((route) => {
      const points = db
        .select()
        .from(routePoints)
        .where(eq(routePoints.routeId, route.id))
        .all()
        .sort((a, b) => {
          if (a.day !== b.day) return a.day - b.day
          return a.order - b.order
        })
      
      return {
        ...route,
        points,
      }
    })

    return NextResponse.json({ routes: routesWithPoints }, { status: 200 })
  } catch (error: any) {
    console.error('Ошибка при получении маршрутов:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера при получении маршрутов' },
      { status: 500 }
    )
  }
}

// Создать новый маршрут
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const user = await getUserByEmail(session.user.email)

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, duration, isPublic, points } = body

    if (!title) {
      return NextResponse.json({ error: 'Название маршрута обязательно' }, { status: 400 })
    }

    // Создаем маршрут
    const newRoute = db.insert(routes).values({
      userId: user.id,
      title,
      description: description || null,
      duration: duration || null,
      isPublic: isPublic || false,
    }).returning().get()

    // Добавляем точки маршрута, если они есть
    if (points && Array.isArray(points) && points.length > 0) {
      const routePointsData = points.map((point: any, index: number) => ({
        routeId: newRoute.id,
        day: point.day || 1,
        order: point.order || index + 1,
        title: point.title || '',
        description: point.description || null,
        cityId: point.cityId || null,
        countryId: point.countryId || null,
        attractionId: point.attractionId || null,
        latitude: point.latitude || null,
        longitude: point.longitude || null,
      }))

      db.insert(routePoints).values(routePointsData).run()
    }

    return NextResponse.json({ route: newRoute }, { status: 201 })
  } catch (error: any) {
    console.error('Ошибка при создании маршрута:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера при создании маршрута' },
      { status: 500 }
    )
  }
}

