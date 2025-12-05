import { NextResponse } from 'next/server'
import Database from 'better-sqlite3'
import path from 'path'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

// Путь к базе данных
// На Vercel serverless используем /tmp, так как файловая система read-only
const isVercel = process.env.VERCEL === '1'
const dbPath = process.env.DATABASE_PATH || 
  (isVercel 
    ? path.join('/tmp', 'database.db')
    : path.join(process.cwd(), 'database.db'))

// Функция для получения подключения к БД
function getDb() {
  const db = new Database(dbPath)
  db.pragma('foreign_keys = ON')
  
  // Создаем таблицу users, если её нет
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      password TEXT NOT NULL,
      avatar TEXT,
      bio TEXT,
      role TEXT NOT NULL DEFAULT 'USER',
      created_at INTEGER NOT NULL,
      updated_at INTEGER
    )
  `)
  
  return db
}

export async function POST(request: Request) {
  let db: ReturnType<typeof getDb> | null = null
  
  try {
    // Парсим тело запроса
    const body = await request.json()
    const { email, password, name } = body

    console.log('📝 Регистрация:', { email, name: name || 'не указано' })

    // Валидация
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      )
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Email и пароль должны быть строками' },
        { status: 400 }
      )
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Некорректный формат email' },
        { status: 400 }
      )
    }

    // Валидация пароля
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      )
    }

    // Подключаемся к БД
    db = getDb()

    // Проверяем существование пользователя
    const existingUser = db
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(email.toLowerCase().trim()) as { id: string } | undefined

    if (existingUser) {
      console.log('❌ Пользователь уже существует:', email)
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      )
    }

    // Хешируем пароль
    console.log('🔐 Хеширование пароля...')
    const hashedPassword = await bcrypt.hash(password, 12)

    // Создаем пользователя
    const userId = randomUUID()
    const now = Date.now()
    const userName = name?.trim() || email.split('@')[0]

    console.log('💾 Создание пользователя в БД...')
    db.prepare(`
      INSERT INTO users (id, email, name, password, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      email.toLowerCase().trim(),
      userName,
      hashedPassword,
      'USER',
      now,
      now
    )

    console.log('✅ Пользователь создан успешно:', userId)

    // Получаем созданного пользователя
    const user = db
      .prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?')
      .get(userId) as { id: string; email: string; name: string | null; role: string; created_at: number } | undefined

    if (!user) {
      return NextResponse.json(
        { error: 'Ошибка при получении созданного пользователя' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        message: 'Регистрация прошла успешно'
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error('❌ Ошибка при регистрации:', error)
    console.error('Детали ошибки:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    })
    
    return NextResponse.json(
      { 
        error: 'Ошибка сервера при регистрации',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  } finally {
    // Закрываем подключение к БД
    if (db) {
      db.close()
    }
  }
}

