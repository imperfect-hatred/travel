import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CountryActions } from '@/components/CountryActions'
import { Reviews } from '@/components/Reviews'
import { getCountryBySlug } from '@/lib/db/countries'

// Fallback данные о странах (если БД пустая)
const countriesData: Record<string, any> = {
  'франция': {
    name: 'Франция',
    capital: 'Париж',
    description: 'Франция — страна романтики, искусства и изысканной кухни. От величественных замков Луары до лавандовых полей Прованса, от Эйфелевой башни до виноградников Бордо — здесь каждый найдет что-то особенное.',
    image: '/france.jpg',
    continent: 'Европа',
    currency: 'EUR (Евро)',
    language: 'Французский',
    population: '67.4 млн',
    area: '643,801 км²',
    visaInfo: 'Для граждан РФ требуется шенгенская виза',
    bestTime: 'Апрель-октябрь',
    attractions: [
      'Эйфелева башня, Париж',
      'Лувр, Париж',
      'Версальский дворец',
      'Мон-Сен-Мишель',
      'Замки Луары',
      'Лавандовые поля Прованса'
    ],
    tips: [
      'Попробуйте местную кухню: круассаны, багеты, сыры и вино',
      'Используйте метро в Париже — самый удобный способ передвижения',
      'Посетите музеи в первое воскресенье месяца — вход бесплатный',
      'Изучите французский этикет — французы ценят вежливость'
    ]
  },
  'италия': {
    name: 'Италия',
    capital: 'Рим',
    description: 'Италия — колыбель искусства, моды и вкуснейшей кухни. От древних руин Рима до каналов Венеции, от Тосканских холмов до побережья Амальфи — страна невероятного культурного наследия.',
    image: '/italy.jpg',
    continent: 'Европа',
    currency: 'EUR (Евро)',
    language: 'Итальянский',
    population: '59.1 млн',
    area: '301,340 км²',
    visaInfo: 'Для граждан РФ требуется шенгенская виза',
    bestTime: 'Апрель-июнь, сентябрь-октябрь',
    attractions: [
      'Колизей, Рим',
      'Пизанская башня',
      'Венецианские каналы',
      'Ватикан',
      'Помпеи',
      'Флоренция — родина Ренессанса'
    ],
    tips: [
      'Обязательно попробуйте настоящую итальянскую пасту и пиццу',
      'Посетите музеи заранее — купите билеты онлайн',
      'Летом избегайте пляжей в выходные — очень многолюдно',
      'Изучите региональные кухни — каждая область уникальна'
    ]
  },
  'испания': {
    name: 'Испания',
    capital: 'Мадрид',
    description: 'Испания — страна солнца, фламенко и архитектуры Гауди. От пляжей Коста-дель-Соль до горных вершин Пиренеев, от тапас-баров до корриды — здесь каждый день — праздник.',
    image: '/spain.jpg',
    continent: 'Европа',
    currency: 'EUR (Евро)',
    language: 'Испанский',
    population: '47.4 млн',
    area: '505,990 км²',
    visaInfo: 'Для граждан РФ требуется шенгенская виза',
    bestTime: 'Май-июнь, сентябрь-октябрь',
    attractions: [
      'Саграда Фамилия, Барселона',
      'Альгамбра, Гранада',
      'Прадо, Мадрид',
      'Парк Гуэль, Барселона',
      'Ибица — столица ночной жизни',
      'Севилья — родина фламенко'
    ],
    tips: [
      'Попробуйте тапас в разных регионах — везде свои традиции',
      'Сиеста — реальность, многие заведения закрыты 14:00-17:00',
      'Посетите фламенко-шоу в Андалусии',
      'Пляжи Испании одни из лучших в Европе'
    ]
  },
  'япония': {
    name: 'Япония',
    capital: 'Токио',
    description: 'Япония — страна восходящего солнца с уникальной культурой, где древние традиции гармонично сочетаются с современными технологиями. От храмов Киото до небоскребов Токио.',
    image: '/japan.jpg',
    continent: 'Азия',
    currency: 'JPY (Японская иена)',
    language: 'Японский',
    population: '125.8 млн',
    area: '377,975 км²',
    visaInfo: 'Для граждан РФ требуется виза',
    bestTime: 'Март-май (сакура), сентябрь-ноябрь (осень)',
    attractions: [
      'Гора Фудзи',
      'Храмы Киото',
      'Императорский дворец, Токио',
      'Хиросима — мемориал мира',
      'Осака — кулинарная столица',
      'Онсены (горячие источники)'
    ],
    tips: [
      'Изучите японский этикет — поклоны, снятие обуви, правила поведения',
      'Попробуйте суши, рамен, темпура и другие блюда',
      'Используйте JR Pass для путешествий на поездах',
      'Весной посетите ханами — любование сакурой'
    ]
  },
  'сша': {
    name: 'США',
    capital: 'Вашингтон',
    description: 'США — страна возможностей и разнообразных ландшафтов. От небоскребов Нью-Йорка до каньонов Аризоны, от пляжей Калифорнии до лесов Аляски — огромная страна с бесконечными возможностями.',
    image: '/usa.jpg',
    continent: 'Северная Америка',
    currency: 'USD (Доллар США)',
    language: 'Английский',
    population: '331.9 млн',
    area: '9,833,520 км²',
    visaInfo: 'Для граждан РФ требуется виза США',
    bestTime: 'Зависит от региона, в целом апрель-октябрь',
    attractions: [
      'Статуя Свободы, Нью-Йорк',
      'Гранд-Каньон, Аризона',
      'Голливуд, Лос-Анджелес',
      'Йеллоустоунский парк',
      'Ниагарский водопад',
      'Уолт Дисней Уорлд, Флорида'
    ],
    tips: [
      'Чаевые 15-20% — стандарт в ресторанах',
      'Арендуйте машину для путешествий между штатами',
      'Погода сильно различается по регионам — проверьте заранее',
      'Медицинская страховка обязательна — лечение очень дорогое'
    ]
  },
  'таиланд': {
    name: 'Таиланд',
    capital: 'Бангкок',
    description: 'Таиланд — страна улыбок, буддистских храмов и тропических пляжей. От шумных рынков Бангкока до спокойных пляжей Пхукета, от древних храмов до современной ночной жизни.',
    image: '/tailand.jpg',
    continent: 'Азия',
    currency: 'THB (Тайский бат)',
    language: 'Тайский',
    population: '69.8 млн',
    area: '513,120 км²',
    visaInfo: 'Для граждан РФ виза не требуется до 30 дней',
    bestTime: 'Ноябрь-март (сухой сезон)',
    attractions: [
      'Храмы Бангкока (Ват Пхо, Ват Арун)',
      'Пляжи Пхукета и Краби',
      'Чиангмай — культурная столица',
      'Плавучие рынки',
      'Острова Пхи-Пхи',
      'Храмовый комплекс Аюттхая'
    ],
    tips: [
      'Уважайте короля и буддистские храмы — снимайте обувь, одевайтесь скромно',
      'Пробуйте уличную еду — она безопасна и очень вкусна',
      'Торгуйтесь на рынках — это часть культуры',
      'Избегайте сезона дождей (июль-октябрь)'
    ]
  }
}

