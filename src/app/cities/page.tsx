import Link from 'next/link'
import Image from 'next/image'
import { citiesData } from '@/lib/data/cities'

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




