import redis from './connectRedis.js';
import AppError from '../middleware/appError.js';
import catchAsync from '../middleware/catchAsync.js'

redis.defineCommand('rateLimitCheck', {
  numberOfKeys: 1,
  lua: `
    local current = redis.call('INCR', KEYS[1])
    if current == 1 then
      redis.call('EXPIRE', KEYS[1], ARGV[1])
    end
    return current
  `,
});

const rateLimter = (limit = 5, period = 60, type = 'user') => 
  catchAsync(async (req, res, next) => {
    const ide = {
      ip: req.ip,
      user: req.user,
      apikey: req.headers['apikey'],
      global: 'global'
    }[type];

    if (!ide) {
      return next(new AppError('Rate limit identifier is missing', 401));
    }

    const key = `rl:${req.baseUrl}:${req.path}:${ide}`;
    const count = await redis.rateLimitCheck(key, period);

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - count));max ile sonuç 0’dan küçükse 0 kullan
    res.set('X-RateLimit-Reset', Math.floor(Date.now() / 1000)

    if (count > limit) {
      return next(new AppError('Too many requests, please try again later.', 429));
    }
    
    next();
});

export default rateLimter;




//index.js
app.set('proxy trust', true)


//find key and delete in redis
redis-cli -a 11130113
KEYS rl:*
DEL "key"
