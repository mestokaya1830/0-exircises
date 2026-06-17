const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

app.use(express.static('public'))

let users = []
io.on('connection', (socket) => {
  console.log(socket.id +' '+ 'user connected!')

  //users side
  socket.on('user', (user) => {
    users[user] = socket.id//set username to users array
    socket.broadcast.emit('user', user)//send username  to all clients
  })

  //message side
  socket.on('msg', (data) => {
    io.to(users[data.receiver]).emit('msg', data)//send msg to a specific user named msg.receiver
  })

  socket.on('disconnect' , () => {
    console.log(socket.id +' '+ 'is disconnected')
  })
})

http.listen(3000, () => {
  console.log('Server is running...')
})