import express from 'express'
dotenv.config()
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import http from 'http'
import { Server } from "socket.io"
const app = express()

const server = http.createServer(app)
const io = new Server(server)

app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('static'))



io.on('connection', (socket) => {
  console.log('a user connected')

  socket.on('client-message', (msg) => {
    io.emit('server-message', msg);
  })

  socket.on('disconnect', () => { 
    console.log('user disconnected')
  })
})

server.listen(process.env.PORT, () => {
  console.log('listening on *:3000')
})
