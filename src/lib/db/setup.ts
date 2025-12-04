import Database from 'better-sqlite3'
import path from 'path'

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'database.db')
const sqlite = new Database(dbPath)

sqlite.pragma('foreign_keys = ON')

export function setupDatabase() {
  try {
    const requiredTables = [
      'users',
      'password_reset_tokens',
      'continents',
      'countries',
      'cities',
      'attractions',
      'routes',
      'route_points',
      'reviews',
      'ratings',
      'travel_notes',
      'visited_places',
      'wishlists',
      'articles',
    ];

    const missingTables = requiredTables.filter(tableName => {
      const table = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(tableName);
      return !table;
    });
    
    if (missingTables.length === 0) {
      console.log('✅ Все таблицы уже существуют');
      return true;
    }
    
    console.log(`📦 Отсутствуют таблицы: ${missingTables.join(', ')}. Создание...`);

    // Создаем все таблицы
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        email TEXT NOT NULL UNIQUE,
        name TEXT,
        password TEXT NOT NULL,
        avatar TEXT,
        bio TEXT,
        role TEXT NOT NULL DEFAULT 'USER',
        reset_token TEXT,
        reset_token_expiry INTEGER,
        reset_token_created_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER
      );

      CREATE INDEX IF NOT EXISTS email_idx ON users(email);
      CREATE INDEX IF NOT EXISTS reset_token_idx ON users(reset_token);

      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires INTEGER NOT NULL,
        used INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS token_idx ON password_reset_tokens(token);
      CREATE INDEX IF NOT EXISTS user_id_idx ON password_reset_tokens(user_id);

      CREATE TABLE IF NOT EXISTS continents (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL UNIQUE,
        code TEXT NOT NULL UNIQUE,
        description TEXT,
        image TEXT
      );

      CREATE TABLE IF NOT EXISTS countries (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL UNIQUE,
        code TEXT NOT NULL UNIQUE,
        capital TEXT,
        currency TEXT,
        language TEXT,
        visa_info TEXT,
        description TEXT,
        image TEXT,
        flag TEXT,
        area REAL,
        population INTEGER,
        continent_id TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER,
        FOREIGN KEY (continent_id) REFERENCES continents(id)
      );

      CREATE TABLE IF NOT EXISTS cities (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        image TEXT,
        population INTEGER,
        best_time TEXT,
        climate TEXT,
        latitude REAL,
        longitude REAL,
        country_id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER,
        FOREIGN KEY (country_id) REFERENCES countries(id),
        UNIQUE (name, country_id)
      );

      CREATE TABLE IF NOT EXISTS attractions (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        image TEXT,
        latitude REAL,
        longitude REAL,
        address TEXT,
        opening_hours TEXT,
        price REAL,
        currency TEXT,
        city_id TEXT,
        country_id TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER,
        FOREIGN KEY (city_id) REFERENCES cities(id),
        FOREIGN KEY (country_id) REFERENCES countries(id)
      );

      CREATE TABLE IF NOT EXISTS routes (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        duration INTEGER,
        image TEXT,
        is_public INTEGER NOT NULL DEFAULT 0,
        user_id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS route_points (
        id TEXT PRIMARY KEY NOT NULL,
        route_id TEXT NOT NULL,
        day INTEGER NOT NULL,
        "order" INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        city_id TEXT,
        country_id TEXT,
        attraction_id TEXT,
        latitude REAL,
        longitude REAL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
        FOREIGN KEY (city_id) REFERENCES cities(id),
        FOREIGN KEY (country_id) REFERENCES countries(id),
        FOREIGN KEY (attraction_id) REFERENCES attractions(id)
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY NOT NULL,
        content TEXT NOT NULL,
        rating INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        country_id TEXT,
        city_id TEXT,
        attraction_id TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (country_id) REFERENCES countries(id),
        FOREIGN KEY (city_id) REFERENCES cities(id),
        FOREIGN KEY (attraction_id) REFERENCES attractions(id)
      );

      CREATE TABLE IF NOT EXISTS ratings (
        id TEXT PRIMARY KEY NOT NULL,
        value INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        country_id TEXT,
        city_id TEXT,
        attraction_id TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (country_id) REFERENCES countries(id),
        FOREIGN KEY (city_id) REFERENCES cities(id),
        FOREIGN KEY (attraction_id) REFERENCES attractions(id)
      );

      CREATE TABLE IF NOT EXISTS travel_notes (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        date INTEGER NOT NULL,
        images TEXT,
        user_id TEXT NOT NULL,
        country_id TEXT,
        city_id TEXT,
        is_public INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (country_id) REFERENCES countries(id),
        FOREIGN KEY (city_id) REFERENCES cities(id)
      );

      CREATE TABLE IF NOT EXISTS visited_places (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        country_id TEXT,
        city_id TEXT,
        attraction_id TEXT,
        visit_date INTEGER,
        notes TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (country_id) REFERENCES countries(id),
        FOREIGN KEY (city_id) REFERENCES cities(id),
        FOREIGN KEY (attraction_id) REFERENCES attractions(id)
      );

      CREATE TABLE IF NOT EXISTS wishlists (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        country_id TEXT,
        city_id TEXT,
        attraction_id TEXT,
        notes TEXT,
        priority INTEGER DEFAULT 1,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (country_id) REFERENCES countries(id),
        FOREIGN KEY (city_id) REFERENCES cities(id),
        FOREIGN KEY (attraction_id) REFERENCES attractions(id)
      );

      CREATE TABLE IF NOT EXISTS articles (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        content TEXT NOT NULL,
        excerpt TEXT,
        image TEXT,
        author_id TEXT NOT NULL,
        country_id TEXT,
        city_id TEXT,
        is_published INTEGER NOT NULL DEFAULT 0,
        published_at INTEGER,
        views INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER,
        FOREIGN KEY (author_id) REFERENCES users(id),
        FOREIGN KEY (country_id) REFERENCES countries(id),
        FOREIGN KEY (city_id) REFERENCES cities(id)
      );
    `)

    console.log('✅ Все таблицы созданы успешно!')
    return true
  } catch (error: any) {
    console.error('❌ Ошибка при создании таблиц:', error)
    return false
  }
}

// Если файл запускается напрямую
if (require.main === module) {
  setupDatabase()
  sqlite.close()
}

