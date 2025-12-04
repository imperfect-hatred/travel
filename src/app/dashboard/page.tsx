import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-600">
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h1 className="text-3xl font-bold mb-8">Личный кабинет</h1>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
            <h2 className="text-xl font-semibold mb-4">Информация о профиле</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Email:</span> {session.user.email}</p>
              <p><span className="font-medium">Имя:</span> {session.user.name || 'Не указано'}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-3">Посещенные места</h3>
              <p className="text-gray-600 mb-4">Отслеживайте страны и города, которые вы уже посетили.</p>
              <Link 
                href="/dashboard/visited"
                className="text-blue-600 hover:text-blue-800"
              >
                Посмотреть →
              </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-3">Желаемые направления</h3>
              <p className="text-gray-600 mb-4">Сохраняйте места, которые хотите посетить в будущем.</p>
              <Link 
                href="/dashboard/wishlist"
                className="text-blue-600 hover:text-blue-800"
              >
                Посмотреть →
              </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-3">Мои маршруты</h3>
              <p className="text-gray-600 mb-4">Создавайте и сохраняйте свои собственные маршруты.</p>
              <Link 
                href="/dashboard/routes"
                className="text-blue-600 hover:text-blue-800"
              >
                Посмотреть →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}