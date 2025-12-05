import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, passwordResetTokens } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { generateResetToken, createResetUrl } from '@/lib/password'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Валидация email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Пожалуйста, введите корректный email адрес' },
        { status: 400 }
      )
    }

    // Ищем пользователя по email (явно указываем нужные поля)
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
      })
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1)
      .then(rows => rows[0])
      
    // Для безопасности всегда возвращаем успех, даже если пользователь не найден
    if (!user) {
      console.log(`Запрос сброса пароля для несуществующего email: ${email}`)
      return NextResponse.json(
        {
          success: true,
          message: 'Если аккаунт с таким email существует, письмо отправлено'
        },
        { status: 200 }
      )
    }

    // Генерируем токен сброса
    const resetToken = generateResetToken()
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 час

    // Сохраняем токен в отдельной таблице (более безопасный подход)
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token: resetToken,
      expires: resetTokenExpiry,
      used: false,
      createdAt: new Date(),
    })

    // Создаем URL для сброса
    const resetUrl = createResetUrl(resetToken)

    // Отправляем email
    const emailSent = await sendPasswordResetEmail(
      user.email,
      resetUrl,
      user.name || undefined
    )

    // Не возвращаем ошибку, если email не отправлен (для безопасности)
    // Всегда показываем успех, даже если email не отправился
    // Это предотвращает перебор email адресов
    if (!emailSent) {
      console.warn('⚠️ Email не был отправлен, но показываем успех для безопасности')
    }

    // Логируем успешный запрос
    console.log(`Ссылка для сброса пароля отправлена на: ${user.email}`)

    return NextResponse.json({
      success: true,
      message: 'Письмо с инструкциями отправлено на ваш email',
    })
  } catch (error) {
    console.error('Ошибка при обработке запроса сброса пароля:', error)
    return NextResponse.json(
      { error: 'Произошла ошибка при обработке запроса' },
      { status: 500 }
    )
  }
}
