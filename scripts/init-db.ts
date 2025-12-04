import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../src/lib/db/schema'
import path from 'path'

const dbPath = path.join(process.cwd(), 'database.db')
const sqlite = new Database(dbPath)
sqlite.pragma('foreign_keys = ON')

const db = drizzle(sqlite, { schema })

async function init() {
  try {
    // Проверяем существование таблицы
    const result = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get()
    
    if (result) {
      console.log('✅ База данных уже инициализирована')
      return
    }

    console.log('📦 Создание таблиц...')
    console.log('⚠️  Используйте npm run db:push для создания всех таблиц из схемы')
    console.log('   Или выполните: npx drizzle-kit push')
    
  } catch (error) {
    console.error('Ошибка:', error)
  } finally {
    sqlite.close()
  }
}

init()

