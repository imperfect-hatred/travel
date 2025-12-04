'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface RoutePoint {
  id: string
  day: number
  order: number
  title: string
  description: string | null
}

interface Route {
  id: string
  title: string
  description: string | null
  duration: number | null
  isPublic: boolean
  createdAt: string
  points: RoutePoint[]
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchRoutes()
  }, [])

  const fetchRoutes = async () => {
    try {
      const response = await fetch('/api/routes')
      if (!response.ok) throw new Error('Ошибка загрузки')
      const data = await response.json()
      setRoutes(data.routes || [])
    } catch (error) {
      toast.error('Ошибка при загрузке маршрутов')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот маршрут?')) return

    try {
      const response = await fetch(`/api/routes/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Ошибка удаления')
      toast.success('Маршрут удален')
      fetchRoutes()
    } catch (error) {
      toast.error('Ошибка при удалении маршрута')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-600">
        <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            <p>Загрузка...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-600">
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
                ← Назад в личный кабинет
              </Link>
              <h1 className="text-3xl font-bold mb-2">Мои маршруты</h1>
              <p className="text-gray-600">Создавайте и управляйте своими маршрутами путешествий</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/routes/create')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              + Создать маршрут
            </button>
          </div>

          {routes.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">У вас пока нет созданных маршрутов</p>
              <button
                onClick={() => router.push('/dashboard/routes/create')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Создать первый маршрут
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {routes.map((route) => (
                <div
                  key={route.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{route.title}</h3>
                      {route.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{route.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(route.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    {route.duration && (
                      <span>⏱️ {route.duration} дней</span>
                    )}
                    <span className={route.isPublic ? 'text-green-600' : 'text-gray-500'}>
                      {route.isPublic ? '🌐 Публичный' : '🔒 Приватный'}
                    </span>
                  </div>

                  {route.points && route.points.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Точек маршрута: {route.points.length}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/routes/${route.id}`)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Открыть
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/routes/${route.id}/edit`)}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                    >
                      Редактировать
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}








