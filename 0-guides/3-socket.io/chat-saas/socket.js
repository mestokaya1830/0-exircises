import { Server } from "socket.io";
import auth from './auth.js'

let io = null;
let activeClients = null

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://127.0.0.1:5500"],
      credentials: true,
    },
  });

  io.use(auth)
  io.on("connection", async (socket) => {
    console.log('User Connected', socket.id)

    activeClients = await io.fetchSockets()
    console.log(activeClients.length)

    socket.on("disconnect", async () => {
      console.log('User disconnected', socket.id);
      
      activeClients = await io.fetchSockets();
      console.log(activeClients.length);
    });
  });
};

export const getIO = () => {
  if (!io) return null;
  return io;
};
