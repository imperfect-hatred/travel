'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface RoutePoint {
  id: string
  day: number
  order: number
  title: string
  description: string | null
  cityId: string | null
  countryId: string | null
  attractionId: string | null
  latitude: number | null
  longitude: number | null
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

export default function RouteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [route, setRoute] = useState<Route | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchRoute()
    }
  }, [params.id])

  const fetchRoute = async () => {
    try {
      const response = await fetch(`/api/routes/${params.id}`)
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Маршрут не найден')
          router.push('/dashboard/routes')
          return
        }
        throw new Error('Ошибка загрузки')
      }
      const data = await response.json()
      setRoute(data.route)
    } catch (error) {
      toast.error('Ошибка при загрузке маршрута')
      router.push('/dashboard/routes')
    } finally {
      setLoading(false)
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

  if (!route) {
    return null
  }

  // Группируем точки по дням
  const pointsByDay = route.points.reduce((acc: Record<number, RoutePoint[]>, point) => {
    const day = point.day || 1
    if (!acc[day]) acc[day] = []
    acc[day].push(point)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50 text-gray-600">
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <Link href="/dashboard/routes" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Назад к маршрутам
          </Link>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{route.title}</h1>
                {route.description && (
                  <p className="text-gray-600 mb-4">{route.description}</p>
                )}
              </div>
              <button
                onClick={() => router.push(`/dashboard/routes/${route.id}/edit`)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Редактировать
              </button>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
              {route.duration && (
                <span>⏱️ {route.duration} дней</span>
              )}
              <span className={route.isPublic ? 'text-green-600' : 'text-gray-500'}>
                {route.isPublic ? '🌐 Публичный' : '🔒 Приватный'}
              </span>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Детали маршрута</h2>
              {Object.keys(pointsByDay).length > 0 ? (
                Object.entries(pointsByDay)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([day, points]) => (
                    <div key={day} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-medium mb-3">День {day}</h3>
                      <div className="space-y-3">
                        {points
                          .sort((a, b) => a.order - b.order)
                          .map((point) => (
                            <div key={point.id} className="pl-4 border-l-2 border-blue-200">
                              <h4 className="font-semibold text-gray-800">{point.title}</h4>
                              {point.description && (
                                <p className="text-gray-600 text-sm mt-1">{point.description}</p>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <p className="text-gray-600">Точки маршрута еще не добавлены</p>
                  <button
                    onClick={() => router.push(`/dashboard/routes/${route.id}/edit`)}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Добавить точки маршрута
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}







