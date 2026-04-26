iimport redis from "../config/connectRedis.js";
import ErrorHandler from "./errorHandler.js";

const rateLimiter = (limit = 10, windowSec = 60, type = "ip") => {
  return async (req, res, next) => {
    try {
      const id =
        type === "user"
          ? req.user?.id || req.ip
          : req.ip;

      const key = `rl:${req.method}:${req.baseUrl}:${id}`;

      const count = await redis.incr(key);

      if (count === 1) {
        await redis.expire(key, windowSec);
      }

      if (count > limit) {
        return next(
          new ErrorHandler("Too many requests", 429)
        );
      }

      next();
    } catch (err) {
      console.error("RateLimiter error:", err.message);
      next(); // fail-open
    }
  };
};

export default rateLimiter;

//index.js
app.set('trust proxy', true) //for nginx client ip
