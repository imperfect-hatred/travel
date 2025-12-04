import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { visitedPlaces, countries, cities, attractions } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getUserByEmail } from '@/lib/db/users'
import { getVisitedPlacesForUser, addVisitedPlace, removeVisitedPlace } from '@/lib/db/visited-places'

// Получить все посещенные места пользователя
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

    const places = await getVisitedPlacesForUser(user.id)

    return NextResponse.json({ places }, { status: 200 })
  } catch (error: any) {
    console.error('Ошибка при получении посещенных мест:', error)
    return NextResponse.json(
      { error: error.message || 'Ошибка сервера при получении посещенных мест' },
      { status: 500 }
    )
  }
}

// Добавить посещенное место
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
    const { countryId, cityId, attractionId, visitDate, notes } = body

    // Проверяем, что указан хотя бы один ID
    if (!countryId && !cityId && !attractionId) {
      return NextResponse.json(
        { error: 'Необходимо указать countryId, cityId или attractionId' },
        { status: 400 }
      )
    }

    // Проверка, что место еще не добавлено
    const conditions = [eq(visitedPlaces.userId, user.id)]
    if (countryId) {
      conditions.push(eq(visitedPlaces.countryId, countryId))
    }
    if (cityId) {
      conditions.push(eq(visitedPlaces.cityId, cityId))
    }
    if (attractionId) {
      conditions.push(eq(visitedPlaces.attractionId, attractionId))
    }

    const existing = await db
      .select()
      .from(visitedPlaces)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .limit(1)
      .get()

    if (existing) {
      return NextResponse.json(
        { error: 'Это место уже добавлено в посещенные' },
        { status: 400 }
      )
    }

    let newPlace;
    try {
      newPlace = await addVisitedPlace({
        userId: user.id,
        countryId: countryId || null,
        cityId: cityId || null,
        attractionId: attractionId || null,
        visitDate: visitDate ? new Date(visitDate) : null,
        notes: notes || null,
      })
    } catch (dbError: any) {
      console.error('Ошибка базы данных при добавлении посещенного места:', dbError)
      return NextResponse.json({ error: dbError.message || 'Ошибка базы данных' }, { status: 500 })
    }

    if (!newPlace) {
      console.error('Не удалось добавить посещенное место')
      return NextResponse.json({ 
        error: 'Не удалось добавить посещенное место. Возможна ошибка базы данных.' 
      }, { status: 500 })
    }

    return NextResponse.json({ place: newPlace }, { status: 201 })
  } catch (error: any) {
    console.error('Ошибка при добавлении посещенного места:', error)
    return NextResponse.json(
      { error: `Ошибка сервера при добавлении места: ${error.message}` },
      { status: 500 }
    )
  }
}

// Удалить посещенное место
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const user = await getUserByEmail(session.user.email)

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const placeId = searchParams.get('id')

    if (!placeId) {
      return NextResponse.json({ error: 'ID места не указан' }, { status: 400 })
    }

    const success = await removeVisitedPlace(placeId, user.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Место не найдено или не принадлежит вам' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Ошибка при удалении посещенного места:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера при удалении места' },
      { status: 500 }
    )
  }
}

