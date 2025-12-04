import Database from 'better-sqlite3'
import path from 'path'

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'database.db')
const sqlite = new Database(dbPath)

/**
 * Миграция для добавления полей сброса пароля в таблицу users
 * и создания таблицы password_reset_tokens
 */
export function migratePasswordReset() {
  try {
    sqlite.pragma('foreign_keys = ON')

    // Проверяем, существует ли колонка reset_token в users
    const tableInfo = sqlite.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>
    const hasResetToken = tableInfo.some(col => col.name === 'reset_token')

    if (!hasResetToken) {
      console.log('📦 Добавление полей сброса пароля в таблицу users...')
      
      // Добавляем колонки в таблицу users (если их нет)
      sqlite.exec(`
        ALTER TABLE users ADD COLUMN reset_token TEXT;
        ALTER TABLE users ADD COLUMN reset_token_expiry INTEGER;
        ALTER TABLE users ADD COLUMN reset_token_created_at INTEGER;
      `)

      // Создаем индексы
      sqlite.exec(`
        CREATE INDEX IF NOT EXISTS email_idx ON users(email);
        CREATE INDEX IF NOT EXISTS reset_token_idx ON users(reset_token);
      `)

      console.log('✅ Поля сброса пароля добавлены в таблицу users')
    } else {
      console.log('✅ Поля сброса пароля уже существуют в таблице users')
    }

    // Проверяем, существует ли таблица password_reset_tokens
    const tableExists = sqlite.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='password_reset_tokens'
    `).get()

    if (!tableExists) {
      console.log('📦 Создание таблицы password_reset_tokens...')
      
      sqlite.exec(`
        CREATE TABLE password_reset_tokens (
          id TEXT PRIMARY KEY NOT NULL,
          user_id TEXT NOT NULL,
          token TEXT NOT NULL UNIQUE,
          expires INTEGER NOT NULL,
          used INTEGER DEFAULT 0,
          created_at INTEGER NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS token_idx ON password_reset_tokens(token);
        CREATE INDEX IF NOT EXISTS user_id_idx ON password_reset_tokens(user_id);
      `)

      console.log('✅ Таблица password_reset_tokens создана')
    } else {
      console.log('✅ Таблица password_reset_tokens уже существует')
      
      // Проверяем структуру таблицы и исправляем, если нужно
      const tableInfo = sqlite.prepare("PRAGMA table_info(password_reset_tokens)").all() as Array<{ name: string }>
      const hasExpires = tableInfo.some(col => col.name === 'expires')
      const hasExpiresAt = tableInfo.some(col => col.name === 'expires_at')
      
      if (hasExpiresAt && !hasExpires) {
        console.log('📦 Переименование колонки expires_at в expires...')
        // SQLite не поддерживает ALTER TABLE RENAME COLUMN напрямую, нужно пересоздать таблицу
        try {
          sqlite.exec(`
            CREATE TABLE password_reset_tokens_new (
              id TEXT PRIMARY KEY NOT NULL,
              user_id TEXT NOT NULL,
              token TEXT NOT NULL UNIQUE,
              expires INTEGER NOT NULL,
              used INTEGER DEFAULT 0,
              created_at INTEGER NOT NULL,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
            
            INSERT INTO password_reset_tokens_new (id, user_id, token, expires, used, created_at)
            SELECT id, user_id, token, expires_at, used, created_at
            FROM password_reset_tokens;
            
            DROP TABLE password_reset_tokens;
            ALTER TABLE password_reset_tokens_new RENAME TO password_reset_tokens;
            
            CREATE INDEX IF NOT EXISTS token_idx ON password_reset_tokens(token);
            CREATE INDEX IF NOT EXISTS user_id_idx ON password_reset_tokens(user_id);
          `)
          console.log('✅ Колонка expires_at переименована в expires')
        } catch (renameError: any) {
          console.warn('⚠️  Не удалось переименовать колонку (возможно, таблица пустая):', renameError.message)
        }
      } else if (!hasExpires && !hasExpiresAt) {
        // Если нет ни expires, ни expires_at, добавляем expires
        console.log('📦 Добавление колонки expires...')
        try {
          sqlite.exec(`
            ALTER TABLE password_reset_tokens ADD COLUMN expires INTEGER NOT NULL DEFAULT 0;
          `)
          console.log('✅ Колонка expires добавлена')
        } catch (addError: any) {
          console.warn('⚠️  Не удалось добавить колонку:', addError.message)
        }
      } else {
        console.log('✅ Структура таблицы password_reset_tokens корректна')
      }
    }

    return true
  } catch (error: any) {
    // Если колонка уже существует, это нормально
    if (error.message?.includes('duplicate column name') || error.message?.includes('already exists')) {
      console.log('✅ Миграция уже выполнена')
      return true
    }
    console.error('❌ Ошибка при миграции:', error)
    throw error
  }
}

// Выполняем миграцию при импорте
if (typeof require !== 'undefined' && require.main === module) {
  migratePasswordReset()
}

