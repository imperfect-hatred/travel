import { sqliteTable, text, integer, real, unique, index } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

// Пользователи
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').unique().notNull(),
  name: text('name'),
  password: text('password').notNull(),
  avatar: text('avatar'),
  bio: text('bio'),
  role: text('role').notNull().default('USER'),
  // Поля для сброса пароля (опционально, можно использовать отдельную таблицу)
  resetToken: text('reset_token'),
  resetTokenExpiry: integer('reset_token_expiry', { mode: 'timestamp' }),
  resetTokenCreatedAt: integer('reset_token_created_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
  resetTokenIdx: index('reset_token_idx').on(table.resetToken),
}))

// Токены сброса пароля (отдельная таблица - более безопасный подход)
export const passwordResetTokens = sqliteTable('password_reset_tokens', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
  used: integer('used', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  tokenIdx: index('token_idx').on(table.token),
  userIdIdx: index('user_id_idx').on(table.userId),
}))

// Континенты
export const continents = sqliteTable('continents', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').unique().notNull(),
  code: text('code').unique().notNull(),
  description: text('description'),
  image: text('image'),
})

// Страны
export const countries = sqliteTable('countries', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').unique().notNull(),
  code: text('code').unique().notNull(),
  capital: text('capital'),
  currency: text('currency'),
  language: text('language'),
  visaInfo: text('visa_info'),
  description: text('description'),
  image: text('image'),
  flag: text('flag'),
  area: real('area'),
  population: integer('population'),
  continentId: text('continent_id').references(() => continents.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
})

// Города
export const cities = sqliteTable('cities', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  image: text('image'),
  population: integer('population'),
  bestTime: text('best_time'),
  climate: text('climate'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  countryId: text('country_id').notNull().references(() => countries.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
}, (table) => ({
  uniqueNameCountry: unique('unique_name_country').on(table.name, table.countryId),
}))

// Достопримечательности
export const attractions = sqliteTable('attractions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  image: text('image'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  address: text('address'),
  openingHours: text('opening_hours'),
  price: real('price'),
  currency: text('currency'),
  cityId: text('city_id').references(() => cities.id),
  countryId: text('country_id').references(() => countries.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
})

// Маршруты
export const routes = sqliteTable('routes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  description: text('description'),
  duration: integer('duration'), // в днях
  image: text('image'),
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
  userId: text('user_id').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
})

// Точки маршрута
export const routePoints = sqliteTable('route_points', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  routeId: text('route_id').notNull().references(() => routes.id, { onDelete: 'cascade' }),
  day: integer('day').notNull(),
  order: integer('order').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  cityId: text('city_id').references(() => cities.id),
  countryId: text('country_id').references(() => countries.id),
  attractionId: text('attraction_id').references(() => attractions.id),
  latitude: real('latitude'),
  longitude: real('longitude'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// Отзывы
export const reviews = sqliteTable('reviews', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  content: text('content').notNull(),
  rating: integer('rating').notNull(), // 1-5
  userId: text('user_id').notNull().references(() => users.id),
  countryId: text('country_id').references(() => countries.id),
  cityId: text('city_id').references(() => cities.id),
  attractionId: text('attraction_id').references(() => attractions.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
})

// Рейтинги
export const ratings = sqliteTable('ratings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  value: integer('value').notNull(), // 1-5
  userId: text('user_id').notNull().references(() => users.id),
  countryId: text('country_id').references(() => countries.id),
  cityId: text('city_id').references(() => cities.id),
  attractionId: text('attraction_id').references(() => attractions.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
})

// Путевые заметки
export const travelNotes = sqliteTable('travel_notes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  content: text('content').notNull(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  images: text('images'), // JSON массив URL изображений
  userId: text('user_id').notNull().references(() => users.id),
  countryId: text('country_id').references(() => countries.id),
  cityId: text('city_id').references(() => cities.id),
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
})

// Посещенные места
export const visitedPlaces = sqliteTable('visited_places', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  countryId: text('country_id').references(() => countries.id),
  cityId: text('city_id').references(() => cities.id),
  attractionId: text('attraction_id').references(() => attractions.id),
  visitDate: integer('visit_date', { mode: 'timestamp' }),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// Желаемые направления
export const wishlists = sqliteTable('wishlists', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  countryId: text('country_id').references(() => countries.id),
  cityId: text('city_id').references(() => cities.id),
  attractionId: text('attraction_id').references(() => attractions.id),
  notes: text('notes'),
  priority: integer('priority').default(1), // 1-5
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// Статьи блога
export const articles = sqliteTable('articles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  slug: text('slug').unique().notNull(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  image: text('image'),
  authorId: text('author_id').notNull().references(() => users.id),
  countryId: text('country_id').references(() => countries.id),
  cityId: text('city_id').references(() => cities.id),
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(false),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  views: integer('views').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
})

// Отношения
export const usersRelations = relations(users, ({ many }) => ({
  routes: many(routes),
  reviews: many(reviews),
  ratings: many(ratings),
  travelNotes: many(travelNotes),
  visitedPlaces: many(visitedPlaces),
  wishlists: many(wishlists),
  articles: many(articles),
  passwordResetTokens: many(passwordResetTokens),
}))

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}))

