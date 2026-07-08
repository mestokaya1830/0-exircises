import dotenv from 'dotenv'
import express from 'express'
import http from 'http'
import helmet from 'helmet'
import cors from 'cors'
import { initSocket } from './socket.js'
import authRouter from './auth.router.js'



dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000


app.use(helmet({
  crossOriginResourcePolicy: {policy: 'cross-origin'}
}))

app.use(cors({
  origin: ['http://127.0.0.1:5500']
}))

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('src/public'))


app.use('/auth', authRouter)


const startServer = async() => {
  try {
    const server = http.createServer(app)
    initSocket(server)
    server.listen(PORT, () => console.log('Server is running on PORT', PORT))
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

startServer()