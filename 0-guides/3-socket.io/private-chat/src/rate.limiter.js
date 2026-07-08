import redisClient from "./redis.connection.js";

redisClient.defineCommand("checkLimit", {
  numberOfKeys: 1,
  lua: `
    local current = redis.call('INCR', KEYS[1])
    if current == 1 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
    end
    return current
  `,
});

const rateLimiter = (limit, period, type) => (socket, next) => {
  socket.use(async (packet, nextEvent) => {
      try {
      const ide = {
        ip: socket.handshake.address,
        apiKey: socket.apiKey,
        companyId: socket.companyId,
        global: "global",
      }[type];

      console.log(ide)
      if (!ide) {
        console.error("Invalid IDE");
      }

      const key = `rate-limit:socket:${packet[0]}:${ide}`;
      const count = await redisClient.checkLimit(key, period);
      const ttl = await redisClient.ttl(key);

      if (count > limit) {
        socket.emit("error", {
          code: "TO_MANY_REQUEST",
          message: "To many request",
          retrayAfter: ttl > 0 ? ttl : period,
        });
        return;
      }
      nextEvent();
    } catch (error) {
      console.error(error);
      nextEvent();
    }
  });
  next();
};

export default rateLimiter;
