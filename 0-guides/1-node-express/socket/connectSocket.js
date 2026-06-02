import { Server } from "socket.io";

let io = null;

export const initSocket = (server) => {
  io = new Server(server);

  io.on("connection", (socket) => {
    console.log("user copnnected", socket.id);
    //spesific user
    const userId = socket.handshake.auth.userId;
    socket.join(`user:${userId}`);
    console.log(userId)

    socket.on("disconnct", () => console.log("User disconnected"));
  });
};

export const getIO = () => {
  if (!io) return null;
  return io;
};


//or with token
// io.on("connection", (socket) => {
//   const token = socket.handshake.auth.token;
//   const decoded = jwt.verify(token, process.env.JWT_SECRET);
//   const userId = decoded.user;
//   socket.join(`user:${userId}`);
// });

//in different route
getIO()?.to(`user:${user._id}`).emit("server-msg", {
    message: "Hello",
  });


Production checklist:

JWT auth
Redis adapter
event cleanup
rate limit
ACK timeout
metrics/logging
room cleanup
reconnection strategy
CORS security
horizontal scaling plan

İstersen sana ayrıca:

production-ready Socket.IO architecture
Express + Redis + JWT setup
chat sistemi örneği
online user tracking
scalable notification system
Socket.IO + Prometheus metrics

da gösterebilirim.
