import { db } from './index'
import { users } from './schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

/**
 * Создает нового пользователя
 */
export function createUser(email: string, password: string, name?: string) {
  try {
    const now = new Date()
    const userId = randomUUID()
    
    const result = db.insert(users).values({
      id: userId,
      email: email.toLowerCase().trim(),
      password,
      name: name?.trim() || email.split('@')[0],
      role: 'USER',
      createdAt: now,
      updatedAt: now,
    }).returning().get()

    if (!result) {
      throw new Error('Не удалось создать пользователя')
    }

    return result
  } catch (error: any) {
    // Проверяем на дубликат email
    if (error.message?.includes('UNIQUE constraint') || error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('Пользователь с таким email уже существует')
    }
    throw error
  }
}

/**
 * Получает пользователя по email
 */
export function getUserByEmail(email: string) {
  try {
    return db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1)
      .get()
  } catch (error: any) {
    console.error('Ошибка при получении пользователя:', error)
    throw error
  }
}

/**
 * Получает пользователя по ID
 */
export function getUserById(id: string) {
  try {
    return db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
      .get()
  } catch (error: any) {
    console.error('Ошибка при получении пользователя по ID:', error)
    return null
  }
}

/**
 * Проверяет существование пользователя
 */
export function userExists(email: string): boolean {
  try {
    const user = getUserByEmail(email)
    return !!user
  } catch {
    return false
  }
}

