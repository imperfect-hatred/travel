import Link from 'next/link'
import Image from 'next/image'
import { getAllAttractions } from '@/lib/db/attractions'
import { getCityById } from '@/lib/db/cities'
import { getCountryById } from '@/lib/db/countries'

const fallbackAttractions = [
  {
    id: '1',
    name: 'Эйфелева башня',
    city: 'Париж',
    country: 'Франция',
    image: '/france.jpg',
    description: 'Символ Парижа и одна из самых узнаваемых достопримечательностей мира',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Колизей',
    city: 'Рим',
    country: 'Италия',
    image: '/italy.jpg',
    description: 'Древний амфитеатр, символ Римской империи',
    rating: 4.9,
  },
  {
    id: '3',
    name: 'Саграда Фамилия',
    city: 'Барселона',
    country: 'Испания',
    image: '/spain.jpg',
    description: 'Незавершенный храм работы Антонио Гауди',
    rating: 4.7,
  },
  {
    id: '4',
    name: 'Гора Фудзи',
    city: 'Токио',
    country: 'Япония',
    image: '/japan.jpg',
    description: 'Священная гора и символ Японии',
    rating: 4.8,
  },
  {
    id: '5',
    name: 'Статуя Свободы',
    city: 'Нью-Йорк',
    country: 'США',
    image: '/usa.jpg',
    description: 'Символ свободы и демократии',
    rating: 4.6,
  },
  {
    id: '6',
    name: 'Храмы Бангкока',
    city: 'Бангкок',
    country: 'Таиланд',
    image: '/tailand.jpg',
    description: 'Буддистские храмы с уникальной архитектурой',
    rating: 4.7,
  },
]

export default async function AttractionsPage() {
  const attractionsFromDb = await getAllAttractions()
  
  const attractions = attractionsFromDb.length > 0 
    ? Array.from(new Map((await Promise.all(attractionsFromDb.map(async (a) => {
        const city = a.cityId ? await getCityById(a.cityId) : null
        const country = a.countryId ? await getCountryById(a.countryId) : null
        return {
          id: a.id,
          name: a.name,
          city: city?.name || 'Не указано',
          country: country?.name || 'Не указано',
          image: a.image || '/globe.svg',
          description: a.description || '',
          rating: (a as any).rating || 0, // Используем рейтинг из БД, если есть
        }
      }))).map(item => [item.id, item])).values())
    : fallbackAttractions
  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-600">
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">Достопримечательности</h1>
          <p className="text-gray-600 mb-8 text-lg">
            Откройте для себя знаменитые достопримечательности мира
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attractions.map((attraction) => (
              <Link
                key={attraction.id}
                href={`/attractions/${attraction.id}`}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={attraction.image}
                    alt={attraction.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-bold text-white mb-1">{attraction.name}</h3>
                    <p className="text-white/90 text-sm">{attraction.city}, {attraction.country}</p>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">{attraction.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm font-medium text-gray-700">{attraction.rating}</span>
                    </div>
                    <div className="flex items-center text-blue-600 group-hover:text-blue-800 font-medium text-sm">
                      Узнать больше
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

