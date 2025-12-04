import { db } from '../lib/db'
import { countries, cities, attractions, routes, routePoints, articles, continents, users } from '../lib/db/schema'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
import Database from 'better-sqlite3'
import path from 'path'
import { eq } from 'drizzle-orm'

function seedDatabase() {
  console.log('🌱 Начало заполнения базы данных...')

  try {
    // Сначала создаем таблицы, если их нет
    console.log('Проверка и создание таблиц...')
    const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'database.db')
    const sqlite = new Database(dbPath)
    sqlite.pragma('foreign_keys = ON')
    
    // Проверяем наличие таблицы continents
    const continentsTable = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='continents'").get()
    
    if (!continentsTable) {
      console.log('Создание всех таблиц...')
      // Создаем все таблицы напрямую
      sqlite.exec(`
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
      console.log('✅ Все таблицы созданы')
    }
    sqlite.close()
    console.log('✅ Таблицы готовы')
    // Создаем континенты
    console.log('Создание континентов...')
    const europeId = randomUUID()
    const asiaId = randomUUID()
    const northAmericaId = randomUUID()

    try {
      db.insert(continents).values([
        { id: europeId, name: 'Европа', code: 'EU', description: 'Европейский континент' },
        { id: asiaId, name: 'Азия', code: 'AS', description: 'Азиатский континент' },
        { id: northAmericaId, name: 'Северная Америка', code: 'NA', description: 'Североамериканский континент' },
      ]).run()
      console.log('✅ Континенты созданы')
    } catch (error: any) {
      if (error.message?.includes('UNIQUE') || error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        console.log('⚠️  Континенты уже существуют')
      } else {
        throw error
      }
    }

    // Создаем страны
    console.log('Создание стран...')
    const franceId = randomUUID()
    const italyId = randomUUID()
    const spainId = randomUUID()
    const japanId = randomUUID()
    const usaId = randomUUID()
    const thailandId = randomUUID()

    const countriesData = [
      {
        id: franceId,
        name: 'Франция',
        code: 'FR',
        capital: 'Париж',
        currency: 'EUR (Евро)',
        language: 'Французский',
        visaInfo: 'Для граждан РФ требуется шенгенская виза',
        description: 'Франция — страна романтики, искусства и изысканной кухни. От величественных замков Луары до лавандовых полей Прованса, от Эйфелевой башни до виноградников Бордо — здесь каждый найдет что-то особенное.',
        image: '/france.jpg',
        flag: '🇫🇷',
        area: 643801,
        population: 67400000,
        continentId: europeId,
      },
      {
        id: italyId,
        name: 'Италия',
        code: 'IT',
        capital: 'Рим',
        currency: 'EUR (Евро)',
        language: 'Итальянский',
        visaInfo: 'Для граждан РФ требуется шенгенская виза',
        description: 'Италия — колыбель искусства, моды и вкуснейшей кухни. От древних руин Рима до каналов Венеции, от Тосканских холмов до побережья Амальфи — страна невероятного культурного наследия.',
        image: '/italy.jpg',
        flag: '🇮🇹',
        area: 301340,
        population: 59100000,
        continentId: europeId,
      },
      {
        id: spainId,
        name: 'Испания',
        code: 'ES',
        capital: 'Мадрид',
        currency: 'EUR (Евро)',
        language: 'Испанский',
        visaInfo: 'Для граждан РФ требуется шенгенская виза',
        description: 'Испания — страна солнца, фламенко и архитектуры Гауди. От пляжей Коста-дель-Соль до горных вершин Пиренеев, от тапас-баров до корриды — здесь каждый день — праздник.',
        image: '/spain.jpg',
        flag: '🇪🇸',
        area: 505990,
        population: 47400000,
        continentId: europeId,
      },
      {
        id: japanId,
        name: 'Япония',
        code: 'JP',
        capital: 'Токио',
        currency: 'JPY (Японская иена)',
        language: 'Японский',
        visaInfo: 'Для граждан РФ требуется виза',
        description: 'Япония — страна восходящего солнца с уникальной культурой, где древние традиции гармонично сочетаются с современными технологиями. От храмов Киото до небоскребов Токио.',
        image: '/japan.jpg',
        flag: '🇯🇵',
        area: 377975,
        population: 125800000,
        continentId: asiaId,
      },
      {
        id: usaId,
        name: 'США',
        code: 'US',
        capital: 'Вашингтон',
        currency: 'USD (Доллар США)',
        language: 'Английский',
        visaInfo: 'Для граждан РФ требуется виза США',
        description: 'США — страна возможностей и разнообразных ландшафтов. От небоскребов Нью-Йорка до каньонов Аризоны, от пляжей Калифорнии до лесов Аляски — огромная страна с бесконечными возможностями.',
        image: '/usa.jpg',
        flag: '🇺🇸',
        area: 9833520,
        population: 331900000,
        continentId: northAmericaId,
      },
      {
        id: thailandId,
        name: 'Таиланд',
        code: 'TH',
        capital: 'Бангкок',
        currency: 'THB (Тайский бат)',
        language: 'Тайский',
        visaInfo: 'Для граждан РФ виза не требуется до 30 дней',
        description: 'Таиланд — страна улыбок, буддистских храмов и тропических пляжей. От шумных рынков Бангкока до спокойных пляжей Пхукета, от древних храмов до современной ночной жизни.',
        image: '/tailand.jpg',
        flag: '🇹🇭',
        area: 513120,
        population: 69800000,
        continentId: asiaId,
      },
    ]

    try {
      db.insert(countries).values(countriesData).run()
      console.log('✅ Страны созданы')
    } catch (error: any) {
      if (error.message?.includes('UNIQUE') || error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        console.log('⚠️  Страны уже существуют')
      } else {
        throw error
      }
    }

    // Создаем города
    console.log('Создание городов...')
    
    // Получаем реальные ID стран из БД
    const france = db.select().from(countries).where(eq(countries.name, 'Франция')).limit(1).get()
    const italy = db.select().from(countries).where(eq(countries.name, 'Италия')).limit(1).get()
    const spain = db.select().from(countries).where(eq(countries.name, 'Испания')).limit(1).get()
    const japan = db.select().from(countries).where(eq(countries.name, 'Япония')).limit(1).get()
    const usa = db.select().from(countries).where(eq(countries.name, 'США')).limit(1).get()
    const thailand = db.select().from(countries).where(eq(countries.name, 'Таиланд')).limit(1).get()
    
    if (!france || !italy || !spain || !japan || !usa || !thailand) {
      console.log('⚠️  Не все страны найдены в БД. Пропускаем создание городов.')
    } else {
      const parisId = randomUUID()
      const romeId = randomUUID()
      const madridId = randomUUID()
      const tokyoId = randomUUID()
      const nycId = randomUUID()
      const bangkokId = randomUUID()

      const citiesData = [
        {
          id: parisId,
          name: 'Париж',
          description: 'Париж — столица Франции, один из самых красивых и романтичных городов мира. Город известен своими музеями, архитектурой, модой и кухней.',
          image: '/france.jpg',
          population: 2100000,
          bestTime: 'Апрель-октябрь',
          climate: 'Умеренный морской',
          latitude: 48.8566,
          longitude: 2.3522,
          countryId: france.id,
        },
        {
          id: romeId,
          name: 'Рим',
          description: 'Рим — вечный город, столица Италии с богатейшей историей. Здесь находятся древние руины, великолепные церкви и музеи мирового уровня.',
          image: '/italy.jpg',
          population: 2800000,
          bestTime: 'Апрель-июнь, сентябрь-октябрь',
          climate: 'Средиземноморский',
          latitude: 41.9028,
          longitude: 12.4964,
          countryId: italy.id,
        },
        {
          id: madridId,
          name: 'Мадрид',
          description: 'Мадрид — столица Испании, центр культуры и искусства. Город известен своими музеями, парками и ночной жизнью.',
          image: '/spain.jpg',
          population: 3200000,
          bestTime: 'Май-июнь, сентябрь-октябрь',
          climate: 'Континентальный',
          latitude: 40.4168,
          longitude: -3.7038,
          countryId: spain.id,
        },
        {
          id: tokyoId,
          name: 'Токио',
          description: 'Токио — столица Японии, современный мегаполис с древними традициями. Город сочетает небоскребы и храмы, технологии и культуру.',
          image: '/japan.jpg',
          population: 13900000,
          bestTime: 'Март-май (сакура), сентябрь-ноябрь (осень)',
          climate: 'Влажный субтропический',
          latitude: 35.6762,
          longitude: 139.6503,
          countryId: japan.id,
        },
        {
          id: nycId,
          name: 'Нью-Йорк',
          description: 'Нью-Йорк — город, который никогда не спит. Столица мира с небоскребами, музеями, театрами и бесконечными возможностями.',
          image: '/usa.jpg',
          population: 8300000,
          bestTime: 'Апрель-июнь, сентябрь-ноябрь',
          climate: 'Влажный субтропический',
          latitude: 40.7128,
          longitude: -74.0060,
          countryId: usa.id,
        },
        {
          id: bangkokId,
          name: 'Бангкок',
          description: 'Бангкок — столица Таиланда, город храмов и рынков. Сочетает буддистские храмы, современные небоскребы и оживленные рынки.',
          image: '/tailand.jpg',
          population: 10500000,
          bestTime: 'Ноябрь-март (сухой сезон)',
          climate: 'Тропический',
          latitude: 13.7563,
          longitude: 100.5018,
          countryId: thailand.id,
        },
      ]

      try {
        db.insert(cities).values(citiesData).run()
        console.log('✅ Города созданы')
      } catch (error: any) {
        if (error.message?.includes('UNIQUE') || error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          console.log('⚠️  Города уже существуют')
        } else {
          throw error
        }
      }
    }

    // Создаем достопримечательности
    console.log('Создание достопримечательностей...')
    
    // Получаем реальные ID городов из БД
    const paris = db.select().from(cities).where(eq(cities.name, 'Париж')).limit(1).get()
    const rome = db.select().from(cities).where(eq(cities.name, 'Рим')).limit(1).get()
    const madrid = db.select().from(cities).where(eq(cities.name, 'Мадрид')).limit(1).get()
    const tokyo = db.select().from(cities).where(eq(cities.name, 'Токио')).limit(1).get()
    const nyc = db.select().from(cities).where(eq(cities.name, 'Нью-Йорк')).limit(1).get()
    const bangkok = db.select().from(cities).where(eq(cities.name, 'Бангкок')).limit(1).get()
    
    // Получаем реальные ID стран из БД
    const franceForAttractions = db.select().from(countries).where(eq(countries.name, 'Франция')).limit(1).get()
    const italyForAttractions = db.select().from(countries).where(eq(countries.name, 'Италия')).limit(1).get()
    const spainForAttractions = db.select().from(countries).where(eq(countries.name, 'Испания')).limit(1).get()
    const japanForAttractions = db.select().from(countries).where(eq(countries.name, 'Япония')).limit(1).get()
    const usaForAttractions = db.select().from(countries).where(eq(countries.name, 'США')).limit(1).get()
    const thailandForAttractions = db.select().from(countries).where(eq(countries.name, 'Таиланд')).limit(1).get()
    
    if (!paris || !rome || !madrid || !tokyo || !nyc || !bangkok) {
      console.log('⚠️  Не все города найдены в БД. Пропускаем создание достопримечательностей.')
    } else {
      const eiffelTowerId = randomUUID()
      const colosseumId = randomUUID()
      const louvreId = randomUUID()
      const sagradaFamiliaId = randomUUID()
      const mountFujiId = randomUUID()
      const statueOfLibertyId = randomUUID()
      const watPhoId = randomUUID()

      const attractionsData = [
        {
          id: eiffelTowerId,
          name: 'Эйфелева башня',
          description: 'Эйфелева башня — металлическая башня в центре Парижа, самая узнаваемая архитектурная достопримечательность города. Построена в 1889 году как входная арка для Всемирной выставки.',
          image: '/france.jpg',
          latitude: 48.8584,
          longitude: 2.2945,
          address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris, Франция',
          openingHours: 'Ежедневно: 9:00 - 23:00',
          price: 26,
          currency: 'EUR',
          cityId: paris.id,
          countryId: franceForAttractions?.id || null,
        },
        {
          id: louvreId,
          name: 'Лувр',
          description: 'Лувр — один из крупнейших и самых посещаемых музеев мира. Здесь хранятся такие шедевры, как Мона Лиза и Венера Милосская.',
          image: '/france.jpg',
          latitude: 48.8606,
          longitude: 2.3376,
          address: 'Rue de Rivoli, 75001 Paris, Франция',
          openingHours: 'Ежедневно: 9:00 - 18:00 (вт закрыт)',
          price: 17,
          currency: 'EUR',
          cityId: paris.id,
          countryId: franceForAttractions?.id || null,
        },
        {
          id: colosseumId,
          name: 'Колизей',
          description: 'Колизей — амфитеатр в центре Рима, одно из самых знаменитых сооружений Древнего Рима и символ итальянской столицы. Построен в 80 году н.э.',
          image: '/italy.jpg',
          latitude: 41.8902,
          longitude: 12.4922,
          address: 'Piazza del Colosseo, 1, 00184 Roma RM, Италия',
          openingHours: 'Ежедневно: 8:30 - 19:00',
          price: 16,
          currency: 'EUR',
          cityId: rome.id,
          countryId: italyForAttractions?.id || null,
        },
        {
          id: sagradaFamiliaId,
          name: 'Саграда Фамилия',
          description: 'Незавершенный храм работы Антонио Гауди в Барселоне. Один из самых известных символов Испании.',
          image: '/spain.jpg',
          latitude: 41.4036,
          longitude: 2.1744,
          address: 'Carrer de Mallorca, 401, 08013 Barcelona, Испания',
          openingHours: 'Ежедневно: 9:00 - 20:00',
          price: 26,
          currency: 'EUR',
          cityId: madrid.id, // Временно, пока нет Барселоны
          countryId: spainForAttractions?.id || null,
        },
        {
          id: mountFujiId,
          name: 'Гора Фудзи',
          description: 'Священная гора и символ Японии. Самая высокая гора страны (3776 м).',
          image: '/japan.jpg',
          latitude: 35.3606,
          longitude: 138.7274,
          address: 'Префектура Сидзуока, Япония',
          openingHours: 'Круглосуточно',
          price: 0,
          currency: 'JPY',
          cityId: tokyo.id,
          countryId: japanForAttractions?.id || null,
        },
        {
          id: statueOfLibertyId,
          name: 'Статуя Свободы',
          description: 'Символ свободы и демократии, подарок Франции США. Расположена на острове Свободы в Нью-Йорке.',
          image: '/usa.jpg',
          latitude: 40.6892,
          longitude: -74.0445,
          address: 'Liberty Island, New York, NY 10004, США',
          openingHours: 'Ежедневно: 8:30 - 16:00',
          price: 24,
          currency: 'USD',
          cityId: nyc.id,
          countryId: usaForAttractions?.id || null,
        },
        {
          id: watPhoId,
          name: 'Храм Ват Пхо',
          description: 'Один из старейших и крупнейших буддистских храмов Бангкока. Известен гигантской статуей лежащего Будды.',
          image: '/tailand.jpg',
          latitude: 13.7464,
          longitude: 100.4944,
          address: '2 Sanam Chai Rd, Phra Borom Maha Ratchawang, Phra Nakhon, Bangkok 10200, Таиланд',
          openingHours: 'Ежедневно: 8:00 - 18:30',
          price: 200,
          currency: 'THB',
          cityId: bangkok.id,
          countryId: thailandForAttractions?.id || null,
        },
      ]

      try {
        db.insert(attractions).values(attractionsData).run()
        console.log('✅ Достопримечательности созданы')
      } catch (error: any) {
        if (error.message?.includes('UNIQUE') || error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          console.log('⚠️  Достопримечательности уже существуют')
        } else {
          throw error
        }
      }
    }

    // Создаем тестового пользователя для маршрутов и статей
    console.log('Создание тестового пользователя...')
    let testUserId: string | null = null
    
    try {
      // Проверяем, есть ли уже пользователь
      const existingUser = db.select().from(users).limit(1).get()
      
      if (existingUser) {
        testUserId = existingUser.id
        console.log('⚠️  Используется существующий пользователь')
      } else {
        // Создаем тестового пользователя
        testUserId = randomUUID()
        const hashedPassword = bcrypt.hashSync('test123', 10)
        
        db.insert(users).values({
          id: testUserId,
          email: 'admin@travelguide.com',
          name: 'Администратор',
          password: hashedPassword,
          role: 'ADMIN',
        }).run()
        console.log('✅ Тестовый пользователь создан (email: admin@travelguide.com, password: test123)')
      }
    } catch (error: any) {
      console.log('⚠️  Ошибка при создании пользователя:', error.message)
    }

    // Создаем маршруты
    if (testUserId) {
      console.log('Создание маршрутов...')
      const route1Id = randomUUID()
      const route2Id = randomUUID()

      try {
        db.insert(routes).values([
          {
            id: route1Id,
            title: 'Тур по Парижу',
            description: 'Идеальный маршрут для первого знакомства с Парижем. Посетите главные достопримечательности за 3 дня.',
            duration: 3,
            isPublic: true,
            userId: testUserId,
            image: '/france.jpg',
          },
          {
            id: route2Id,
            title: 'Рим и Ватикан',
            description: 'Погружение в историю Древнего Рима и Ватикана. Изучите древние руины и великолепные церкви.',
            duration: 5,
            isPublic: true,
            userId: testUserId,
            image: '/italy.jpg',
          },
        ]).run()

        // Добавляем точки маршрута для первого маршрута
        if (parisId && eiffelTowerId) {
          db.insert(routePoints).values([
            {
              routeId: route1Id,
              day: 1,
              order: 1,
              title: 'Эйфелева башня',
              description: 'Начните день с посещения символа Парижа',
              attractionId: eiffelTowerId,
              cityId: parisId,
              countryId: franceId,
              latitude: 48.8584,
              longitude: 2.2945,
            },
            {
              routeId: route1Id,
              day: 1,
              order: 2,
              title: 'Лувр',
              description: 'Посетите один из крупнейших музеев мира',
              cityId: parisId,
              countryId: franceId,
              latitude: 48.8606,
              longitude: 2.3376,
            },
            {
              routeId: route1Id,
              day: 2,
              order: 1,
              title: 'Нотр-Дам',
              description: 'Готический собор на острове Сите',
              cityId: parisId,
              countryId: franceId,
              latitude: 48.8530,
              longitude: 2.3499,
            },
          ]).run()
        }

        console.log('✅ Маршруты созданы')
      } catch (error: any) {
        console.log('⚠️  Ошибка при создании маршрутов:', error.message)
      }
    }

    // Создаем статьи блога
    if (testUserId) {
      console.log('Создание статей блога...')
      
      try {
        db.insert(articles).values([
          {
            title: '10 секретов бюджетного путешествия',
            slug: '10-секретов-бюджетного-путешествия',
            content: '<p>Путешествия не должны стоить целое состояние! Вот проверенные способы экономии, которые помогут вам путешествовать чаще и дальше.</p><h2>1. Гибкие даты и раннее бронирование</h2><p>Используйте календари низких цен авиакомпаний. Бронируйте билеты за 2-3 месяца до поездки.</p>',
            excerpt: 'Как путешествовать часто и не разориться. Проверенные способы экономии на перелетах, жилье и питании.',
            image: '/globe.svg',
            authorId: testUserId,
            isPublished: true,
            publishedAt: new Date(),
            views: 0,
          },
          {
            title: 'Лучшие места для посещения осенью',
            slug: 'лучшие-места-для-посещения-осенью',
            content: '<p>Осень — идеальное время для путешествий: мягкая погода, меньше туристов и невероятные краски природы.</p><h2>Япония — сезон красных кленов</h2><p>Сентябрь-ноябрь — время момидзи (красных кленов).</p>',
            excerpt: 'Куда поехать, чтобы насладиться золотой осенью в разных уголках мира.',
            image: '/globe.svg',
            authorId: testUserId,
            isPublished: true,
            publishedAt: new Date(),
            views: 0,
          },
          {
            title: 'Что взять в поездку на 2 недели',
            slug: 'что-взять-в-поездку-на-2-недели',
            content: '<p>Правильная упаковка — залог комфортного путешествия.</p><h2>Одежда</h2><p>5-7 футболок/блузок, 2-3 пары брюк, удобная обувь.</p>',
            excerpt: 'Советы по упаковке чемодана для двухнедельного путешествия.',
            image: '/globe.svg',
            authorId: testUserId,
            isPublished: true,
            publishedAt: new Date(),
            views: 0,
          },
          {
            title: 'Как получить визу самостоятельно',
            slug: 'как-получить-визу-самостоятельно',
            content: '<p>Оформление визы самостоятельно может сэкономить деньги.</p><h2>Шаг 1: Определите тип визы</h2><p>Туристическая, транзитная, деловая.</p>',
            excerpt: 'Пошаговое руководство по оформлению виз в разные страны.',
            image: '/globe.svg',
            authorId: testUserId,
            isPublished: true,
            publishedAt: new Date(),
            views: 0,
          },
        ]).run()
        console.log('✅ Статьи блога созданы')
      } catch (error: any) {
        console.log('⚠️  Ошибка при создании статей:', error.message)
      }
    }

    console.log('✅ База данных заполнена успешно!')

  } catch (error: any) {
    console.error('❌ Ошибка при заполнении базы данных:', error)
    throw error
  }
}

// Запускаем только если файл вызван напрямую
if (require.main === module) {
  try {
    seedDatabase()
    console.log('✅ Готово!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  }
}

export { seedDatabase }

