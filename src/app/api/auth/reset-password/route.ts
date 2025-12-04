import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, passwordResetTokens } from '@/lib/db/schema'
import { eq, and, gt } from 'drizzle-orm'
import { hashPassword, comparePassword, validatePassword } from '@/lib/password'
import { sendPasswordChangedEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { token, password, confirmPassword } = await request.json()

    // Валидация входных данных
    if (!token) {
      return NextResponse.json(
        { error: 'Неверный токен сброса пароля' },
        { status: 400 }
      )
    }

    if (!password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Пожалуйста, заполните все поля' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Пароли не совпадают' },
        { status: 400 }
      )
    }

    // Проверка сложности пароля
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { 
          error: 'Пароль не соответствует требованиям безопасности',
          details: passwordValidation.errors 
        },
        { status: 400 }
      )
    }

    // Ищем токен сброса
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
        { error: 'Неверный или просроченный токен сброса пароля' },
        { status: 400 }
      )
    }

    // Получаем пользователя
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, resetToken.userId))
      .limit(1)
      .then(rows => rows[0])

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    // Проверяем, что новый пароль отличается от старого
    const isSamePassword = await comparePassword(password, user.password || '')
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'Новый пароль не должен совпадать со старым' },
        { status: 400 }
      )
    }

    // Хэшируем новый пароль
    const hashedPassword = await hashPassword(password)

    // Обновляем пароль
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    // Помечаем токен как использованный
    await db
      .update(passwordResetTokens)
      .set({
        used: true,
      })
      .where(eq(passwordResetTokens.token, token))

    // Отправляем email с подтверждением
    await sendPasswordChangedEmail(user.email, user.name || undefined)

    // Логируем успешный сброс
    console.log(`Пароль успешно сброшен для пользователя: ${user.email}`)

    return NextResponse.json({
      success: true,
      message: 'Пароль успешно изменен. Теперь вы можете войти с новым паролем.',
    })
  } catch (error) {
    console.error('Ошибка при сбросе пароля:', error)
    return NextResponse.json(
      { error: 'Произошла ошибка при сбросе пароля' },
      { status: 500 }
    )
  }
}
