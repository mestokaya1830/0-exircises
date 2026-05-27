// ─── Dış bağımlılıklar ───────────────────────────────────────────────────────
import AppError from "../middleware/appError.js";   // statusCode + code içeren özel hata sınıfı
import catchAsync from "../middleware/catchAsync.js"; // async hataları otomatik yakalar, try/catch gerekmez
import redisClient from "./connectRedis.js";          // ioredis instance'ı

// ─── Redis'e özel Lua komutu tanımla ─────────────────────────────────────────
// defineCommand ile ioredis'e yeni bir native komut ekliyoruz.
// Lua scripti Redis içinde atomik çalışır — race condition olmaz.
redisClient.defineCommand("checkLimit", {
  numberOfKeys: 1, // KEYS dizisinde kaç key var (1 tane: rate limit key'i)
  lua: `
    local now    = tonumber(ARGV[2])   -- JS'den gelen Date.now() (milisaniye)
    local window = tonumber(ARGV[1])   -- Pencere boyutu (saniye cinsinden)
    local key    = KEYS[1]             -- Rate limit Redis key'i

    -- Sliding window: pencere dışındaki eski kayıtları temizle.
    -- Fixed window'daki burst problemini çözer:
    -- Örn. 60 saniyeye 100 istek limiti varsa, herhangi bir 60 saniyelik
    -- aralıkta 100'den fazla istek geçemez (pencere sıfırında burst olmaz).
    redis.call('ZREMRANGEBYSCORE', key, 0, now - window * 1000)

    -- Bu isteği sorted set'e ekle (score = timestamp, value = timestamp)
    redis.call('ZADD', key, now, now)

    -- Key'i otomatik sil — PEXPIRE milisaniye hassasiyetiyle çalışır
    redis.call('PEXPIRE', key, window * 1000)

    -- Penceredeki toplam istek sayısını döndür
    return redis.call('ZCARD', key)
  `,
});

// ─── Rate limiter middleware factory ─────────────────────────────────────────
/**
 * @param {number} limit   - Penceredeki maksimum istek sayısı
 * @param {number} period  - Pencere boyutu (saniye)
 * @param {'ip'|'user'|'apikey'|'global'} type - Kimi sınırlıyoruz
 *
 * Kullanım örnekleri:
 *   router.get('/search', rateLimiter(30, 60, 'user'), searchHandler)
 *   router.post('/login', rateLimiter(10, 60, 'ip'), loginHandler)
 */
const rateLimiter = (limit, period, type) =>
  catchAsync(async (req, res, next) => {

    // Her type için farklı tanımlayıcı:
    //   ip     → public endpoint'ler, login gerektirmeyen yerler
    //   user   → giriş yapmış kullanıcılar, VPN arkasındakileri de yakalar
    //   apikey → B2B entegrasyonları, her müşteri ayrı quota
    //   global → tüm sisteme tek limit, genel yük koruması
    const identifierMap = {
      ip:     req.ip,
      user:   req.user?.id,
      apikey: req.headers["x-apikey"],
      global: "global",
    };

    const identifier = identifierMap[type];

    // Geçersiz type veya kullanıcı giriş yapmamışsa devam ettirme
    if (!identifier) {
      return next(new AppError("Invalid identifier", 401, "INVALID_IDENTIFIER"));
    }

    // Her endpoint + type + kimlik kombinasyonu için ayrı Redis key.
    // Örn: "rate:limit:/api/v1/users:/search:ip:192.168.1.1"
    // Böylece aynı IP farklı endpoint'lerde bağımsız limit alır.
    const key = `rate:limit:${req.baseUrl}:${req.path}:${type}:${identifier}`;
    const now = Date.now(); // Lua script'ine ARGV[2] olarak gönderilecek

    // Lua çağrısı: KEYS[1]=key, ARGV[1]=period, ARGV[2]=now
    // Sliding window mantığıyla penceredeki istek sayısını döndürür
    const count = await redisClient.checkLimit(key, period, now);

    // Redis'ten key'in ne kadar süre sonra expire olacağını al (ms).
    // Reset zamanı hesabı için şart — eskiden Date.now() yazıyordu (hatalıydı).
    const ttl   = await redisClient.pttl(key);
    const reset = Math.floor((now + Math.max(ttl, 0)) / 1000); // Unix timestamp'e çevir

    // Standart rate limit header'ları (IETF RateLimit draft uyumlu)
    res.set("X-RateLimit-Limit",     limit);                          // Toplam hak
    res.set("X-RateLimit-Remaining", Math.max(0, limit - count));     // Kalan hak (negatif olamaz)
    res.set("X-RateLimit-Reset",     reset);                          // Ne zaman sıfırlanır
    res.set("X-RateLimit-Policy",    `${limit};w=${period};sliding`); // Algoritma bilgisi

    if (count > limit) {
      // Retry-After: client kaç saniye beklemeli — RFC 6585 zorunluluğu.
      // Bu olmadan client hemen tekrar dener → retry storm oluşur.
      res.set("Retry-After", Math.ceil(Math.max(ttl, 0) / 1000));
      return next(new AppError("Too many requests", 429, "TOO_MANY_REQUESTS"));
    }

    next(); // Limit aşılmadı, bir sonraki middleware'e geç
  });

export default rateLimiter;


Kısaca özetlemek gerekirse:
Fixed window — en basiti. Sayaç her 60 saniyede bir sıfırlanır. Ama pencere sıfırlanırken art arda gelen istekler limiti bypass edebilir.
Sliding window log — burst problemi yok, en doğrusu. Ama her istek ayrı bir Redis kaydı olduğu için yüksek trafikte bellek patlar.
Sliding window counter (seninkisi) — ikisinin ortası. Burst yok, bellek de makul çünkü sadece pencere içindeki istekler tutulur. Production'da en yaygın tercih bu yüzden.
