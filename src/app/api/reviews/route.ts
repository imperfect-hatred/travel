import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getUserByEmail } from '@/lib/db/users'
import { getReviewsForEntity, createReview, type ReviewWithUser } from '@/lib/db/reviews'

// Получить отзывы
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const countryId = searchParams.get('countryId')
    const cityId = searchParams.get('cityId')
    const attractionId = searchParams.get('attractionId')

    let allReviews: ReviewWithUser[]

    if (countryId) {
      allReviews = await getReviewsForEntity('country', countryId)
    } else if (cityId) {
      allReviews = await getReviewsForEntity('city', cityId)
    } else if (attractionId) {
      allReviews = await getReviewsForEntity('attraction', attractionId)
    } else {
      // Если нет параметров, возвращаем пустой массив или обрабатываем иначе, в зависимости от логики
      // В данном случае, так как schema.ts не имеет 'allReviews' - возвращаем пустой массив
      allReviews = []
    }

    return NextResponse.json({ reviews: allReviews }, { status: 200 })
  } catch (error: any) {
    console.error('Ошибка при получении отзывов:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера при получении отзывов' },
      { status: 500 }
    )
  }
}

// Создать отзыв
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
    const { content, rating, countryId, cityId, attractionId } = body

    if (!content || !rating) {
      return NextResponse.json(
        { error: 'Содержание и рейтинг обязательны' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Рейтинг должен быть от 1 до 5' },
        { status: 400 }
      )
    }

    // Проверяем, что указан хотя бы один ID
    if (!countryId && !cityId && !attractionId) {
      return NextResponse.json(
        { error: 'Необходимо указать countryId, cityId или attractionId' },
        { status: 400 }
      )
    }

    let newReview;
    try {
      newReview = await createReview({
        userId: user.id,
        content,
        rating,
        countryId: countryId || null,
        cityId: cityId || null,
        attractionId: attractionId || null,
      })
    } catch (dbError: any) {
      console.error('Ошибка базы данных при создании отзыва:', dbError)
      return NextResponse.json({ error: dbError.message || 'Ошибка базы данных' }, { status: 500 })
    }

    if (!newReview) {
      console.error('Не удалось создать отзыв')
      return NextResponse.json({ 
        error: 'Не удалось создать отзыв. Возможна ошибка базы данных.' 
      }, { status: 500 })
    }

    return NextResponse.json({ review: newReview }, { status: 201 })
  } catch (error: any) {
    console.error('Ошибка при создании отзыва:', error)
    return NextResponse.json(
      { error: `Ошибка сервера при создании отзыва: ${error.message}` },
      { status: 500 }
    )
  }
}

