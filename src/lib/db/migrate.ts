import { db } from './index'
import * as schema from './schema'
import { sql } from 'drizzle-orm'

/**
 * Создает все таблицы в базе данных, если их нет
 * Используется для первоначальной настройки БД
 */
export function createTables() {
  try {
    // Проверяем существование таблицы users
    const result = db
      .select()
      .from(schema.users)
      .limit(1)
      .all()

    console.log('Таблицы уже существуют')
    return true
  } catch (error: any) {
    // Если таблицы не существуют, создаем их через SQL
    console.log('Создание таблиц...')
    
    try {
      // Создаем таблицу users
      db.run(sql`
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

      console.log('✅ Таблицы созданы успешно')
      return true
    } catch (createError: any) {
      console.error('Ошибка при создании таблиц:', createError)
      return false
    }
  }
}

