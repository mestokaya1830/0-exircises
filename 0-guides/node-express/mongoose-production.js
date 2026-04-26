imimport mongoose from 'mongoose';

const MONGO_URL = process.env.MONGO_URL;
const IS_IPV6_ENABLED = process.env.MONGO_IPV6 === 'true';

if (!MONGO_URL) {
  throw new Error('MONGO_URL is required');
}

const options = {
  minPoolSize: 2,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  heartbeatFrequencyMS: 10000,
  family: IS_IPV6_ENABLED ? 6 : 4,
};

let retryCount = 0;
const MAX_RETRIES = 5;

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;

  try {
    await mongoose.connect(MONGO_URL, options);

    retryCount = 0;
    console.log('MongoDB: Connected');
  } catch (error) {
    console.error(`MongoDB error (try ${retryCount + 1}):`, error.message);

    if (retryCount >= MAX_RETRIES) {
      console.error('MongoDB: max retries reached');
      process.exit(1);
    }

    retryCount++;

    const delay = Math.min(1000 * 2 ** retryCount, 30000);
    console.warn(`Retrying in ${delay}ms`);

    await sleep(delay);
    return connectDB();
  }
};
