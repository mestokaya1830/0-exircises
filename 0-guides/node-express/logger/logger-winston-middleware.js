import logger from "../utils/logger.js";

const httpLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    const logData = {
      requestId: req.id, // 🔥 STRIPE STYLE CORE
      ip: req.ip,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration,
      userAgent: req.headers['user-agent'],
      contentLength: res.get('content-length') || 0
    };

    if (res.statusCode >= 500) {
      logger.error({
        message: 'HTTP Request',
        ...logData
      });
    } else if (res.statusCode >= 400) {
      logger.warn({
        message: 'HTTP Request',
        ...logData
      });
    } else {
      logger.info({
        message: 'HTTP Request',
        ...logData
      });
    }
  });

  next();
};

export default httpLogger;


import requestID from "./middlewares/requestID.js";
import httpLogger from "./middlewares/httpLogger.js";

app.use(requestID);   // 🔥 EN ÜST
app.use(httpLogger);  // sonra log
