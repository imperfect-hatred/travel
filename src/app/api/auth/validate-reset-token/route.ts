import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { passwordResetTokens, users } from '@/lib/db/schema'
import { eq, and, gt } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Токен не предоставлен' },
        { status: 400 }
      )
    }

    // Проверяем токен
    const resetToken = await db
      .select({
        token: passwordResetTokens.token,
        userId: passwordResetTokens.userId,
        expires: passwordResetTokens.expires,
        used: passwordResetTokens.used,
      })
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          gt(passwordResetTokens.expires, new Date()),
          eq(passwordResetTokens.used, false)
        )
      )
      .limit(1)
      .then(rows => rows[0])

    if (!resetToken) {
      return NextResponse.json(
        { valid: false, error: 'Неверный или просроченный токен' },
        { status: 400 }
      )
    }

    // Получаем информацию о пользователе
    const user = await db
      .select({
        email: users.email,
        name: users.name,
      })
      .from(users)
      .where(eq(users.id, resetToken.userId))
      .limit(1)
      .then(rows => rows[0])

    if (!user) {
      return NextResponse.json(
        { valid: false, error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      valid: true,
      email: user.email,
      name: user.name,
    })
  } catch (error) {
    console.error('Ошибка при валидации токена:', error)
    return NextResponse.json(
      { valid: false, error: 'Ошибка при проверке токена' },
      { status: 500 }
    )
  }
}

