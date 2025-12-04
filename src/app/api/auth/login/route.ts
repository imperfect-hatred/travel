import { NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/db/users'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Валидация
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      )
    }

    // Получаем пользователя
    const user = getUserByEmail(email)

    if (!user) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      )
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      )
    }

    // Возвращаем пользователя без пароля
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        user: userWithoutPassword,
        message: 'Вход выполнен успешно'
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('Login error:', error)
    
    return NextResponse.json(
      { 
        error: 'Ошибка сервера при входе',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

