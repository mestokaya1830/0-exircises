import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import AppError from './middleware/appError.js'
import authRouter from './routes/authRouter.js'
import userRouter from './routes/userRouter.js'
import logger from './logger/logger.js'
import httpLogger from './logger/httpLogger.js'
import processHandlers from './processHandlers.js'

const app = express()
const PORT = process.env.PORT

app.use(helmet())
app.use(cors({origin: ['https://frontdoman.com']}))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(httpLogger)


app.use('/api/auth', authRouter)
app.use('/api', userRouter)




app.use((req, res, next) => {
  return next(new AppError('Page Not Found!', 404, 'NOT_FOUND'))
})


app.use((err, req, res, next) => {
  console.error(err.stack)
  const statusCode = err.statusCode || 500

  logger.error({
    success: false,
    requestID: req.id,
    ip: req.ip,
    url: req.originalUrl,
    method: req.method,
    code: err.code,
    timestamp: new Date().toISOString(),
    status: err.status,
    message: err.isOperational ? err.message : 'Server Error!'
  })

  res.status(statusCode).json({
    success: false,
    requestID: req.id,
    ip: req.ip,
    url: req.originalUrl,
    method: req.method,
    code: err.code,
    timestamp: new Date().toISOString(),
    status: err.status,
    message: err.isOperational ? err.message : 'Server Error!',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
})


const startServer = async () => {
  try {
    const server = app.listen(PORT, () => console.log('Server is running on PORT', PORT))
    processHandlers(server)
  } catch (error) {
    logger.error('Server Error', error)
    process.exit(1)
  }
}

startServer()
