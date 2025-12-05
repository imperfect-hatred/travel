import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Map } from '@/components/Map'
import { Reviews } from '@/components/Reviews'
import { AttractionActions } from '@/components/AttractionActions'
import { getAttractionById } from '@/lib/db/attractions'
import { getCityById } from '@/lib/db/cities'
import { getCountryById } from '@/lib/db/countries'

// Fallback данные о достопримечательностях
const attractionsData: Record<string, any> = {
  '1': {
    id: '1',
    name: 'Эйфелева башня',
    city: 'Париж',
    country: 'Франция',
    countrySlug: 'франция',
    image: '/france.jpg',
    description: 'Эйфелева башня — металлическая башня в центре Парижа, самая узнаваемая архитектурная достопримечательность города. Построена в 1889 году как входная арка для Всемирной выставки.',
    rating: 4.8,
    latitude: 48.8584,
    longitude: 2.2945,
    address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris, Франция',
    openingHours: 'Ежедневно: 9:00 - 23:00',
    price: 'От 26 EUR',
    tips: [
      'Лучшее время для посещения — раннее утро или поздний вечер',
      'Бронируйте билеты заранее онлайн, чтобы избежать очередей',
      'Поднимитесь на второй этаж пешком — это дешевле и интереснее',
    ],
  },
  '2': {
    id: '2',
    name: 'Колизей',
    city: 'Рим',
    country: 'Италия',
    countrySlug: 'италия',
    image: '/italy.jpg',
    description: 'Колизей — амфитеатр в центре Рима, одно из самых знаменитых сооружений Древнего Рима и символ итальянской столицы. Построен в 80 году н.э.',
    rating: 4.9,
    latitude: 41.8902,
    longitude: 12.4922,
    address: 'Piazza del Colosseo, 1, 00184 Roma RM, Италия',
    openingHours: 'Ежедневно: 8:30 - 19:00',
    price: 'От 16 EUR',
    tips: [
      'Покупайте билеты онлайн заранее',
      'Посещайте ранним утром или поздним вечером',
      'Возьмите аудиогид для лучшего понимания истории',
    ],
  },
}

export default async function AttractionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const attractionId = resolvedParams.id;

  // Пытаемся получить достопримечательность из БД
  let attraction = await getAttractionById(attractionId)
  
  // Если не найдено в БД, используем fallback данные
  if (!attraction) {
    const fallbackAttraction = attractionsData[attractionId]
    if (!fallbackAttraction) {
      notFound()
    }
    attraction = fallbackAttraction as any
  }

  // Проверяем, что attraction существует (для TypeScript)
  if (!attraction) {
    notFound()
  }

  // Получаем связанные данные
  const city = attraction.cityId ? await getCityById(attraction.cityId) : null
  const country = attraction.countryId ? await getCountryById(attraction.countryId) : null

  // Форматируем данные для отображения
  const displayData = {
    id: attraction.id || undefined,
    name: attraction.name,
    city: (attraction as any).city?.name || (attraction as any).city || 'Не указано',
    country: (attraction as any).country?.name || (attraction as any).country || 'Не указано',
    countrySlug: (attraction as any).country?.name?.toLowerCase() || (attraction as any).country?.code?.toLowerCase() || (attraction as any).countrySlug || '',
    image: attraction.image || '/globe.svg',
    description: attraction.description || '',
    rating: (attraction as any).rating || 0, // rating берется из fallback данных или вычисляется из reviews
    latitude: attraction.latitude || null,
    longitude: attraction.longitude || null,
    address: attraction.address || '',
    openingHours: attraction.openingHours || '',
    price: attraction.price ? `От ${attraction.price} ${attraction.currency || ''}` : (attraction as any).price || 'Бесплатно',
    tips: (attraction as any).tips || [],
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-600">
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="mb-4">
            <Link href="/attractions" className="text-blue-600 hover:text-blue-800 inline-block">
              ← Все достопримечательности
            </Link>
            <Link href={`/countries/${displayData.countrySlug}`} className="text-blue-600 hover:text-blue-800 inline-block ml-4">
              ← {displayData.country}
            </Link>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            {/* Заголовок с изображением */}
            <div className="relative h-64 md:h-96 w-full">
              <Image
                src={displayData.image}
                alt={displayData.name}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{displayData.name}</h1>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                    📍 {displayData.city}, {displayData.country}
                  </span>
                  {displayData.rating > 0 && (
                    <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                      ⭐ {displayData.rating}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              {/* Описание */}
              <div className="mb-8">
                <p className="text-lg text-gray-700 leading-relaxed">{displayData.description}</p>
              </div>

              {/* Основная информация */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Практическая информация</h2>
                  <ul className="space-y-3">
                    {displayData.address && (
                      <li className="flex items-start">
                        <span className="text-2xl mr-3">📍</span>
                        <div>
                          <span className="font-medium text-gray-700">Адрес:</span>
                          <span className="ml-2 text-gray-600">{displayData.address}</span>
                        </div>
                      </li>
                    )}
                    {displayData.openingHours && (
                      <li className="flex items-start">
                        <span className="text-2xl mr-3">🕐</span>
                        <div>
                          <span className="font-medium text-gray-700">Время работы:</span>
                          <span className="ml-2 text-gray-600">{displayData.openingHours}</span>
                        </div>
                      </li>
                    )}
                    {displayData.price && (
                      <li className="flex items-start">
                        <span className="text-2xl mr-3">💰</span>
                        <div>
                          <span className="font-medium text-gray-700">Стоимость:</span>
                          <span className="ml-2 text-gray-600">{displayData.price}</span>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>

                {displayData.latitude && displayData.longitude && (
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Расположение на карте</h2>
                    <Map lat={displayData.latitude} lng={displayData.longitude} name={displayData.name} />
                  </div>
                )}
              </div>

              {/* Советы */}
              {displayData.tips && displayData.tips.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-800">💡 Советы для посещения</h2>
                  <ul className="space-y-3">
                    {displayData.tips.map((tip: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-yellow-600 mr-3 mt-1">✓</span>
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Действия пользователя */}
              <AttractionActions attractionName={displayData.name} attractionId={displayData.id} />

              {/* Отзывы */}
              <Reviews attractionId={displayData.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

