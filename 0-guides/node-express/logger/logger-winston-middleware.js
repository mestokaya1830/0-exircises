import logger from "../utils/logger.js";
import { randomUUID } from "crypto";

const httpLogger = (req, res, next) => {
  const start = Date.now();
  req.id = req.headers["x-request-id"] || randomUUID();
  // response’a da koy (debug için çok önemli)
  res.setHeader("x-request-id", req.id);
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("HTTP Request", {
      requestId: req.id,
      ip: req.ip,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration,
      userAgent: req.headers["user-agent"],
      contentLength: res.get("content-length") || 0,
    });
  });

  next();
};

export default httpLogger;

