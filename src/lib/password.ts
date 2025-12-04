import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

/**
 * Хэширует пароль с использованием bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Сравнивает пароль с хэшем
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

/**
 * Проверяет сложность пароля
 */
export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Пароль должен содержать минимум 8 символов')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну заглавную букву')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну строчную букву')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну цифру')
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы один специальный символ')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Генерирует случайный токен для сброса пароля
 */
export function generateResetToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Создает URL для сброса пароля
 */
export function createResetUrl(token: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  return `${baseUrl}/auth/reset-password/${token}`
}

// Экспортируем старые функции для обратной совместимости
export const verifyPassword = comparePassword
export const validatePasswordStrength = validatePassword
