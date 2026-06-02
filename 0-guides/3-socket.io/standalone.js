👉index.js
import dotenv from "dotenv";
dotenv.config();
import { Server } from "socket.io";
import http from "http";
import Redis from "ioredis";

const PORT = process.env.PORT || 4000;

const redisClient = new Redis({
  host: 'localhost',
  port: 6379,
  password: '11130113'
});

redisClient.defineCommand('checkLimit', {
  numberOfKeys: 1,
  lua: `
    local current = redis.call('INCR', KEYS[1])
    if current == 1 then
        redis.call('EXPIRE', KEYS[1], ARGV[1])
    end
    return current
  `
});


const server = http.createServer((req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.removeHeader("X-Powered-By");

  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("OK");
  } else {
    res.writeHead(404);
    res.end();
  }
});

const io = new Server(server, {
  cors: { origin: "http://127.0.0.1:5500" },
});

const limit = 3;
const period = 60;

//connection with limit
io.use(async (socket, next) => {
  const apiKey = socket.handshake.query.apiKey;
  if (!apiKey) {
    return next(new Error("APIKEY is required!")); 
  }
  socket.apiKey = apiKey;
  try {
    const count = await redisClient.checkLimit(apiKey, period);

    if (count > limit) {
      return next(new Error("Too many connection requests! Please wait."));
    }
    next(); 
  } catch (err) {
    console.error("Redis Error:", err);
    next();
  }
});


//message with limit
io.on("connection", (socket) => {
  console.log("a user connected", socket.id, "with API Key:", socket.apiKey);

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });

  socket.on("client-msg", async (msg) => {
    try {
      const count = await redisClient.checkLimit(socket.apiKey, period);
      if (count > limit) {
        socket.emit("rate-limit-error", "Too many messages!");
        return false
      }
      io.emit("server-msg", msg);
    } catch (err) {
      console.error("Redis Error:", err);
      io.emit("server-msg", msg); 
    }
  });
});

const startServer = () => {
  try {
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

startServer();


👉index.html
<!DOCTYPE html>
<html>

<head>
  <title>Socket.IO chat</title>
  <link rel="stylesheet" href="./main.css">
</head>

<body>
  <ul id="messages"></ul>
  <form id="form" action="">
    <input id="input" autocomplete="off" /><button>Send</button>
  </form>

<script src="http://localhost:5000/socket.io/socket.io.js"></script>
  <script src="./client.js"></script>
</body>

</html>


👉client.js
const socket = io('http://127.0.0.1:5000', {
  query: {
    apiKey: ''
  }
});


socket.on('connect', () => {
  console.log('Connected to server', socket.id);
});

socket.on("connect_error", (err) => {
  console.error(err.message); 
});

socket.on('disconnect', () => {
  console.log('Disconnected from server', socket.id);
});


socket.on('rate-limit-error', (data) => console.log(data))



//html
const form = document.getElementById('message-form');
const input = document.getElementById('message-input');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message  = {
        id: socket.id,
        text: input.value
    }
    socket.emit('client-msg', message);
    input.value = '';
});

socket.on('server-msg', (msg) => {
    const messageList = document.getElementById('message-list');
    const messageItem = document.createElement('li');
    messageItem.textContent = msg.text;
    messageList.appendChild(messageItem);
});


