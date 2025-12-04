import { migratePasswordReset } from '../src/lib/db/migrate-password-reset'

try {
  migratePasswordReset()
  console.log('✅ Миграция завершена успешно')
  process.exit(0)
} catch (error) {
  console.error('❌ Ошибка при миграции:', error)
  process.exit(1)
}

