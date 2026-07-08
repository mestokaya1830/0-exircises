import { Server } from "socket.io";
import rateLimiter from "./rate.limiter.js";
import auth from './auth.js'



let io = null;
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://127.0.0.1:5500"],
      credentials: true,
    },
  });

  let users = new Map();

  io.use(auth)
  io.use(rateLimiter(5, 20, 'companyId'))
  io.on("connection", (socket) => {
    socket.on("new-user", (username) => {
      if (users.has(username)) {
        socket.emit("user-exists", username);
      }
      users.set(username, socket.id)
      socket.data.username = username
      socket.join(username)

      socket.broadcast.emit('user-connected', username)
      socket.emit('all-users',  Array.from(users.keys()))
    });

    socket.on('message', data => {
      const {receiver, role, message} = data
      const sender = socket.data.username
      data.sender = sender
       io.to(sender).to(receiver).emit("message", data);
    })

    socket.on('disconnect', () => {
      const {username} = socket.data
      if(username && users.get(username) === socket.id){
        users.delete(username)
        socket.leave(username)
        io.emit('all-users', Array.from(users.keys()))
        io.emit('user-disconnected', username)
      }
    })
  });
};

export const getIO = () => io;
