const express = require('express')
const app = express()
const path = require('path')
const cors = require('cors')
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))


app.set('port', port)
server.listen(port, host, () => {
  console.log('Server is running...')
})

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/index.html'))
})

io.on('connection',(socket) =>{
  console.log('Connected')
  socket.on('newuser-client', (data) => {
    socket.broadcast.emit('newuser-server', data + ' connected')//expect sender
  })
  socket.on('msg-client', (data) => {
    io.emit('msg-server', data)//include sender
  })
  socket.on('disconnect', () =>{
    console.log('Disconnected')
  })
})