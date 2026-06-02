import winston from 'winston'
import 'winston-daily-rotate-file'


const { combine, errors, json, timestamp, printf, colorize } = winston.format

const logger = winston.createLogger({
  defaultMeta: {service: 'Mesfor', env: process.env.NODE_ENV ?? 'development' },
  level: 'info',
  format: combine(
    timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
    errors({stack: true}),
    json()
  ),

  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'log/combined/%DATE%.log',
      maxFiles: '14d',
      maxSize: '20m',
      datePattern: 'YYYY-MM-DD',
    }),
    new winston.transports.DailyRotateFile({
      level: 'error',
      filename: 'log/error/%DATE%.log',
      maxFiles: '14d',
      maxSize: '20m',
      datePattern: 'YYYY-MM-DD',
    })
  ],

  rejectionHandlers: [
    new winston.transports.DailyRotateFile({
      level: 'error',
      filename: 'log/rejections/%DATE%.log',
      maxFiles: '14d',
      maxSize: '20m',
      datePattern: 'YYYY-MM-DD',
    })
  ],

  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      level: 'error',
      filename: 'log/exceptions/%DATE%.log',
      maxFiles: '14d',
      maxSize: '20m',
      datePattern: 'YYYY-MM-DD',
    })
  ]
})

export default logger

//index.js
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational ?? false;

  logger.error({
    message: err.message,
    stack: err.stack,
    requestID: req.id,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    statusCode,
    isOperational,
  });

  res.status(statusCode).json({
    success: false,
    requestID: req.id,
    message: isOperational ? err.message : "Server Error!",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
});