export default async function CountryPage({ params }: { params: Promise<{ country: string }> }) {
  const resolvedParams = await params;
  const countrySlug = decodeURIComponent(resolvedParams.country).toLowerCase()
  
  // Пытаемся получить страну из БД
  let countryData: any = await getCountryBySlug(countrySlug)
  
  // Если не найдено в БД, используем fallback данные
  if (!countryData) {
    const fallbackCountry = countriesData[countrySlug]
    if (!fallbackCountry) {
      notFound()
    }
    // Создаем объект с id: undefined для fallback данных
    countryData = { ...fallbackCountry, id: undefined }
  }

  // Форматируем данные для отображения
  const displayData = {
    id: countryData.id || undefined,
    name: countryData.name,
    capital: countryData.capital || 'Не указано',
    description: countryData.description || '',
    image: countryData.image || '/globe.svg',
    continent: countryData.continent || 'Не указан',
    currency: countryData.currency || 'Не указано',
    language: countryData.language || 'Не указано',
    population: countryData.population ? `${(countryData.population / 1000000).toFixed(1)} млн` : 'Не указано',
    area: countryData.area ? `${countryData.area.toLocaleString('ru-RU')} км²` : 'Не указано',
    visaInfo: countryData.visaInfo || 'Не указано',
    bestTime: countryData.bestTime || 'Круглый год',
    attractions: countryData.attractions || [],
    tips: countryData.tips || [],
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-600">
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <Link href="/countries" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Все страны
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
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{displayData.name}</h1>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                    🏛️ {displayData.capital}
                  </span>
                  <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                    🗺️ {displayData.continent}
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
                      <span className="text-2xl mr-3">🏛️</span>
                      <div>
                        <span className="font-medium text-gray-700">Столица:</span>
                        <span className="ml-2 text-gray-600">{displayData.capital}</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-2xl mr-3">🗺️</span>
                      <div>
                        <span className="font-medium text-gray-700">Континент:</span>
                        <span className="ml-2 text-gray-600">{displayData.continent}</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-2xl mr-3">💰</span>
                      <div>
                        <span className="font-medium text-gray-700">Валюта:</span>
                        <span className="ml-2 text-gray-600">{displayData.currency}</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-2xl mr-3">🗣️</span>
                      <div>
                        <span className="font-medium text-gray-700">Язык:</span>
                        <span className="ml-2 text-gray-600">{displayData.language}</span>
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
                      <span className="text-2xl mr-3">📐</span>
                      <div>
                        <span className="font-medium text-gray-700">Площадь:</span>
                        <span className="ml-2 text-gray-600">{displayData.area}</span>
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

                <div className="bg-blue-50 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Виза</h2>
                  <p className="text-gray-700">{displayData.visaInfo}</p>
                </div>
              </div>

              {/* Достопримечательности */}
              {displayData.attractions && displayData.attractions.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-800">Главные достопримечательности</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {displayData.attractions.map((attraction: string, index: number) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">📍</span>
                          <span className="text-gray-700">{attraction}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Советы путешественникам */}
              {displayData.tips && displayData.tips.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-800">💡 Советы путешественникам</h2>
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
              <CountryActions countryName={displayData.name} countryId={displayData.id} />

              {/* Отзывы */}
              <Reviews countryId={displayData.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}