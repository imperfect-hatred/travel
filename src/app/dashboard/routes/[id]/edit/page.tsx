'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface RoutePoint {
  id?: string
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
  points: RoutePoint[]
}

export default function EditRoutePage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    isPublic: false,
  })
  const [points, setPoints] = useState<RoutePoint[]>([])

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
      const route = data.route
      
      setFormData({
        title: route.title || '',
        description: route.description || '',
        duration: route.duration ? route.duration.toString() : '',
        isPublic: route.isPublic || false,
      })
      setPoints(route.points || [])
    } catch (error) {
      toast.error('Ошибка при загрузке маршрута')
      router.push('/dashboard/routes')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Название маршрута обязательно')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/routes/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          duration: formData.duration ? parseInt(formData.duration) : null,
          isPublic: formData.isPublic,
          points: points.map((p, index) => ({
            ...p,
            order: p.order || index + 1,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка обновления')
      }

      toast.success('Маршрут обновлен!')
      router.push(`/dashboard/routes/${params.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при обновлении маршрута')
    } finally {
      setSaving(false)
    }
  }

  const addPoint = () => {
    const newDay = points.length > 0 ? Math.max(...points.map(p => p.day)) : 1
    setPoints([
      ...points,
      {
        day: newDay,
        order: points.filter(p => p.day === newDay).length + 1,
        title: '',
        description: null,
        cityId: null,
        countryId: null,
        attractionId: null,
        latitude: null,
        longitude: null,
      },
    ])
  }

  const removePoint = (index: number) => {
    setPoints(points.filter((_, i) => i !== index))
  }

  const updatePoint = (index: number, field: keyof RoutePoint, value: any) => {
    const updated = [...points]
    updated[index] = { ...updated[index], [field]: value }
    setPoints(updated)
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
      <main className="max-w-3xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <Link href={`/dashboard/routes/${params.id}`} className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Назад к маршруту
          </Link>
          
          <h1 className="text-3xl font-bold mb-6">Редактировать маршрут</h1>

          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Название маршрута *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Например: Тур по Парижу"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Описание
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Опишите ваш маршрут..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                    Длительность (дней)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="3"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Публичный маршрут</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Точки маршрута</h2>
                <button
                  type="button"
                  onClick={addPoint}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  + Добавить точку
                </button>
              </div>

              {points.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-600">
                  Нет точек маршрута. Добавьте первую точку.
                </div>
              ) : (
                <div className="space-y-4">
                  {points.map((point, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="1"
                            value={point.day}
                            onChange={(e) => updatePoint(index, 'day', parseInt(e.target.value) || 1)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="День"
                          />
                          <input
                            type="number"
                            min="1"
                            value={point.order}
                            onChange={(e) => updatePoint(index, 'order', parseInt(e.target.value) || 1)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Порядок"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removePoint(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                      <input
                        type="text"
                        value={point.title}
                        onChange={(e) => updatePoint(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                        placeholder="Название точки"
                      />
                      <textarea
                        value={point.description || ''}
                        onChange={(e) => updatePoint(index, 'description', e.target.value || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows={2}
                        placeholder="Описание (необязательно)"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
              <Link
                href={`/dashboard/routes/${params.id}`}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Отмена
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}







