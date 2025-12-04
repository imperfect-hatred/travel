import { db } from './index'
import { articles, users } from './schema'
import { eq, desc } from 'drizzle-orm'

/**
 * Получает все опубликованные статьи
 */
export function getPublishedArticles() {
  try {
    return db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        image: articles.image,
        publishedAt: articles.publishedAt,
        views: articles.views,
        author: users,
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(eq(articles.isPublished, true))
      .orderBy(desc(articles.publishedAt))
      .all()
  } catch (error: any) {
    console.error('Ошибка при получении статей:', error)
    return []
  }
}

/**
 * Получает статью по slug
 */
export function getArticleBySlug(slug: string) {
  try {
    const result = db
      .select({
        article: articles,
        author: users,
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(eq(articles.slug, slug))
      .limit(1)
      .get()

    if (!result) return null

    return {
      ...result.article,
      author: result.author,
    }
  } catch (error: any) {
    console.error('Ошибка при получении статьи:', error)
    return null
  }
}







