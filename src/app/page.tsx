import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-gray-50 text-gray-600">
      <main className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
        <div className="px-4 py-12 sm:px-0">
          <div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-sm">
            <h1 className="text-4xl font-bold mb-6 text-center">
              Добро пожаловать в TravelGuide!
            </h1>
            <p className="text-green-600 text-center mb-8">
              Откройте для себя мир путешествий: страны, города, маршруты и советы
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">🌍</div>
                <h3 className="text-xl font-semibold mb-2">Страны и города</h3>
                <p className="text-green-600">Исследуйте страны мира и их достопримечательности</p>
              </div>
              
              <div className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">🗺️</div>
                <h3 className="text-xl font-semibold mb-2">Маршруты</h3>
                <p className="text-green-600">Готовые и пользовательские маршруты путешествий</p>
              </div>
              
              <div className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">Блог и советы</h3>
                <p className="text-green-600">Статьи и рекомендации от опытных путешественников</p>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              {session?.user ? (
                <p className="text-lg text-green-600">
                  Вы вошли как {session.user.email}. Начните исследовать мир!
                </p>
              ) : (
                <div className="space-y-4">
                  <p className="text-lg text-gray-700">
                    Войдите или зарегистрируйтесь чтобы получить доступ ко всем функциям
                  </p>
                  <div className="space-x-4">
                    <Link 
                      href="/auth/signin" 
                      className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
                    >
                      Войти
                    </Link>
                    <Link 
                      href="/auth/signup" 
                      className="inline-block border-2 border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50"
                    >
                      Регистрация
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}