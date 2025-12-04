import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { reviews } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getUserByEmail } from '@/lib/db/users'
import { getReviewById, deleteReview } from '@/lib/db/reviews'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const review = await getReviewById(params.id);
    if (!review) {
      return NextResponse.json({ error: 'Отзыв не найден' }, { status: 404 });
    }
    return NextResponse.json({ review }, { status: 200 });
  } catch (error: any) {
    console.error('Ошибка при получении отзыва:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера при получении отзыва' },
      { status: 500 }
    );
  }
}

// Обновить отзыв
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const user = await getUserByEmail(session.user.email)

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    // Проверяем, что отзыв принадлежит пользователю
    const review = await getReviewById(params.id)

    if (!review || review.userId !== user.id) {
      return NextResponse.json({ error: 'Отзыв не найден или не принадлежит пользователю' }, { status: 404 })
    }

    const body = await request.json()
    const { content, rating } = body

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Рейтинг должен быть от 1 до 5' },
        { status: 400 }
      )
    }

    await db.update(reviews)
      .set({
        content: content || review.content,
        rating: rating || review.rating,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, params.id))
      .run()

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Ошибка при обновлении отзыва:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера при обновлении отзыва' },
      { status: 500 }
    )
  }
}

// Удалить отзыв
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const user = await getUserByEmail(session.user.email)

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    const success = await deleteReview(params.id, user.id);

    if (!success) {
      return NextResponse.json({ error: 'Отзыв не найден или не принадлежит пользователю' }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Ошибка при удалении отзыва:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера при удалении отзыва' },
      { status: 500 }
    )
  }
}



