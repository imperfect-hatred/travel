/**
 * Скрипт для проверки настроек EmailJS
 * Запустите: npx tsx scripts/check-emailjs.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Загружаем переменные из .env.local
config({ path: resolve(process.cwd(), '.env.local') })

console.log('🔍 Проверка настроек EmailJS...\n')

const emailjsPublicKey = process.env.EMAILJS_PUBLIC_KEY?.trim()
const emailjsServiceId = process.env.EMAILJS_SERVICE_ID?.trim()
const emailjsTemplateId = process.env.EMAILJS_TEMPLATE_ID?.trim()

console.log('Переменные окружения:')
console.log('  EMAILJS_PUBLIC_KEY:', emailjsPublicKey ? `✓ установлен (${emailjsPublicKey.length} символов)` : '✗ НЕ УСТАНОВЛЕН')
console.log('  EMAILJS_SERVICE_ID:', emailjsServiceId ? `✓ установлен (${emailjsServiceId.length} символов)` : '✗ НЕ УСТАНОВЛЕН')
console.log('  EMAILJS_TEMPLATE_ID:', emailjsTemplateId ? `✓ установлен (${emailjsTemplateId.length} символов)` : '✗ НЕ УСТАНОВЛЕН')

if (!emailjsPublicKey || !emailjsServiceId || !emailjsTemplateId) {
  console.log('\n❌ Не все переменные установлены!')
  console.log('\n📝 Инструкция:')
  console.log('1. Убедитесь, что файл .env.local существует в корне проекта')
  console.log('2. Добавьте следующие строки (без пробелов вокруг =):')
  console.log('   EMAILJS_PUBLIC_KEY=ваш-public-key')
  console.log('   EMAILJS_SERVICE_ID=ваш-service-id')
  console.log('   EMAILJS_TEMPLATE_ID=ваш-template-id')
  console.log('3. Перезапустите сервер разработки (npm run dev)')
  process.exit(1)
}

// Проверяем формат
console.log('\nПроверка формата:')
if (emailjsPublicKey && !emailjsPublicKey.startsWith('user_') && emailjsPublicKey.length < 10) {
  console.log('  ⚠️  EMAILJS_PUBLIC_KEY: необычный формат (обычно длинная строка)')
}
if (emailjsServiceId && !emailjsServiceId.startsWith('service_')) {
  console.log('  ⚠️  EMAILJS_SERVICE_ID: должен начинаться с "service_"')
}
if (emailjsTemplateId && !emailjsTemplateId.startsWith('template_')) {
  console.log('  ⚠️  EMAILJS_TEMPLATE_ID: должен начинаться с "template_"')
}

console.log('\n✅ Все переменные установлены!')
console.log('\n💡 Если письма все еще не отправляются:')
console.log('   1. Проверьте правильность ключей в EmailJS Dashboard')
console.log('   2. Убедитесь, что шаблон использует переменные: {{to_email}}, {{subject}}, {{message_html}}')
console.log('   3. Проверьте консоль сервера при отправке запроса')

