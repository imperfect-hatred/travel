'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import toast from 'react-hot-toast'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Валидация на клиенте
      if (!email || !password) {
        toast.error('Заполните все обязательные поля')
        setError('Заполните все обязательные поля')
        setLoading(false)
        return
      }

      if (password !== confirmPassword) {
        toast.error('Пароли не совпадают')
        setError('Пароли не совпадают')
        setLoading(false)
        return
      }

      if (password.length < 6) {
        toast.error('Пароль должен быть не менее 6 символов')
        setError('Пароль должен быть не менее 6 символов')
        setLoading(false)
        return
      }

      if (!email.includes('@') || !email.includes('.')) {
        toast.error('Введите корректный email')
        setError('Введите корректный email')
        setLoading(false)
        return
      }

      toast.loading('Регистрация...', { id: 'register' })

      console.log('📤 Отправка запроса регистрации...')
      
      // Регистрация через API
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name: name || undefined })
      })

      console.log('📥 Статус ответа:', response.status)
      
      let data
      try {
        const text = await response.text()
        console.log('📥 Текст ответа:', text)
        data = JSON.parse(text)
        console.log('📥 Данные ответа:', data)
      } catch (jsonError) {
        console.error('❌ Ошибка парсинга JSON:', jsonError)
        throw new Error('Сервер вернул неверный формат данных')
      }

      if (!response.ok) {
        toast.error(data.error || `Ошибка регистрации (${response.status})`, { id: 'register' })
        throw new Error(data.error || `Ошибка регистрации (${response.status})`)
      }

      toast.success('Регистрация прошла успешно!', { id: 'register' })
      console.log('✅ Регистрация успешна!')

      // Автоматический вход после регистрации
      toast.loading('Выполняется вход...', { id: 'signin' })
      console.log('🔐 Выполняем автоматический вход...')
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Регистрация успешна, но вход не удался. Войдите вручную.', { id: 'signin' })
        console.log('⚠️ Регистрация успешна, но вход не удался:', result.error)
        router.push('/auth/signin?registered=true')
      } else {
        toast.success('Добро пожаловать!', { id: 'signin' })
        console.log('✅ Успешный вход, перенаправляем...')
        router.push('/')
        router.refresh()
      }
    } catch (error: any) {
      console.error('❌ Ошибка при регистрации:', error)
      toast.error(error.message || 'Ошибка регистрации. Попробуйте еще раз.', { id: 'register' })
      setError(error.message || 'Ошибка регистрации. Попробуйте еще раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Регистрация</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Имя (необязательно)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ваше имя"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Пароль <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Минимум 6 символов"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Подтвердите пароль <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Повторите пароль"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Уже есть аккаунт?{' '}
            <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-medium">
              Войти
            </Link>
          </p>
          <p className="mt-2">
            <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
              ← На главную
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
