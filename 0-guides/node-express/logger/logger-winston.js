import winston from "winston";
import "winston-daily-rotate-file";

const { combine, errors, json, timestamp, colorize, printf } = winston.format;

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  //“Error olduğunda uygulamayı otomatik kapatma, kontrol bende olsun.”
  exitOnError: false,
  // ✅ tüm loglara otomatik metadata
  defaultMeta: {
    service: "monolith-api",
  },
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
      level: "error",
      maxFiles: "14d",
      maxSize: "20m",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
    }),

    new winston.transports.Console({
      silent: process.env.NODE_ENV !== "development",
      format: combine(
        colorize(),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        printf(({ level, message, timestamp, stack, service, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
          return `${timestamp} [${level}] [${service}]: ${stack || message} ${metaStr}`;
        }),
      ),
    }),
  ],

  //“Uygulama çökmeden hemen önce bu hatayı dosyaya yaz.” yani bunlari yakalar (sync hata (throw))
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: "log/exceptions/%DATE%.log",
      level: "error",
      maxFiles: "30d",
      maxSize: "20m",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
    }),
  ],

  //catch olmayan promislari yakalar (async hata (Promise/await))
  rejectionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: "log/rejections/%DATE%.log",
      level: "error",
      maxFiles: "30d",
      maxSize: "20m",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
    }),
  ],
});

export default logger;

