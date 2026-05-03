import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD, // Şifreyi .env'den al
  connectTimeout: 10000,          // 10 saniye içinde bağlanamazsa pes et
  keepAlive: 10000,               // Her 10 saniyede bir "orada mısın?" sinyali gönder
  maxRetriesPerRequest: null,     // Senin eklediğin, doğru (komutlar kuyrukta bekler)

  retryStrategy(times) {
    // 50ms ile başlar, denedikçe artar, max 2 saniyede sabitlenir
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  
  reconnectOnError(err) {
    if (err.message.includes('READONLY')) {
      // Eğer bir slave node'a yazmaya çalışıyorsak (failover durumu), 
      // bağlantıyı zorla koparıp master'ı tekrar bulmasını sağlar.
      return true; 
    }
    return false;
  }
});

// Event Listeners (Zaten çok iyi yapmışsın)
redis.on('connect', () => console.log('✅ Redis Connected!'));
redis.on('ready', () => console.log('🚀 Redis Ready!'));
redis.on('error', (err) => console.error('❌ Redis Error!', err));
redis.on('close', () => console.warn('⚠️ Redis Closed!'));

export default redis;

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


//set redis pasword-------------------------------------------
sudo nano /etc/redis/redis.conf
requirepassword 11130113

//set redis memory
sudo nano /etc/redis/redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru //remove old cache when ram is full


//when update db delete cahce manully
await redis.del("users");
await redis.unlink("users");//remove ath the background
await redis.flushdb()//: Sadece bağlı olduğun veritabanındaki (örneğin DB 0) tüm anahtarları siler.

await redis.flushAll()//: Redis'in içindeki (tüm veritabanlarındaki) istisnasız her şeyi siler.




Harika bir soru! Aslında bulkSet (Pipeline) ihtiyacı, verinin boyutundan ziyade, verinin parçalı olup olmamasıyla ilgilidir.

Şu üç senaryo gerçekleştiğinde bulkSet senin hayatını kurtarır:

1. "Granüler" (Parçalı) Güncelleme Gerektiğinde
Diyelim ki bir e-ticaret siten var ve ana sayfada 50 farklı ürünün stok adedini cache'lemek istiyorsun.

Yanlış Yol: Tüm ürünleri tek bir products key'ine dev bir JSON olarak atmak. (Çünkü 1 ürünün stoğu değişirse, 50 ürünlük koca paketi tekrar yazman gerekir).

Doğru Yol (bulkSet): Her ürünü kendi key'iyle (product:1, product:2) saklamak. Stok değişince sadece o key'i güncellersin. İşte bu 50 key'i aynı anda ilk kez cache'e atarken bulkSet kullanırsın.

2. Yüksek Trafikli "User Status" Sistemlerinde
Uygulamanda 100 kullanıcının anlık olarak "online/offline" olduğunu veya "son görülme" zamanını güncellemen gerektiğini düşün.

Eğer döngü içinde 100 kez await redis.set(...) dersen, uygulaman Redis'e 100 kere gidip gelir. Bu da ciddi bir gecikme (latency) yaratır.

bulkSet ile bu 100 güncellemeyi tek bir paket yapıp gönderirsin.

3. Farklı Key'lere TTL (Süre) Ataman Gerektiğinde
Eğer her verinin silinme süresi farklıysa tek bir büyük JSON kullanamazsın.

Örneğin; "Popüler Haberler" 10 dakika, "Hava Durumu" 30 dakika cache'te kalmalı.

Bu verileri ayrı anahtarlarda tutup, bulk bir şekilde Redis'e fırlatabilirsin.



async function bulkSetProducts(products) {
  // 1. ioredis üzerinden bir pipeline (sepet) oluştur
  const pipeline = redis.pipeline();

  // 2. Her bir ürünü sepete ekle (Henüz Redis'e gitmedi)
  products.forEach(product => {
    const key = `product:stock:${product.id}`;
    const value = product.stockCount;
    pipeline.set(key, value, 'EX', 3600); // Her birine 1 saat TTL
  });

  // 3. Sepeti tek seferde Redis'e fırlat
  const results = await pipeline.exec();
  
  // results formatı: [[null, "OK"], [null, "OK"], ...]
  console.log("Tüm stoklar güncellendi!");
}




async function bulkGetProducts(productIds) {
  const pipeline = redis.pipeline();

  // 1. Çekmek istediğin her key için bir GET komutu diz
  productIds.forEach(id => {
    pipeline.get(`product:stock:${id}`);
  });

  // 2. Redis'e tek seferde git ve sonuçları al
  const results = await pipeline.exec();

  // 3. ioredis sonuçları [hata, değer] çiftleri halinde döner. 
  // Sadece değerleri temiz bir diziye çekelim:
  const stocks = results.map(([err, value]) => value);

  return stocks; 
  // Sonuç: [10, 250, 0, 45, ...] (Sıralama productIds ile aynıdır)
}
