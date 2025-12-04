'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import toast from 'react-hot-toast'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Проверяем, пришли ли мы после регистрации
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      toast.success('Регистрация прошла успешно! Теперь войдите в аккаунт.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      toast.loading('Выполняется вход...', { id: 'signin' })
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Неверный email или пароль', { id: 'signin' })
        setError('Неверный email или пароль')
      } else {
        toast.success('Добро пожаловать!', { id: 'signin' })
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      toast.error('Ошибка входа', { id: 'signin' })
      setError('Ошибка входа')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 text-gray-600">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Вход в аккаунт</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ваш email"
              required
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 text-sm font-medium">
                Пароль
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Забыли пароль?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ваш пароль"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Нет аккаунта?{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              Зарегистрироваться
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