import dotenv from 'dotenv'
dotenv.config()
import exprss from 'express'
import http from 'http'
import helmet from 'helmet'
import cors from 'cors'
import AppError from './middleware/appError.js'
import authRouter from './routes/authRouter.js'
import {initSocket} from './sockets/initSocket.js'


const app = exprss()
const PORT = process.env.PORT || 5000


app.use(helmet({
  contentSecurityPolicy: false
}))

app.use(cors({
  origin: ['http://127.0.0.1:5500'],
  credentials: true
}))
app.use(exprss.json())
app.use(exprss.urlencoded({extended: true}))


app.use('/api/auth', authRouter)


app.use((req, res, next) => {
  return next(new AppError('Page Not Found', 404, 'PAGE_NOT_FOUND'))
})


app.use((err, req, res, next) => {
  console.error(err)
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    success: false,
    requestID: req.id,
    ip: req.ip,
    url: req.originalUrl,
    method: req.method,
    status: err.status,
    code: err.code,
    timestamp: new Date().toISOString(),
    message: err.isOperational ? err.message : 'Server Error',
    ...(process.env.NODE_ENV === 'development' && {stack: err.stack})
  })
})




const startServer = async () => {
  try {
    const appServer = http.createServer(app)
    initSocket(appServer)
    const server = appServer.listen(PORT, () => console.log('Socket is running on PORT', PORT))
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

startServer()

