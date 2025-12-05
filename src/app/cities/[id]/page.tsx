import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CityActions } from '@/components/CityActions'
import { Map } from '@/components/Map'
import { Reviews } from '@/components/Reviews'
import { getCityById, createCityFromFallback } from '@/lib/db/cities'
import { getAttractionsByCity } from '@/lib/db/attractions'
import { getCountryById } from '@/lib/db/countries'
import { fallbackCitiesData, citiesData } from '@/lib/data/cities'

export default async function CityPage({ params }: { params: Promise<{ id: string }> }) {
  try {
  const resolvedParams = await params;
  const cityId = resolvedParams.id;
  console.log(`Запрошенный cityId: ${cityId}`);

  // Пытаемся получить город из БД
  let city = await getCityById(cityId)
  console.log("Город из БД:", city);

    // Если не найдено в БД, используем fallback данные и создаем в БД
  if (!city) {
    // Сначала пробуем получить из расширенных fallback данных
    let fallbackCity = fallbackCitiesData[cityId];
    
    // Если нет в расширенных данных, пробуем найти в базовых данных
    if (!fallbackCity) {
      fallbackCity = citiesData.find((c: any) => c.id === cityId);
    }
    
    console.log("Fallback город:", fallbackCity);
    if (!fallbackCity) {
      console.error(`Город с ID ${cityId} не найден ни в БД, ни в fallback данных.`);
      notFound()
    }
      
      // Пытаемся создать город в БД из fallback данных
      try {
        const createdCityId = await createCityFromFallback(fallbackCity);
        if (createdCityId) {
          // Пытаемся получить созданный город из БД
          city = await getCityById(createdCityId);
          if (city) {
            console.log(`✅ Город ${fallbackCity.name} создан в БД с ID: ${createdCityId}`);
          }
        }
      } catch (error) {
        console.error('Ошибка при создании города из fallback данных:', error);
        // Продолжаем работу с fallback данными
      }
      
      // Если не удалось создать в БД, используем fallback данные напрямую
      if (!city) {
    city = fallbackCity as any
      }
  }

  // Получаем достопримечательности города из БД
  const cityAttractions = city.id ? await getAttractionsByCity(city.id) : []
  
  // Получаем страну для отображения
    // Если city.country уже загружен как объект (из with: { country: true }), используем его
    let country = null;
    if (city.country && typeof city.country === 'object' && 'name' in city.country) {
      country = city.country;
    } else if (city.countryId) {
      country = await getCountryById(city.countryId);
    }

    // Получаем название страны и slug
    const countryName = country?.name || (typeof city.country === 'string' ? city.country : null) || 'Не указано';
    const countrySlug = country?.name?.toLowerCase() || city.countrySlug || '';

  // Форматируем данные для отображения
  const displayData = {
    id: city.id || undefined,
    name: city.name,
      country: countryName,
      countrySlug: countrySlug,
    image: city.image || '/globe.svg',
    description: city.description || '',
    population: city.population ? `${(city.population / 1000000).toFixed(1)} млн` : city.population || 'Не указано',
    bestTime: city.bestTime || 'Круглый год',
    climate: city.climate || 'Не указано',
    latitude: city.latitude || null,
    longitude: city.longitude || null,
    attractions: cityAttractions.length > 0 
      ? cityAttractions.map(a => ({ name: a.name, description: a.description }))
      : city.attractions || [],
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-600">
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <Link href="/cities" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Все города
          </Link>
          <Link href={`/countries/${displayData.countrySlug}`} className="text-blue-600 hover:text-blue-800 mb-4 inline-block ml-4">
            ← {displayData.country}
          </Link>
          
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            {/* Заголовок с изображением */}
            <div className="relative h-64 md:h-96 w-full">
              <Image
                src={displayData.image}
                alt={displayData.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{displayData.name}</h1>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                    🗺️ {displayData.country}
                  </span>
                  <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                    👥 {displayData.population}
                  </span>
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
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Основная информация</h2>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-2xl mr-3">🗺️</span>
                      <div>
                        <span className="font-medium text-gray-700">Страна:</span>
                        <span className="ml-2 text-gray-600">{displayData.country}</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-2xl mr-3">👥</span>
                      <div>
                        <span className="font-medium text-gray-700">Население:</span>
                        <span className="ml-2 text-gray-600">{displayData.population}</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-2xl mr-3">🌡️</span>
                      <div>
                        <span className="font-medium text-gray-700">Климат:</span>
                        <span className="ml-2 text-gray-600">{displayData.climate}</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-2xl mr-3">📅</span>
                      <div>
                        <span className="font-medium text-gray-700">Лучшее время для посещения:</span>
                        <span className="ml-2 text-gray-600">{displayData.bestTime}</span>
                      </div>
                    </li>
                  </ul>
                </div>

                {displayData.latitude && displayData.longitude && (
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Расположение</h2>
                    <p className="text-gray-700 mb-4">
                      Координаты: {displayData.latitude.toFixed(4)}, {displayData.longitude.toFixed(4)}
                    </p>
                    <Map lat={displayData.latitude} lng={displayData.longitude} name={displayData.name} />
                  </div>
                )}
              </div>

              {/* Достопримечательности */}
              {displayData.attractions && displayData.attractions.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-800">Главные достопримечательности</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {displayData.attractions.map((attraction: any, index: number) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">📍</span>
                          <div>
                            <h3 className="font-semibold text-gray-800">{attraction.name}</h3>
                            {attraction.description && (
                              <p className="text-sm text-gray-600 mt-1">{attraction.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Действия пользователя */}
              <CityActions cityName={displayData.name} cityId={displayData.id} countryId={country?.id} />

              {/* Отзывы */}
              <Reviews cityId={displayData.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
  } catch (error: any) {
    console.error('Ошибка при загрузке страницы города:', error);
    // Если произошла ошибка, пробуем показать fallback данные
    let cityId: string;
    try {
      const resolvedParams = await params;
      cityId = resolvedParams.id;
    } catch {
      notFound();
      return;
    }
    const fallbackCity = fallbackCitiesData[cityId] || citiesData.find((c: any) => c.id === cityId);
    if (fallbackCity) {
      // Рендерим страницу с fallback данными
      const displayData = {
        id: fallbackCity.id || undefined,
        name: fallbackCity.name,
        country: fallbackCity.country || 'Не указано',
        countrySlug: fallbackCity.countrySlug || '',
        image: fallbackCity.image || '/globe.svg',
        description: fallbackCity.description || '',
        population: fallbackCity.population || 'Не указано',
        bestTime: fallbackCity.bestTime || 'Круглый год',
        climate: fallbackCity.climate || 'Не указано',
        latitude: fallbackCity.latitude || null,
        longitude: fallbackCity.longitude || null,
        attractions: fallbackCity.attractions || [],
      }
      
      return (
        <div className="min-h-screen bg-gray-50 text-gray-600">
          <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
            <div className="px-4 sm:px-0">
              <Link href="/cities" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
                ← Все города
              </Link>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="relative h-64 md:h-96 w-full">
                  <Image
                    src={displayData.image}
                    alt={displayData.name}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{displayData.name}</h1>
                    <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                      🗺️ {displayData.country}
                    </span>
                  </div>
                </div>
                <div className="p-6 md:p-8">
                  <p className="text-lg text-gray-700 leading-relaxed">{displayData.description}</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      )
    }
    // Если нет fallback данных, показываем 404
    notFound()
  }
}

