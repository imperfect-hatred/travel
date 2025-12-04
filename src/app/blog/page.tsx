import Link from 'next/link'
import Image from 'next/image'
import { getPublishedArticles } from '@/lib/db/articles'

export default function BlogPage() {
  const articlesFromDb = getPublishedArticles()
  
  // Используем данные из БД, если они есть
  const blogPosts = articlesFromDb.length > 0
    ? articlesFromDb.map(article => ({
        title: article.title,
        slug: article.slug,
        date: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('ru-RU') : 'Не указано',
        excerpt: article.excerpt || '',
        image: article.image || '/globe.svg',
        readTime: '6 мин чтения',
      }))
    : [
        { 
          title: '10 секретов бюджетного путешествия', 
          slug: '10-секретов-бюджетного-путешествия',
          date: '15 марта 2024', 
          excerpt: 'Как путешествовать часто и не разориться. Проверенные способы экономии на перелетах, жилье и питании.',
          image: '/globe.svg',
          readTime: '8 мин чтения'
        },
        { 
          title: 'Лучшие места для посещения осенью', 
          slug: 'лучшие-места-для-посещения-осенью',
          date: '10 марта 2024', 
          excerpt: 'Куда поехать, чтобы насладиться золотой осенью в разных уголках мира. От японских кленов до европейских виноградников.',
          image: '/globe.svg',
          readTime: '6 мин чтения'
        },
        { 
          title: 'Что взять в поездку на 2 недели', 
          slug: 'что-взять-в-поездку-на-2-недели',
          date: '5 марта 2024', 
          excerpt: 'Советы по упаковке чемодана для двухнедельного путешествия. Чек-лист вещей, которые точно пригодятся.',
          image: '/globe.svg',
          readTime: '5 мин чтения'
        },
        { 
          title: 'Как получить визу самостоятельно', 
          slug: 'как-получить-визу-самостоятельно',
          date: '1 марта 2024', 
          excerpt: 'Пошаговое руководство по оформлению виз в разные страны. Документы, сроки и полезные советы.',
          image: '/globe.svg',
          readTime: '10 мин чтения'
        },
        { 
          title: 'Безопасность в путешествиях: что нужно знать', 
          slug: 'безопасность-в-путешествиях-что-нужно-знать',
          date: '28 февраля 2024', 
          excerpt: 'Как обезопасить себя и свои вещи во время путешествий. Практические советы от опытных путешественников.',
          image: '/globe.svg',
          readTime: '7 мин чтения'
        },
        { 
          title: 'Лучшие приложения для путешественников', 
          slug: 'лучшие-приложения-для-путешественников',
          date: '25 февраля 2024', 
          excerpt: 'Обзор полезных мобильных приложений для навигации, бронирования, переводов и поиска местных достопримечательностей.',
          image: '/globe.svg',
          readTime: '6 мин чтения'
        },
      ]
  return (
    <div className="min-h-screen bg-gray-50 text-gray-600">
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h1 className="text-3xl font-bold mb-8">Блог о путешествиях</h1>
          <p className="text-gray-600 mb-8 text-lg">
            Полезные советы, интересные истории и практические рекомендации для путешественников
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {blogPosts.map((post) => (
              <div key={post.title} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={100}
                    height={100}
                    className="opacity-50"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">{post.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  <Link 
                    href={`/blog/${post.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Читать статью →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}