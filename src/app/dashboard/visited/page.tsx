'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { VisitedPlaceWithDetails } from '@/lib/db/visited-places'

export default function VisitedPlacesPage() {
  const [places, setPlaces] = useState<VisitedPlaceWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlaces()
  }, [])

  const fetchPlaces = async () => {
    try {
      const response = await fetch('/api/visited-places')
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Ошибка загрузки')
      }
      const data = await response.json()
      setPlaces(data.places || [])
    } catch (error: any) {
      console.error('Ошибка при загрузке посещенных мест:', error)
      toast.error(error.message || 'Ошибка при загрузке посещенных мест')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить это место из посещенных?')) return

    try {
      const response = await fetch(`/api/visited-places?id=${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Ошибка удаления')
      toast.success('Место удалено')
      fetchPlaces()
    } catch (error) {
      toast.error('Ошибка при удалении места')
    }
  }

  const getPlaceName = (place: VisitedPlaceWithDetails) => {
    if (place.attraction?.name) return place.attraction.name
    if (place.city?.name) return place.city.name
    if (place.country?.name) return place.country.name
    return 'Неизвестное место'
  }

  const getPlaceType = (place: VisitedPlaceWithDetails) => {
    if (place.attraction) return 'Достопримечательность'
    if (place.city) return 'Город'
    if (place.country) return 'Страна'
    return 'Место'
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
          <div className="mb-6">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
              ← Назад в личный кабинет
            </Link>
            <h1 className="text-3xl font-bold mb-2">Посещенные места</h1>
            <p className="text-gray-600">Места, которые вы уже посетили</p>
          </div>

          {places.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">Вы еще не добавили посещенные места</p>
              <Link
                href="/countries"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Начать исследовать →
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place) => (
                <div
                  key={place.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {getPlaceType(place)}
                      </span>
                      <h3 className="text-lg font-semibold mt-2">{getPlaceName(place)}</h3>
                    </div>
                    <button
                      onClick={() => handleDelete(place.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                  
                  {place.visitDate && (
                    <p className="text-sm text-gray-600 mb-2">
                      Дата посещения: {new Date(place.visitDate).toLocaleDateString('ru-RU')}
                    </p>
                  )}
                  
                  {place.notes && (
                    <p className="text-sm text-gray-700 mb-4">{place.notes}</p>
                  )}

                  <div className="flex gap-2">
                    {place.country && (
                      <Link
                        href={`/countries/${place.country.name?.toLowerCase()}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Страна →
                      </Link>
                    )}
                    {place.city && (
                      <Link
                        href={`/cities/${place.city.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Город →
                      </Link>
                    )}
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

