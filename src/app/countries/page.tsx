import Link from 'next/link'
import Image from 'next/image'
import { getAllCountries } from '@/lib/db/countries'

export default function CountriesPage() {
  const countriesFromDb = getAllCountries()
  
  // Используем данные из БД, если они есть, иначе fallback
  const countries = countriesFromDb.length > 0 
    ? countriesFromDb.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.name.toLowerCase(),
        capital: c.capital || 'Не указано',
        continent: 'Не указан', // TODO: загрузить из relations
        image: c.image || '/globe.svg',
        description: c.description || ''
      }))
    : [
        {
          name: 'Франция',
          slug: 'франция',
          capital: 'Париж',
          continent: 'Европа',
          image: '/france.jpg',
          description: 'Страна романтики, искусства и изысканной кухни'
        },
        {
          name: 'Италия',
          slug: 'италия',
          capital: 'Рим',
          continent: 'Европа',
          image: '/italy.jpg',
          description: 'Колыбель искусства, моды и вкуснейшей кухни'
        },
        {
          name: 'Испания',
          slug: 'испания',
          capital: 'Мадрид',
          continent: 'Европа',
          image: '/spain.jpg',
          description: 'Страна солнца, фламенко и архитектуры Гауди'
        },
        {
          name: 'Япония',
          slug: 'япония',
          capital: 'Токио',
          continent: 'Азия',
          image: '/japan.jpg',
          description: 'Страна восходящего солнца с уникальной культурой'
        },
        {
          name: 'США',
          slug: 'сша',
          capital: 'Вашингтон',
          continent: 'Северная Америка',
          image: '/usa.jpg',
          description: 'Страна возможностей и разнообразных ландшафтов'
        },
        {
          name: 'Таиланд',
          slug: 'таиланд',
          capital: 'Бангкок',
          continent: 'Азия',
          image: '/tailand.jpg',
          description: 'Страна улыбок, буддистских храмов и тропических пляжей'
        }
      ]
  return (
    <div className="min-h-screen bg-gray-50 text-gray-600">
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">Страны мира</h1>
          <p className="text-gray-600 mb-8 text-lg">
            Откройте для себя удивительные страны и их достопримечательности
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {countries.map((country) => (
              <Link
                key={country.slug}
                href={`/countries/${country.slug}`}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={country.image}
                    alt={country.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-bold text-white mb-1">{country.name}</h3>
                    <p className="text-white/90 text-sm">{country.capital}</p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {country.continent}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">{country.description}</p>
                  <div className="mt-4 flex items-center text-blue-600 group-hover:text-blue-800 font-medium text-sm">
                    Узнать больше
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
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