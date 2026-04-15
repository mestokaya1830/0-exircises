import mysql from 'mysql2/promise';

const mysqlDB = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,        // Maksimum bağlantı sayısı
  queueLimit: 0,              // Kuyruk limiti (0 = sınırsız)
  waitForConnections: true,   // Boş bağlantı bekle
  idleTimeout: 60000,         // 60sn boşta kalan bağlantıyı kapat
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export default mysqlDB