export const continentsRelations = relations(continents, ({ many }) => ({
  countries: many(countries),
}))

export const countriesRelations = relations(countries, ({ one, many }) => ({
  continent: one(continents, {
    fields: [countries.continentId],
    references: [continents.id],
  }),
  cities: many(cities),
  attractions: many(attractions),
  reviews: many(reviews),
  ratings: many(ratings),
  travelNotes: many(travelNotes),
  visitedPlaces: many(visitedPlaces),
  wishlists: many(wishlists),
  articles: many(articles),
}))

export const citiesRelations = relations(cities, ({ one, many }) => ({
  country: one(countries, {
    fields: [cities.countryId],
    references: [countries.id],
  }),
  attractions: many(attractions),
  reviews: many(reviews),
  ratings: many(ratings),
  travelNotes: many(travelNotes),
  visitedPlaces: many(visitedPlaces),
  wishlists: many(wishlists),
  articles: many(articles),
  routePoints: many(routePoints),
}))

export const attractionsRelations = relations(attractions, ({ one, many }) => ({
  city: one(cities, {
    fields: [attractions.cityId],
    references: [cities.id],
  }),
  country: one(countries, {
    fields: [attractions.countryId],
    references: [countries.id],
  }),
  reviews: many(reviews),
  ratings: many(ratings),
  visitedPlaces: many(visitedPlaces),
  wishlists: many(wishlists),
  routePoints: many(routePoints),
}))

export const routesRelations = relations(routes, ({ one, many }) => ({
  user: one(users, {
    fields: [routes.userId],
    references: [users.id],
  }),
  routePoints: many(routePoints),
}))

export const routePointsRelations = relations(routePoints, ({ one }) => ({
  route: one(routes, {
    fields: [routePoints.routeId],
    references: [routes.id],
  }),
  city: one(cities, {
    fields: [routePoints.cityId],
    references: [cities.id],
  }),
  country: one(countries, {
    fields: [routePoints.countryId],
    references: [countries.id],
  }),
  attraction: one(attractions, {
    fields: [routePoints.attractionId],
    references: [attractions.id],
  }),
}))

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  country: one(countries, {
    fields: [reviews.countryId],
    references: [countries.id],
  }),
  city: one(cities, {
    fields: [reviews.cityId],
    references: [cities.id],
  }),
  attraction: one(attractions, {
    fields: [reviews.attractionId],
    references: [attractions.id],
  }),
}))

export const ratingsRelations = relations(ratings, ({ one }) => ({
  user: one(users, {
    fields: [ratings.userId],
    references: [users.id],
  }),
  country: one(countries, {
    fields: [ratings.countryId],
    references: [countries.id],
  }),
  city: one(cities, {
    fields: [ratings.cityId],
    references: [cities.id],
  }),
  attraction: one(attractions, {
    fields: [ratings.attractionId],
    references: [attractions.id],
  }),
}))

export const travelNotesRelations = relations(travelNotes, ({ one }) => ({
  user: one(users, {
    fields: [travelNotes.userId],
    references: [users.id],
  }),
  country: one(countries, {
    fields: [travelNotes.countryId],
    references: [countries.id],
  }),
  city: one(cities, {
    fields: [travelNotes.cityId],
    references: [cities.id],
  }),
}))

export const visitedPlacesRelations = relations(visitedPlaces, ({ one }) => ({
  user: one(users, {
    fields: [visitedPlaces.userId],
    references: [users.id],
  }),
  country: one(countries, {
    fields: [visitedPlaces.countryId],
    references: [countries.id],
  }),
  city: one(cities, {
    fields: [visitedPlaces.cityId],
    references: [cities.id],
  }),
  attraction: one(attractions, {
    fields: [visitedPlaces.attractionId],
    references: [attractions.id],
  }),
}))

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  country: one(countries, {
    fields: [wishlists.countryId],
    references: [countries.id],
  }),
  city: one(cities, {
    fields: [wishlists.cityId],
    references: [cities.id],
  }),
  attraction: one(attractions, {
    fields: [wishlists.attractionId],
    references: [attractions.id],
  }),
}))

export const articlesRelations = relations(articles, ({ one }) => ({
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
  country: one(countries, {
    fields: [articles.countryId],
    references: [countries.id],
  }),
  city: one(cities, {
    fields: [articles.cityId],
    references: [cities.id],
  }),
}))

