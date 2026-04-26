sudo apt install redis-server
sudo systemctl restart redis-service
redis-cli
and ping

npm i redis

//in connectRedis.js
import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL
});

redis.on('connect', () => {
  console.log('Connected to Redis!');
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

redis.on('reconnecting', () => {
  console.log('Redis reconnecting...');
});
export default redis;

const start = async () => {
  try {
    await connectMongo()
    await redis.connect()
    app.listen(PORT, () => {
      console.log("Server is running on PORT", PORT);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();

app.get('/admin', async(req, res, next) => {
const cached = await redis.get(key);

if (cached) {
  // sadece 1 kişi refresh etsin (save server)
  
  //NX = “Only set if Not eXists”
  //await redis.ttl("lock:users"); debug how many second left
  const lock = await redis.set('lock:users', "1", "NX", "EX", 5);

  if (lock) {
    refreshCacheInBackground(); // sadece 1 kişi çalıştırır(save client)
  }

  return JSON.parse(cached);
}
  res.status(200).json({
    status: 200,
    success: true,
    data: JSON.parse(user)
  })
})



//set redis pasword
sudo nano /etc/redis/redis.conf
requirepassword 11130113

//set redis memory
sudo nano /etc/redis/redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru //remove old cache when ram is full


//when update db delete cahce manully
await redis.del("users");
await redis.unlink("users");//remove ath the background
await redis.flushDb()//: Sadece bağlı olduğun veritabanındaki (örneğin DB 0) tüm anahtarları siler.

await redis.flushAll()//: Redis'in içindeki (tüm veritabanlarındaki) istisnasız her şeyi siler.
