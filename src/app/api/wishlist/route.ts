import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { wishlists, countries, cities, attractions } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getUserByEmail } from '@/lib/db/users'
import { getWishlistForUser, addWishlistItem, removeWishlistItem } from '@/lib/db/wishlist'

// Получить все желаемые направления пользователя
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

    const items = await getWishlistForUser(user.id)

    return NextResponse.json({ items }, { status: 200 })
  } catch (error: any) {
    console.error('Ошибка при получении желаемых направлений:', error)
    return NextResponse.json(
      { error: error.message || 'Ошибка сервера при получении желаемых направлений' },
      { status: 500 }
    )
  }
}

// Добавить в желаемые направления
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
    const { countryId, cityId, attractionId, notes, priority } = body

    // Проверяем, что указан хотя бы один ID
    if (!countryId && !cityId && !attractionId) {
      return NextResponse.json(
        { error: 'Необходимо указать countryId, cityId или attractionId' },
        { status: 400 }
      )
    }

    // Проверка, что место еще не добавлено
    const conditions = [eq(wishlists.userId, user.id)]
    if (countryId) {
      conditions.push(eq(wishlists.countryId, countryId))
    }
    if (cityId) {
      conditions.push(eq(wishlists.cityId, cityId))
    }
    if (attractionId) {
      conditions.push(eq(wishlists.attractionId, attractionId))
    }

    const existing = await db
      .select()
      .from(wishlists)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .limit(1)
      .get()

    if (existing) {
      return NextResponse.json(
        { error: 'Это место уже добавлено в желаемые направления' },
        { status: 400 }
      )
    }

    let newItem;
    try {
      newItem = await addWishlistItem({
        userId: user.id,
        countryId: countryId || null,
        cityId: cityId || null,
        attractionId: attractionId || null,
        notes: notes || null,
        priority: priority || 1,
      })
    } catch (dbError: any) {
      console.error('Ошибка базы данных при добавлении в желаемые направления:', dbError)
      return NextResponse.json({ error: dbError.message || 'Ошибка базы данных' }, { status: 500 })
    }

    if (!newItem) {
      console.error('Не удалось добавить в желаемые направления')
      return NextResponse.json({ 
        error: 'Не удалось добавить в желаемые направления. Возможна ошибка базы данных.' 
      }, { status: 500 })
    }

    return NextResponse.json({ item: newItem }, { status: 201 })
  } catch (error: any) {
    console.error('Ошибка при добавлении в желаемые направления:', error)
    return NextResponse.json(
      { error: `Ошибка сервера при добавлении в желаемые направления: ${error.message}` },
      { status: 500 }
    )
  }
}

// Удалить из желаемых направлений
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
    const itemId = searchParams.get('id')

    if (!itemId) {
      return NextResponse.json({ error: 'ID элемента не указан' }, { status: 400 })
    }

    const success = await removeWishlistItem(itemId, user.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Элемент не найден или не принадлежит вам' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Ошибка при удалении из желаемых направлений:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера при удалении из желаемых направлений' },
      { status: 500 }
    )
  }
}

