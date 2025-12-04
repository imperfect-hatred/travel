'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface CountryActionsProps {
  countryName: string
  countryId?: string
}

export function CountryActions({ countryName, countryId }: CountryActionsProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (!session) {
    return (
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <a href="/auth/signin" className="underline">Войдите</a>, чтобы добавлять места в посещенные или желаемые
        </p>
      </div>
    )
  }

  const handleAddToVisited = async () => {
    if (!countryId) {
      toast.error('Функция будет доступна после добавления стран в базу данных')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/visited-places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка добавления')
      }

      toast.success(`${countryName} добавлена в посещенные места!`)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при добавлении в посещенные')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToWishlist = async () => {
    if (!countryId) {
      toast.error('Функция будет доступна после добавления стран в базу данных')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryId, priority: 3 }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка добавления')
      }

      toast.success(`${countryName} добавлена в желаемые направления!`)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при добавлении в желаемые')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6 flex gap-4">
      <button
        onClick={handleAddToVisited}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>✓</span>
        <span>Я был здесь</span>
      </button>
      <button
        onClick={handleAddToWishlist}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>❤</span>
        <span>Хочу посетить</span>
      </button>
    </div>
  )
}

