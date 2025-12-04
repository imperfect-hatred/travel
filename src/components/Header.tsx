import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { SignOutButton } from './SignOutButton'

export async function Header() {
  const session = await getServerSession(authOptions)

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold">
              <Link href="/" className="text-gray-800 hover:text-gray-600">
                TravelGuide
              </Link>
            </h1>
            <div className="hidden md:flex space-x-4">
              <Link href="/countries" className="text-gray-600 hover:text-gray-900">
                Страны
              </Link>
              <Link href="/cities" className="text-gray-600 hover:text-gray-900">
                Города
              </Link>
              <Link href="/attractions" className="text-gray-600 hover:text-gray-900">
                Достопримечательности
              </Link>
              <Link href="/routes" className="text-gray-600 hover:text-gray-900">
                Маршруты
              </Link>
              <Link href="/blog" className="text-gray-600 hover:text-gray-900">
                Блог
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {session?.user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 hidden sm:inline">
                  {session.user.name || session.user.email}
                </span>
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 hover:text-gray-900"
                >
                  Личный кабинет
                </Link>
                <SignOutButton />
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/auth/signin" 
                  className="text-gray-600 hover:text-gray-900"
                >
                  Войти
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

