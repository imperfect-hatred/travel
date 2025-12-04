import { db } from './index'
import * as schema from './schema'

/**
 * Инициализация базы данных - создание таблиц если их нет
 * Этот файл можно использовать для первоначальной настройки БД
 */
export function initDatabase() {
  try {
    // Проверяем существование таблицы users
    const result = db
      .select()
      .from(schema.users)
      .limit(1)
      .all()

    console.log('База данных уже инициализирована')
    return true
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error)
    return false
  }
}

// Если файл запускается напрямую
if (require.main === module) {
  initDatabase()
}

