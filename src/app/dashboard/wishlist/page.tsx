'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { WishlistWithDetails } from '@/lib/db/wishlist'

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/wishlist')
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Ошибка загрузки')
      }
      const data = await response.json()
      setItems(data.items || [])
    } catch (error: any) {
      console.error('Ошибка при загрузке желаемых направлений:', error)
      toast.error(error.message || 'Ошибка при загрузке желаемых направлений')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить это место из желаемых направлений?')) return

    try {
      const response = await fetch(`/api/wishlist?id=${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Ошибка удаления')
      toast.success('Место удалено')
      fetchItems()
    } catch (error) {
      toast.error('Ошибка при удалении места')
    }
  }

  const getItemName = (item: WishlistWithDetails) => {
    if (item.attraction?.name) return item.attraction.name
    if (item.city?.name) return item.city.name
    if (item.country?.name) return item.country.name
    return 'Неизвестное место'
  }

  const getItemType = (item: WishlistWithDetails) => {
    if (item.attraction) return 'Достопримечательность'
    if (item.city) return 'Город'
    if (item.country) return 'Страна'
    return 'Место'
  }

  const getPriorityColor = (priority: number | null) => {
    const p = priority ?? 1
    if (p >= 4) return 'bg-red-100 text-red-800'
    if (p >= 3) return 'bg-orange-100 text-orange-800'
    if (p >= 2) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
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
            <h1 className="text-3xl font-bold mb-2">Желаемые направления</h1>
            <p className="text-gray-600">Места, которые вы хотите посетить</p>
          </div>

          {items.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">Вы еще не добавили желаемые направления</p>
              <Link
                href="/countries"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Начать исследовать →
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {getItemType(item)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(item.priority)}`}>
                          Приоритет: {item.priority ?? 1}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold">{getItemName(item)}</h3>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                  
                  {item.notes && (
                    <p className="text-sm text-gray-700 mb-4">{item.notes}</p>
                  )}

                  <div className="flex gap-2">
                    {item.country && (
                      <Link
                        href={`/countries/${item.country.name?.toLowerCase()}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Страна →
                      </Link>
                    )}
                    {item.city && (
                      <Link
                        href={`/cities/${item.city.id}`}
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

