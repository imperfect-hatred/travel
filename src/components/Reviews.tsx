'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

interface Review {
  id: string
  content: string
  rating: number
  userId: string
  createdAt: string
  user?: {
    name: string | null;
    avatar: string | null;
  }
}

interface ReviewsProps {
  countryId?: string
  cityId?: string
  attractionId?: string
}

export function Reviews({ countryId, cityId, attractionId }: ReviewsProps) {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    content: '',
    rating: 5,
  })

  useEffect(() => {
    fetchReviews()
  }, [countryId, cityId, attractionId])

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams()
      if (countryId) params.append('countryId', countryId)
      if (cityId) params.append('cityId', cityId)
      if (attractionId) params.append('attractionId', attractionId)

      const response = await fetch(`/api/reviews?${params.toString()}`)
      if (!response.ok) throw new Error('Ошибка загрузки')
      const data = await response.json()
      setReviews(data.reviews || [])
    } catch (error) {
      toast.error('Ошибка при загрузке отзывов')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.content.trim()) {
      toast.error('Введите текст отзыва')
      return
    }

    // Проверяем, что указан хотя бы один ID
    if (!countryId && !cityId && !attractionId) {
      toast.error('Не указано место для отзыва')
      return
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: formData.content,
          rating: formData.rating,
          countryId: countryId || undefined,
          cityId: cityId || undefined,
          attractionId: attractionId || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания')
      }

      toast.success('Отзыв добавлен!')
      setFormData({ content: '', rating: 5 })
      setShowForm(false)
      fetchReviews()
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при создании отзыва')
    }
  }

  if (loading) {
    return <div className="text-gray-600">Загрузка отзывов...</div>
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Отзывы</h2>
        {session && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {showForm ? 'Отмена' : '+ Добавить отзыв'}
          </button>
        )}
      </div>

      {!session && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <a href="/auth/signin" className="underline">Войдите</a>, чтобы оставить отзыв
          </p>
        </div>
      )}

      {showForm && session && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="mb-4">
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
              Рейтинг
            </label>
            <select
              id="rating"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value={5}>5 - Отлично</option>
              <option value={4}>4 - Хорошо</option>
              <option value={3}>3 - Нормально</option>
              <option value={2}>2 - Плохо</option>
              <option value={1}>1 - Ужасно</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Отзыв
            </label>
            <textarea
              id="content"
              rows={4}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Поделитесь своими впечатлениями..."
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Отправить отзыв
          </button>
        </form>
      )}

      {reviews.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">Пока нет отзывов. Будьте первым!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              {console.log("Review Rating:", review.rating)}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-800">
                      {review.user?.name || review.user?.email || 'Анонимный пользователь'}
                    </span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-5 w-5 ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.695h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.695l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              </div>
              <p className="text-gray-700">{review.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

