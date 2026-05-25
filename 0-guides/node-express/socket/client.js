//in public/socket.js

const socket = io();

socket.on('connect', () => {
  console.log('connected:', socket.id);

  socket.emit('client-msg', { message: 'hello' });
  socket.on('server-msg', (data) => console.log(data))
});
