import { Server } from "socket.io";
import auth from "../validation/auth.js";
import rateLimiter from "../redis/rateLimiter.js";


let io = null
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://127.0.0.1:5500",
      credentials: true,
    },
  })


  io.use(auth);
  io.use(rateLimiter(5, 60, 'user'))
  io.on("connection", (socket) => {
    console.log("user connected", socket.id);

    socket.on('client-msg', (data) => {
      console.log(data)
      io.emit('server-msg', data)
    })
    socket.on("connect_error", (err) => {
      console.log(err.message);
    });
    socket.on("disconnect", () => console.log("User disconnected", socket.id));
  });
}


export const getIO = () => {
  if(!io) return null
  return io
}
