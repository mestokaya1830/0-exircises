import logger from "./logger.js";
import { randomUUID } from "crypto";

//for socket
const IGNORE_PATHS = [
  "/socket.io",
  "/favicon.ico",
  "/health"
];

const httpLogger = (req, res, next) => {
  const start = Date.now();

  // ❌ SOCKET + SYSTEM REQUESTLERİ IGNORE ET
  if (IGNORE_PATHS.some(path => req.originalUrl.startsWith(path))) {
    return next();
  }

  req.id = req.headers["x-request-id"] || randomUUID();
  res.setHeader("x-request-id", req.id);

  res.on("finish", () => {
    const duration = Date.now() - start;

    logger.info("http_request", {
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
