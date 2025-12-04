import type { Config } from 'drizzle-kit'

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './database.db',
  },
  verbose: true,
  strict: true,
} satisfies Config

