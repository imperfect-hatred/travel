import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { eq } from 'drizzle-orm'
import * as schema from './schema'
import path from 'path'
import fs from 'fs'
import { randomUUID } from 'crypto'

// Создаем подключение к базе данных
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'database.db')

// Создаем файл базы данных, если его нет
if (!fs.existsSync(dbPath)) {
  console.log('Создание нового файла базы данных:', dbPath)
  // Файл будет создан автоматически при первом подключении
}

const sqlite = new Database(dbPath)

// Включаем foreign keys
sqlite.pragma('foreign_keys = ON')

// Проверяем существование таблиц и создаем, если нужно
try {
  const requiredTables = [
    'users',
    'password_reset_tokens',
    'continents',
    'countries',
    'cities',
    'attractions',
    'routes',
    'route_points',
    'reviews',
    'ratings',
    'travel_notes',
    'visited_places',
    'wishlists',
    'articles',
  ]

  const missingTables = requiredTables.filter(tableName => {
    const table = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(tableName)
    return !table
  })

  if (missingTables.length > 0) {
    console.warn(`⚠️  Отсутствуют таблицы: ${missingTables.join(', ')}. Создание...`)
    const { setupDatabase } = require('./setup')
    setupDatabase()
  }

  // Выполняем миграцию для добавления полей сброса пароля
  try {
    const { migratePasswordReset } = require('./migrate-password-reset')
    migratePasswordReset()
  } catch (migrateError) {
    console.warn('⚠️  Ошибка при миграции сброса пароля (возможно, уже выполнена):', migrateError)
  }
} catch (error) {
  console.error('Ошибка при проверке таблиц:', error)
}

// Создаем подключение Drizzle с явным указанием схемы
export const db = drizzle(sqlite, { 
  schema,
  // Отключаем кэширование для разработки
  logger: process.env.NODE_ENV === 'development',
})

// Функции для работы с пользователями экспортируются из users.ts
// Импортируйте их так: import { createUser, getUserByEmail } from '@/lib/db/users'

// Экспортируем все таблицы для удобства
export * from './schema'

