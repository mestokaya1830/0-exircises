import winston from 'winston'
import 'winston-daily-rotate-file'
import env from '../config/env.js'


const {combine, json, errors, timestamp, printf, colorize} = winston.format

const logger = winston.createLogger({
  defaultMeta: {service: 'Mesfor', env: env.Node_ENV ?? "development"},
  level: 'info',
  format: combine(
    timestamp({format: 'YYYY-MM-DD HH:ss:mm'}),
    errors({stack: true}),
    json()
  ),

  transports: [
    new winston.transports.DailyRotateFile({
      filename: '.log/combine/%DATE%.log',
      maxFiles: '7d',
      maxSize: '20mb',
      datePattern: 'YYYY-MM-DD'
    }),
    new winston.transports.DailyRotateFile({
      level: 'error',
      filename: '.log/error/%DATE%.log',
      maxFiles: '7d',
      maxSize: '20mb',
      datePattern: 'YYYY-MM-DD'
    }),
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'HH:mm:ss' }),
        errors({ stack: true }),
        printf(({ level, message, timestamp, stack }) => `${timestamp} ${level}: ${stack || message}`)
      )
    })
  ],
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      level: 'error',
      filename: '.log/exception/%DATE%.log',
      maxFiles: '7d',
      maxSize: '20mb',
      datePattern: 'YYYY-MM-DD'
    })
  ],
  rejectionHandlers: [
    new winston.transports.DailyRotateFile({
      level: 'error',
      filename: '.log/exception/%DATE%.log',
      maxFiles: '7d',
      maxSize: '20mb',
      datePattern: 'YYYY-MM-DD'
    })
  ]
})

export default logger
