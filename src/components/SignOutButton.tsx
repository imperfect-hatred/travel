'use client'

import { signOut } from 'next-auth/react'
import toast from 'react-hot-toast'

export function SignOutButton() {
  const handleSignOut = async () => {
    toast.loading('Выход из аккаунта...', { id: 'signout' })
    
    try {
      // Выполняем выход через NextAuth без автоматического редиректа
      await signOut({ 
        redirect: false,
        callbackUrl: '/'
      })
      
      // Показываем успешное сообщение
      toast.success('Вы успешно вышли из аккаунта', { id: 'signout' })
      
      // Используем window.location для полного обновления страницы
      // Это гарантирует сброс всего состояния и сессии
      setTimeout(() => {
        window.location.href = '/'
      }, 500)
      
    } catch (error: any) {
      console.error('Sign out error:', error)
      
      // Если NextAuth signOut не сработал, используем API endpoint
      try {
        const response = await fetch('/api/auth/signout', { 
          method: 'POST',
          credentials: 'include'
        })
        
        if (response.ok) {
          toast.success('Вы успешно вышли из аккаунта', { id: 'signout' })
          setTimeout(() => {
            window.location.href = '/'
          }, 500)
        } else {
          throw new Error('API signout failed')
        }
      } catch (apiError) {
        console.error('API signout error:', apiError)
        toast.error('Ошибка при выходе. Перенаправление...', { id: 'signout' })
        
        // В крайнем случае просто перенаправляем на главную
        // Сессия все равно будет очищена при следующем запросе
        setTimeout(() => {
          window.location.href = '/'
        }, 1000)
      }
    }
  }

  return (
    <button 
      onClick={handleSignOut}
      className="text-red-600 hover:text-red-800 transition-colors"
      type="button"
    >
      Выйти
    </button>
  )
}

