import Database from 'better-sqlite3'
import path from 'path'
import { randomBytes } from 'crypto'

// На Vercel serverless используем /tmp
const isVercel = process.env.VERCEL === '1'
const dbPath = process.env.DATABASE_PATH || 
  (isVercel 
    ? path.join('/tmp', 'database.db')
    : path.join(process.cwd(), 'database.db'))
const sqlite = new Database(dbPath)

/**
 * Создает токен для сброса пароля
 */
export function createPasswordResetToken(userId: string): string {
  // Генерируем случайный токен
  const token = randomBytes(32).toString('hex')
  
  // Токен действителен 1 час
  const expiresAt = Date.now() + 60 * 60 * 1000
  
  // Сохраняем токен в БД
  sqlite.prepare(`
    INSERT INTO password_reset_tokens (id, user_id, token, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    randomBytes(16).toString('hex'),
    userId,
    token,
    expiresAt,
    Date.now()
  )
  
  return token
}

/**
 * Проверяет токен сброса пароля
 */
export function validatePasswordResetToken(token: string): { valid: boolean; userId?: string; error?: string } {
  try {
    const result = sqlite.prepare(`
      SELECT user_id, expires_at, used
      FROM password_reset_tokens
      WHERE token = ?
    `).get(token) as { user_id: string; expires_at: number; used: number } | undefined

    if (!result) {
      return { valid: false, error: 'Токен не найден' }
    }

    if (result.used === 1) {
      return { valid: false, error: 'Токен уже использован' }
    }

    if (result.expires_at < Date.now()) {
      return { valid: false, error: 'Токен истек' }
    }

    return { valid: true, userId: result.user_id }
  } catch (error: any) {
    console.error('Ошибка при проверке токена:', error)
    return { valid: false, error: 'Ошибка при проверке токена' }
  }
}

/**
 * Помечает токен как использованный
 */
export function markTokenAsUsed(token: string): void {
  sqlite.prepare(`
    UPDATE password_reset_tokens
    SET used = 1
    WHERE token = ?
  `).run(token)
}

/**
 * Удаляет истекшие токены
 */
export function cleanupExpiredTokens(): void {
  sqlite.prepare(`
    DELETE FROM password_reset_tokens
    WHERE expires_at < ?
  `).run(Date.now())
}

