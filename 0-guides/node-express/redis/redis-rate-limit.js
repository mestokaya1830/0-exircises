import redis from '../config/connectRedis.js';
import ErrorHandler from './errorHandler.js';
import catchAsync from './catchAsync.js'

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
      user: req.user?.id,
      apikey: req.headers['apikey'],
      global: 'global'
    }[type];

    if (!ide) {
      return next(new ErrorHandler('Rate limit identifier is missing', 401));
    }

    const key = `rl:${req.baseUrl}:${req.path}:${ide}`;
    const count = await redis.rateLimitCheck(key, period);

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - count));

    if (count > limit) {
      return next(new ErrorHandler('Too many requests, please try again later.', 429));
    }
    
    next();
});

export default rateLimter;



//index.js
app.set('proxy trust', true)
