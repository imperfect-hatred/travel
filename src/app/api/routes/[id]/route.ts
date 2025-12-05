import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { routes, routePoints } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getUserByEmail } from '@/lib/db/users'

// Получить маршрут по ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: routeId } = await params
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const user = await getUserByEmail(session.user.email)

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    const route = db
      .select()
      .from(routes)
      .where(and(eq(routes.id, routeId), eq(routes.userId, user.id)))
      .limit(1)
      .get()

    if (!route) {
      return NextResponse.json({ error: 'Маршрут не найден' }, { status: 404 })
    }

    const points = db
      .select()
      .from(routePoints)
      .where(eq(routePoints.routeId, route.id))
      .all()
      .sort((a, b) => {
        if (a.day !== b.day) return a.day - b.day
        return a.order - b.order
      })

    return NextResponse.json({ route: { ...route, points } }, { status: 200 })
  } catch (error: any) {
    console.error('Ошибка при получении маршрута:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера при получении маршрута' },
      { status: 500 }
    )
  }
}

// Обновить маршрут
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: routeId } = await params
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const user = await getUserByEmail(session.user.email)

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    // Проверяем, что маршрут принадлежит пользователю
    const route = db
      .select()
      .from(routes)
      .where(and(eq(routes.id, routeId), eq(routes.userId, user.id)))
      .limit(1)
      .get()

    if (!route) {
      return NextResponse.json({ error: 'Маршрут не найден' }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, duration, isPublic, points } = body

    // Обновляем маршрут
    db.update(routes)
      .set({
        title: title || route.title,
        description: description !== undefined ? description : route.description,
        duration: duration !== undefined ? duration : route.duration,
        isPublic: isPublic !== undefined ? isPublic : route.isPublic,
        updatedAt: new Date(),
      })
      .where(eq(routes.id, routeId))
      .run()

    // Обновляем точки маршрута, если они переданы
    if (points && Array.isArray(points)) {
      // Удаляем старые точки
      db.delete(routePoints).where(eq(routePoints.routeId, routeId)).run()

      // Добавляем новые точки
      if (points.length > 0) {
        const routePointsData = points.map((point: any, index: number) => ({
          routeId: routeId,
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
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Ошибка при обновлении маршрута:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера при обновлении маршрута' },
      { status: 500 }
    )
  }
}

// Удалить маршрут
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: routeId } = await params
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const user = await getUserByEmail(session.user.email)

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    // Проверяем, что маршрут принадлежит пользователю
    const route = db
      .select()
      .from(routes)
      .where(and(eq(routes.id, routeId), eq(routes.userId, user.id)))
      .limit(1)
      .get()

    if (!route) {
      return NextResponse.json({ error: 'Маршрут не найден' }, { status: 404 })
    }

    // Удаляем точки маршрута (каскадное удаление должно работать через foreign key)
    db.delete(routePoints).where(eq(routePoints.routeId, routeId)).run()
    
    // Удаляем маршрут
    db.delete(routes).where(eq(routes.id, routeId)).run()

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Ошибка при удалении маршрута:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера при удалении маршрута' },
      { status: 500 }
    )
  }
}

