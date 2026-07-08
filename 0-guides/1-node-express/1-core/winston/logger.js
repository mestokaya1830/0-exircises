import winston from "winston";
import "winston-daily-rotate-file";

const { combine, json, errors, timestamp, printf, colorize } = winston.format;

const logger = winston.createLogger({
  defaultMeta: {
    service: "mesfor",
    env: process.env.NODE_ENV ?? "development",
  },
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    json(),
  ),

  transports: [
    new winston.transports.DailyRotateFile({
      filename: ".log/combined/%DATE%.log",
      maxFiles: "7d",
      maxSize: "20m",
      datePattern: "YYY-MM-DD",
    }),
    new winston.transports.DailyRotateFile({
      level: "error",
      filename: ".log/error/%DATE%.log",
      maxFiles: "7d",
      maxSize: "20m",
      datePattern: "YYY-MM-DD",
    }),
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        printf(({ level, message, timestamp, stack, ...meta }) => {
          return `${timestamp} [${level}]: ${stack || message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ""
          }`;
        }),
      ),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.DailyRotateFile({
      level: "error",
      filename: ".log/rejection/%DATE%.log",
      maxFiles: "7d",
      maxSize: "20m",
      datePattern: "YYY-MM-DD",
    }),
  ],
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      level: "error",
      filename: ".log/exception/%DATE%.log",
      maxFiles: "7d",
      maxSize: "20m",
      datePattern: "YYY-MM-DD",
    }),
  ],
});

export default logger;

