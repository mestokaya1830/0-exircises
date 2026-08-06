import { ca } from 'zod/locales';
import redisClient from '../infra/connect.redis.js'
import AppError from '../utils/app.error.js';
import catchAsync from './catch.async.js';

redisClient.defineCommand('checkLimit', {
  numberOfKeys: 1,
  lua: `
    local current = redis.call("INCR", KEYS[1])
    if current == 1 then
      redis.call("EXPIRE", KEYS[1], ARGV[1])
    end
    return current
  `
});
const rateLimiter = (limit, period, type) => catchAsync(async (req, res, next) => {
  const ide = {
    ip: req.ip,
    user: req.user,
    apikey: req.headers['x-api-key'] || null,
    global: 'global'
  }[type];

  if(!ide) {
    return next(new AppError('Invalid rate limit type', 500, 'INVALID_RATE_LIMIT_TYPE'));
  }

  const key = `rate-limit:${req.baseUrl}:${req.path}:${ide}`;
  const count = await redisClient.checkLimit(key, period);
  const ttl = await redisClient.ttl(key);
  const retryRate = ttl > 0 ? ttl : period;


  res.set('X-RateLimit-Limit', limit);
  res.set('X-RateLimit-Remaining', Math.max(0, limit - count));
  res.set('X-RateLimit-Reset', retryRate);

  if (count > limit) {
    return next(new AppError('Too many requests', 429, 'TOO_MANY_REQUESTS', retryRate));
  }

  next();
});

export default rateLimiter;




-------------------------------------------------------------------
👉 Enterprise
import AppError from "../middleware/appError.js";
import catchAsync from "../middleware/catchAsync.js";
import redisClient from "./connectRedis.js";

redisClient.defineCommand("checkLimit", {
  numberOfKeys: 1,
  lua: `
    local key       = KEYS[1]
    local window    = tonumber(ARGV[1])
    local now       = tonumber(ARGV[2])
    local requestId = ARGV[3]
    redis.call('ZREMRANGEBYSCORE', key, 0, now - (window * 1000))
    redis.call('ZADD', key, now, requestId)
    redis.call('PEXPIRE', key, window * 1000)
    local count = redis.call('ZCARD', key)
    local ttl   = redis.call('PTTL', key)
    return { count, ttl }
  `,
});

const rateLimiter = (limit, period, type) => {
  return catchAsync(async (req, res, next) => {
    const id = {
      ip:     req.headers["cf-connecting-ip"] || req.ip,
      user:   req.user,
      apikey: req.headers["x-apikey"] || req.query.apikey,
      global: "global",
    }[type];

    if (!id) {
      return next(new AppError("Invalid identifier", 401, "INVALID_IDE"));
    }

    const key = `rate:${type}:${id}:${req.method}:${req.route?.path || req.baseUrl}`;
    const now = Date.now();
    const requestId = crypto.randomUUID();

    const [count, ttl] = await redisClient.checkLimit(key, period, now, requestId);

    res.set("X-RateLimit-Limit", limit);
    res.set("X-RateLimit-Remaining", Math.max(0, limit - count));
    res.set("X-RateLimit-Reset", Math.floor((now + Math.max(ttl, 0)) / 1000));

    if (count >= limit) {
      res.set("Retry-After", Math.ceil(Math.max(ttl, 0) / 1000));
      return next(new AppError("Too many requests", 429, "TOO_MANY_REQUESTS"));
    }

    next();
  });
};

export default rateLimiter;


//used
GET http://localhost:4000/api/users?page=1&limit=10&apikey=fromquery
Content-Type: application/json
x-api-key: "from-request-header"


// Cloudflare kullanırken gerçek IP bazen req.ip yerine 
// doğrudan 'cf-connecting-ip' başlığında garanti edilir.

Kısaca özetlemek gerekirse:
Fixed window — en basiti. Sayaç her 60 saniyede bir sıfırlanır. Ama pencere sıfırlanırken art arda gelen istekler limiti bypass edebilir.
Sliding window log — burst problemi yok, en doğrusu. Ama her istek ayrı bir Redis kaydı olduğu için yüksek trafikte bellek patlar.
Sliding window counter (seninkisi) — ikisinin ortası. Burst yok, bellek de makul çünkü sadece pencere içindeki istekler tutulur. Production'da en yaygın tercih bu yüzden.
