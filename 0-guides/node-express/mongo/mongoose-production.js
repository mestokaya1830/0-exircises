import mongoose from 'mongoose';

const MONGO_URL = process.env.MONGO_URL;
const IS_IPV6_ENABLED = process.env.MONGO_IPV6 === 'true';

if (!MONGO_URL) {
  throw new Error('MONGO_URL is required');
}

// 🔧 Bağlantı ayarları
const options = {
  minPoolSize: 2,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  heartbeatFrequencyMS: 10000,
  family: IS_IPV6_ENABLED ? 6 : 4,
};

// 🔁 Retry ayarları
let retryCount = 0;
const MAX_RETRIES = 5;

// ⏱️ delay helper
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * 📌 MongoDB event logger
 * Bu kısım bağlantı durumlarını takip eder
 */
mongoose.connection.on('connected', () => {
  console.log('🟢 MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('🟠 MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});

/**
 * 🔌 Ana bağlantı fonksiyonu
 */
export const connectDB = async () => {
  // Eğer zaten bağlıysa tekrar bağlanma
  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    console.log(`📡 MongoDB connecting... (try ${retryCount + 1})`);

    await mongoose.connect(MONGO_URL, options);

    retryCount = 0; // başarılıysa reset
  } catch (error) {
    retryCount++;

    console.error(
      `❌ MongoDB error (try ${retryCount}):`,
      error.message
    );

    // 🚨 Maksimum retry kontrolü
    if (retryCount >= MAX_RETRIES) {
      console.error('💀 MongoDB: max retries reached. Exiting...');
      process.exit(1);
    }

    // ⏳ exponential backoff (artan bekleme süresi)
    const delay = Math.min(1000 * 2 ** retryCount, 30000);

    console.warn(`⏳ Retrying in ${delay / 1000}s...`);

    await sleep(delay);

    // 🔁 tekrar dene
    return connectDB();
  }
};
