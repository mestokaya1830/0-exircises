import ioredis from "ioredis";

const redisCache = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || "11130113",

  // 🔌 Bağlantı stabilitesi
  connectTimeout: 5000,
   // ⚡ Cache için makul timeout
  commandTimeout: 5000,
  keepAlive: 30000,

  // 🔁 Otomatik reconnect stratejisi
  retryStrategy(times) {
    if (times > 10) return null; // 10 denemeden sonra bırak

    return Math.min(times * 200, 3000); //min ile sonuç 3000'i geçerse 3000 kullan
    // 200ms → 3000ms arası backoff
  },

  // 🚨 Replica / failover durumunda reconnect
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

redisCache.on('connect', () => console.log('Redis connected!'))
redisCache.on('error', (err) => confirm.error(err))

export default redisCache


//in router---------------------------------------
router.get('/dashboard', auth, rateLimiter(5, 60,'user'), catchAsync(async(req, res, next) => {
  let users = await redis.get('users')
  if(!users){
    users = await userSC.find().lean()
    await redis.set('users', JSON.stringify(users), 'EX', 20)
  }
  res.json({
    success: true,
    message: 'Admin Page',
    url: req.url,
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl,
    users
  })


}))


//when update db delete cahce manully
await redis.del("users");
await redis.unlink("users");//remove ath the background
await redis.flushdb()//: Sadece bağlı olduğun veritabanındaki (örneğin DB 0) tüm anahtarları siler.

await redis.flushAll()//: Redis'in içindeki (tüm veritabanlarındaki) istisnasız her şeyi siler.


