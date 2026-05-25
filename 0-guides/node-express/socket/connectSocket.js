import { Server } from "socket.io";

let io = null;

export const initSocket = (server) => {
  if (io) return io;
  io = new Server(server);
  
  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);
    socket.on("clientmsg", (data) => {
      socket.broadcast.emit("servermsg", data);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected");
    });
  });
  return io;
};

export const getIO = () => {
  if (!io) throw new Error("No Socket!");
  return io;
};


//to use in another page
 import { getIO } from './socket.js'
const io = getIO()
io.emit('msg', 'Hello everyone!')


const startServer = async () => {
  try {
    await connectMongo()
    const server = http.createServer(app)
    await initSocket(server)
    server.listen(PORT, () => {
      console.log("Server is running on PORT", PORT)
    })
    await processHandler(server)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

startServer();

👉 -------------------------------------------------------------------------------------

//with in inex.js withouth external modul

//socket io server
import { Server } from "socket.io";
const server = http.createServer(app);
export const io = new Server(server); //you must export io to use in antoher page 


const startServer = async () => {
  try {
    await connectMongo()
     io.on("connection", (socket) => {
      console.log("User connected", socket.id);

      socket.on('client-msg', (data) => console.log(data))

      socket.on("disconnect", () => {
        console.log("User disconnected", socket.id);
      });
    });
    server.listen(PORT, () => {
      console.log("Server is running on PORT", PORT)
    })
    await processHandler(server)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}
startServer();


//to use in another page
import { io } from '../index.js';
io.emit('dashboardUpdate', { message: 'Dashboard data updated' });



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
