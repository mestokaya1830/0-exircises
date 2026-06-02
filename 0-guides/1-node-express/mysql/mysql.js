import mysql from 'mysql2/promise';

const createPool = () =>
  mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    connectionLimit: 10,
    queueLimit: 0,
    waitForConnections: true,

    idleTimeout: 60000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });

let pool = createPool();

// 🔁 retry
let retryCount = 0;
const MAX_RETRIES = 5;

// ⏱️ helper
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * 🧪 DB test
 */
const testConnection = async () => {
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
};

/**
 * 🔄 pool reset
 */
const recreatePool = () => {
  console.warn('🔄 MySQL pool recreated');
  pool = createPool();
};

/**
 * 📊 QUERY LOGGER + SLOW QUERY DETECTION
 */
export const query = async (sql, params = []) => {
  const start = Date.now();

  try {
    await testConnection();

    const [rows] = await pool.query(sql, params);

    const duration = Date.now() - start;

    // 🟡 slow query detection (500ms üstü)
    if (duration > 500) {
      console.warn(`🐢 SLOW QUERY (${duration}ms):`, sql);
    } else {
      console.log(`⚡ QUERY (${duration}ms):`, sql);
    }

    retryCount = 0;

    return rows;
  } catch (error) {
    retryCount++;

    console.error(`❌ MySQL error (try ${retryCount}):`, error.message);
    console.error(`📌 Failed query:`, sql);

    if (retryCount >= MAX_RETRIES) {
      throw new Error('Database unavailable');
    }

    recreatePool();

    const delay = Math.min(1000 * 2 ** retryCount, 30000);
    console.warn(`⏳ Retrying in ${delay}ms...`);

    await sleep(delay);

    return query(sql, params);
  }
};

export default pool;




Monolitik bir uygulamada MySQL ile connection pool (bağlantı havuzu) kullanmamızın temel nedeni, veritabanı bağlantılarını sürekli açıp kapatmanın maliyetini azaltmaktır.

Bunu birkaç net noktada açıklayalım:

1. Bağlantı açmak pahalıdır

MySQL’e her yeni bağlantı:

TCP handshake
Authentication (kullanıcı doğrulama)
Session oluşturma

gibi işlemler içerir. Bu işlemler milisaniyeler değil, ciddi CPU ve zaman maliyeti yaratabilir.

Pool olmadan her request’te bağlantı açarsan sistem yavaşlar.

2. Performans ve ölçeklenebilirlik

Monolitik bile olsa aynı anda:

10 kullanıcı
100 kullanıcı
1000 kullanıcı

istek atabilir.

Connection pool:

Önceden açılmış bağlantıları hazır tutar
Request geldiğinde “hazır bağlantı” verir

Bu da latency’i ciddi düşürür.

3. Kaynak kontrolü (çok önemli)

MySQL aynı anda sınırlı sayıda bağlantı kaldırabilir.

Pool sayesinde:

Aynı anda kaç connection açılacağını kontrol edersin
DB’yi “connection flood” ile çökertmezsin
4. Connection leak riskini azaltır

Doğrudan bağlantı açarsan:

kapatmayı unutabilirsin
zamanla memory + connection sızıntısı olur

Pool:

connection’ı geri alır
tekrar kullanır
5. Monolitikte de gereklidir çünkü…

“Monolitik = küçük sistem” demek değildir.

Monolitik uygulama da:

yüksek trafik alabilir
çok thread çalıştırabilir
background job + API birlikte olabilir

Bu yüzden pool her ölçekte gereklidir.
