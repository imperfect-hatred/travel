import Link from 'next/link'
import { getPublicRoutes } from '@/lib/db/routes'

export default function RoutesPage() {
  const routesFromDb = getPublicRoutes()
  
  // Используем данные из БД, если они есть
  const routes = routesFromDb.length > 0
    ? routesFromDb.map(route => ({
        id: route.id,
        title: route.title,
        duration: route.duration ? `${route.duration} дней` : 'Не указано',
        difficulty: 'Средний',
        description: route.description || 'Подробное описание маршрута с посещением основных достопримечательностей.',
        slug: route.id,
      }))
    : [
        { 
          id: '1',
          title: 'Тур по Парижу', 
          duration: '3 дня', 
          difficulty: 'Легкий',
          description: 'Идеальный маршрут для первого знакомства с Парижем',
          slug: 'тур-по-парижу'
        },
        { 
          id: '2',
          title: 'Рим и Ватикан', 
          duration: '5 дней', 
          difficulty: 'Средний',
          description: 'Погружение в историю Древнего Рима и Ватикана',
          slug: 'рим-и-ватикан'
        },
        { 
          id: '3',
          title: 'Токио-Киото', 
          duration: '7 дней', 
          difficulty: 'Средний',
          description: 'Путешествие по современному Токио и традиционному Киото',
          slug: 'токио-киото'
        },
        { 
          id: '4',
          title: 'Нью-Йорк', 
          duration: '4 дня', 
          difficulty: 'Легкий',
          description: 'Экспресс-тур по главным достопримечательностям Нью-Йорка',
          slug: 'нью-йорк'
        },
      ]
  return (
    <div className="min-h-screen bg-gray-50 text-gray-600">
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h1 className="text-3xl font-bold mb-8">Маршруты</h1>
          <div className="grid md:grid-cols-2 gap-6">
            {routes.map((route) => (
              <div key={route.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold mb-2">{route.title}</h3>
                <div className="flex space-x-4 text-gray-600 mb-4">
                  <span>⏱️ {route.duration}</span>
                  <span>⚡ {route.difficulty}</span>
                </div>
                <p className="text-gray-600 mb-4">{route.description}</p>
                <Link 
                  href={`/routes/${route.slug}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Посмотреть маршрут →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}