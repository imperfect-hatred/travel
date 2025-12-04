import Link from 'next/link'
import Image from 'next/image'

// Временные данные о городах (позже будут из базы данных)
export const citiesData = [
  {
    id: '1',
    name: 'Париж',
    country: 'Франция',
    countrySlug: 'франция',
    image: '/france.jpg',
    description: 'Столица Франции, город романтики и искусства',
    population: '2.1 млн',
  },
  {
    id: '2',
    name: 'Рим',
    country: 'Италия',
    countrySlug: 'италия',
    image: '/italy.jpg',
    description: 'Вечный город с богатой историей',
    population: '2.8 млн',
  },
  {
    id: '3',
    name: 'Мадрид',
    country: 'Испания',
    countrySlug: 'испания',
    image: '/spain.jpg',
    description: 'Столица Испании, центр культуры и искусства',
    population: '3.2 млн',
  },
  {
    id: '4',
    name: 'Токио',
    country: 'Япония',
    countrySlug: 'япония',
    image: '/japan.jpg',
    description: 'Современный мегаполис с древними традициями',
    population: '13.9 млн',
  },
  {
    id: '5',
    name: 'Нью-Йорк',
    country: 'США',
    countrySlug: 'сша',
    image: '/usa.jpg',
    description: 'Город, который никогда не спит',
    population: '8.3 млн',
  },
  {
    id: '6',
    name: 'Бангкок',
    country: 'Таиланд',
    countrySlug: 'таиланд',
    image: '/tailand.jpg',
    description: 'Столица Таиланда, город храмов и рынков',
    population: '10.5 млн',
  },
]

export default function CitiesPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-600">
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">Города мира</h1>
          <p className="text-gray-600 mb-8 text-lg">
            Откройте для себя удивительные города и их достопримечательности
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {citiesData.map((city) => (
              <Link
                key={city.id}
                href={`/cities/${city.id}`}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={city.image}
                    alt={city.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-bold text-white mb-1">{city.name}</h3>
                    <p className="text-white/90 text-sm">{city.country}</p>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">{city.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">👥 {city.population}</span>
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




