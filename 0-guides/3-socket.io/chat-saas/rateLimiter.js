import redisClient from './connectRedis.js';
import logger from '../winston/logger.js';

redisClient.defineCommand('checkLimit', {
  numberOfKeys: 1,
  lua: `
    local current = redis.call('INCR', KEYS[1])
    if current == 1 then
      redis.call('EXPIRE', KEYS[1], tonumber(ARGV[1]))
    end
    return current
  `
});

// rateLimiter.js içi
const rateLimiter = (limit, period, type) => (socket, next) => {
    
    socket.use(async (packet, nextEvent) => {
      const event = packet[0];
      try {
        const ide = {
          ip: socket.handshake.address,
          user: socket.user?._id || socket.user?.email || socket.id,
          apikey: socket.apiKey,
          global: 'global'
        }[type];

        if (!ide) {
          socket.emit('error-msg', { code: 'INVALID_IDENTIFIER', message: 'Auth missing' });
          return;
        }

        const key = `rate-limit:socket:${event}:${ide}`;
        const count = await redisClient.checkLimit(key, period);

        if (count > limit) {
          const ttl = await redisClient.ttl(key);
          console.log(`⚠️ LİMİT AŞILDI -> ${ide} [${event}] - İstek: ${count}/${limit}`);
          
          socket.emit('error-msg', {
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many requests. Please slow down.',
            retryAfterSeconds: ttl > 0 ? ttl : period
          });
          return;
        }

        nextEvent();
      } catch (error) {
        nextEvent();
      }
    });

    next();
};

export default rateLimiter;
