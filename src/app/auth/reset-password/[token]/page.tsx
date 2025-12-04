'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [valid, setValid] = useState(false)
  const [success, setSuccess] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const router = useRouter()
  const params = useParams()
  const token = params?.token as string

  // Валидация токена при загрузке
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        toast.error('Токен не найден')
        router.push('/auth/forgot-password')
        return
      }

      try {
        const response = await fetch(`/api/auth/validate-reset-token?token=${token}`)
        const data = await response.json()

        if (data.valid) {
          setValid(true)
        } else {
          toast.error(data.error || 'Неверный или просроченный токен')
          router.push('/auth/forgot-password')
        }
      } catch (error) {
        console.error('Token validation error:', error)
        toast.error('Ошибка при проверке токена')
        router.push('/auth/forgot-password')
      } finally {
        setValidating(false)
      }
    }

    validateToken()
  }, [token, router])

  const validatePasswordStrength = (pwd: string): string[] => {
    const errors: string[] = []

    if (pwd.length < 8) {
      errors.push('Пароль должен содержать минимум 8 символов')
    }

    if (!/[A-Z]/.test(pwd)) {
      errors.push('Пароль должен содержать хотя бы одну заглавную букву')
    }

    if (!/[a-z]/.test(pwd)) {
      errors.push('Пароль должен содержать хотя бы одну строчную букву')
    }

    if (!/[0-9]/.test(pwd)) {
      errors.push('Пароль должен содержать хотя бы одну цифру')
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      errors.push('Пароль должен содержать хотя бы один специальный символ')
    }

    return errors
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (value) {
      const errors = validatePasswordStrength(value)
      setPasswordErrors(errors)
    } else {
      setPasswordErrors([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!password || !confirmPassword) {
        toast.error('Заполните все поля')
        setLoading(false)
        return
      }

      if (password !== confirmPassword) {
        toast.error('Пароли не совпадают')
        setLoading(false)
        return
      }

      const errors = validatePasswordStrength(password)
      if (errors.length > 0) {
        toast.error('Пароль не соответствует требованиям безопасности')
        setPasswordErrors(errors)
        setLoading(false)
        return
      }

      toast.loading('Установка нового пароля...', { id: 'reset-password' })

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password, confirmPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.details 
          ? `${data.error}: ${Array.isArray(data.details) ? data.details.join(', ') : data.details}`
          : data.error || 'Ошибка при сбросе пароля'
        toast.error(errorMessage, { id: 'reset-password' })
        return
      }

      toast.success('Пароль успешно изменен!', { id: 'reset-password' })
      setSuccess(true)

      // Перенаправляем на страницу входа через 2 секунды
      setTimeout(() => {
        router.push('/auth/signin')
      }, 2000)
    } catch (error: any) {
      console.error('Reset password error:', error)
      toast.error('Ошибка при сбросе пароля', { id: 'reset-password' })
    } finally {
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Проверка токена...</p>
        </div>
      </div>
    )
  }

  if (!valid) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            TravelGuide
          </h1>
          <h2 className="text-2xl font-semibold text-gray-800">
            Установка нового пароля
          </h2>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-xl sm:px-10 border border-gray-200">
          {success ? (
            <div className="text-center">
              <div className="mb-4 text-green-600">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-700 mb-4 text-lg font-medium">
                Пароль успешно изменен!
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Перенаправление на страницу входа...
              </p>
              <Link
                href="/auth/signin"
                className="inline-block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Перейти к входу
              </Link>
            </div>
          ) : (
            <>
              <p className="text-gray-600 text-center mb-6">
                Введите новый пароль для вашего аккаунта.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Новый пароль <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 
                             placeholder-gray-500 text-gray-900 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             focus:z-10 sm:text-sm transition-colors"
                    placeholder="Минимум 8 символов"
                    required
                    disabled={loading}
                  />
                  {passwordErrors.length > 0 && (
                    <ul className="mt-2 text-sm text-red-600 space-y-1">
                      {passwordErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  )}
                  {password && passwordErrors.length === 0 && (
                    <p className="mt-2 text-sm text-green-600">✓ Пароль соответствует требованиям</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Подтвердите пароль <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 
                             placeholder-gray-500 text-gray-900 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             focus:z-10 sm:text-sm transition-colors"
                    placeholder="Повторите пароль"
                    required
                    disabled={loading}
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">Пароли не совпадают</p>
                  )}
                  {confirmPassword && password === confirmPassword && password && (
                    <p className="mt-2 text-sm text-green-600">✓ Пароли совпадают</p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-2">Требования к паролю:</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Минимум 8 символов</li>
                    <li>• Хотя бы одна заглавная буква</li>
                    <li>• Хотя бы одна строчная буква</li>
                    <li>• Хотя бы одна цифра</li>
                    <li>• Хотя бы один специальный символ</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={loading || passwordErrors.length > 0 || password !== confirmPassword}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent 
                           text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Установка...
                    </>
                  ) : (
                    'Установить новый пароль'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/auth/signin"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← Вернуться к входу
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
