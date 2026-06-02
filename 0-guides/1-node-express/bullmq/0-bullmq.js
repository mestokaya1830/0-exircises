const redisQueue = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || "11130113",

  connectTimeout: 10000,
  commandTimeout: 3000,
  keepAlive: 30000,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,

  retryStrategy(times) {
    return Math.min(times * 500, 5000);
  },

  reconnectOnError(err) {
    const targetErrors = [
      "READONLY",
      "ETIMEDOUT",
      "ECONNRESET",
    ];

    if (targetErrors.some(e => err.message.includes(e))) {
      return true;
    }

    return false;
  },
};

export default redisQueue
