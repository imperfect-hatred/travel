import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getRouteById, getPublicRoutes } from '@/lib/db/routes'

const routesData: Record<string, any> = {
  'тур-по-парижу': {
    title: 'Тур по Парижу',
    duration: '3 дня',
    difficulty: 'Легкий',
    description: 'Идеальный маршрут для первого знакомства с Парижем'
  },
  'рим-и-ватикан': {
    title: 'Рим и Ватикан',
    duration: '5 дней',
    difficulty: 'Средний',
    description: 'Погружение в историю Древнего Рима и Ватикана'
  },
  'токио-киото': {
    title: 'Токио-Киото',
    duration: '7 дней',
    difficulty: 'Средний',
    description: 'Путешествие по современному Токио и традиционному Киото'
  },
  'нью-йорк': {
    title: 'Нью-Йорк',
    duration: '4 дня',
    difficulty: 'Легкий',
    description: 'Экспресс-тур по главным достопримечательностям Нью-Йорка'
  }
}

export default async function RoutePage({ params }: { params: { route: string } }) {
  const resolvedParams = await params;
  const routeId = decodeURIComponent(resolvedParams.route)
  
  // Пытаемся получить маршрут из БД по ID
  let route = await getRouteById(routeId)
  
  // Если не найдено, пробуем найти по slug в fallback данных
  if (!route) {
    const routeSlug = routeId.toLowerCase()
    const fallbackRoute = routesData[routeSlug]
    if (fallbackRoute) {
      route = fallbackRoute as any
    } else {
      notFound()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-600">
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <Link href="/routes" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Все маршруты
        </Link>
        <div className="px-4 sm:px-0">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h1 className="text-3xl font-bold mb-4">{route.title}</h1>
            <div className="flex space-x-4 mb-6">
              {route.duration && (
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  ⏱️ {typeof route.duration === 'number' ? `${route.duration} дней` : route.duration}
                </span>
              )}
              {route.difficulty && (
                <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  ⚡ {route.difficulty}
                </span>
              )}
            </div>
            {route.description && (
              <p className="text-gray-600 mb-8">{route.description}</p>
            )}
            
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Детали маршрута</h2>
              {route.points && route.points.length > 0 ? (
                // Группируем точки по дням
                Object.entries(
                  route.points.reduce((acc: any, point: any) => {
                    const day = point.day || 1
                    if (!acc[day]) acc[day] = []
                    acc[day].push(point)
                    return acc
                  }, {})
                ).map(([day, points]: [string, any]) => (
                  <div key={day} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">День {day}</h3>
                    <div className="space-y-2">
                      {points.map((point: any, idx: number) => (
                        <div key={idx} className="pl-4 border-l-2 border-blue-200">
                          <h4 className="font-semibold text-gray-800">{point.title}</h4>
                          {point.description && (
                            <p className="text-gray-600 text-sm mt-1">{point.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                // Fallback если нет точек
                [1, 2, 3].map((day) => (
                  <div key={day} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">День {day}</h3>
                    <p className="text-gray-600">Описание дня и достопримечательностей</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}