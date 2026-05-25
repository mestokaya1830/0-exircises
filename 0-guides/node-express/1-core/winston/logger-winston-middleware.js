import logger from "./logger.js";
import { randomUUID } from "crypto";

const httpLogger = (req, res, next) => {
  const start = Date.now();
  x-request-id 'ı distributed sistemlerde (microservice, API gateway) servisler arası trace takibi için kullanılır. Monolitte tek servis olduğu için dışarıdan gelen trace ID'ye ihtiyaç yok.
  req.id = req.headers["x-request-id"] || randomUUID(); 
  res.setHeader("x-request-id", req.id);//Client ile server loglarını aynı request üzerinden eşleştirebilmek için
  
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

