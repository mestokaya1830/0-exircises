import winston from "winston";
import "winston-daily-rotate-file";

const { combine, errors, json, timestamp, colorize, printf } = winston.format;

const logger = winston.createLogger({
  // 'app' yerine 'service' kullanarak printf ile uyumlu hale getirdik
  defaultMeta: { service: "my-app", env: process.env.NODE_ENV ?? "development" },
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    json(),
  ),

  transports: [
    new winston.transports.DailyRotateFile({
      filename: "log/combined/%DATE%.log",
      maxFiles: "14d",
      maxSize: "20m",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
    }),

    new winston.transports.DailyRotateFile({
      filename: "log/error/%DATE%.log",
      level: "error", // Sadece error ve altını (crit, alert, emerg) yazar
      maxFiles: "14d",
      maxSize: "20m",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
    }),

    new winston.transports.Console({
      // Production'da console'u tamamen kapatmak yerine 'error' seviyesine çekmek daha güvenli olabilir
      // ama tercihine göre 'silent' kalabilir.
      silent: process.env.NODE_ENV === "production", 
      format: combine(
        colorize(),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        printf(({ level, message, timestamp, stack, service, ...meta }) => {
          // Meta içindeki env ve service'i tekrar metaStr içinde yazdırmamak için ayıralım
          const { env, ...rest } = meta; 
          const metaStr = Object.keys(rest).length ? JSON.stringify(rest) : '';
          
          // Stack varsa stack'i, yoksa message'ı yazdır
          return `${timestamp} [${level}] [${service}]: ${stack || message} ${metaStr}`;
        }),
      ),
    }),
  ],

  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: "log/exceptions/%DATE%.log",
      maxFiles: "30d",
      maxSize: "20m",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
    }),
  ],

  rejectionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: "log/rejections/%DATE%.log",
      maxFiles: "30d",
      maxSize: "20m",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
    }),
  ],
  
  // Hata olduğunda uygulamanın hemen kapanmasını istemiyorsan false yapabilirsin
  exitOnError: false, 
});

export default logger;
