import session from 'express-session';
import RedisStore from "connect-redis"
import { createClient } from "redis"
let redisClient = createClient()
redisClient.connect().catch(console.error)

Redis store kullanınca
connect-redis ile session Redis’e yazılır.
Redis Node.js’den bağımsızdır:
Node process kill olsa bile Redis server çalışıyorsa session verisi kaybolmaz.
Tekrar Node.js app restart olsa bile kullanıcı cookie’deki session ID ile Redis’ten session’ını bulabilir.

🔹 Önemli not: Redis in-memory çalışır ama çoğu prod setup’ında persistence (AOF veya RDB snapshot) açık olur → restart sonrası session verisi kalır.

Yani Redis’in avantajı Node.js process’e bağımlı olmamak ve cluster / load-balancer altında session paylaşabilmek.

//session middleware
// Redis client
const redisClient = createClient({
  socket: {
    host: 'localhost', // Redis host
    port: 6379,        // Redis port
    reconnectStrategy: retries => Math.min(retries * 50, 500) // retry logic
  }
});

redisClient.connect().catch(console.error);

app.use(session({
  store: new RedisStore({ client: redisClient, prefix: 'sess:' }),
  secret: process.env.SESSION_SECRET || 'super-secret-key', // güçlü key
  name: 'sid',                 // cookie ismi, default: connect.sid
  resave: false,               // sadece değişen session’ları kaydet
  saveUninitialized: false,    // boş session oluşturma
  rolling: true,               // kullanıcı aktifse cookie süresini yenile
  cookie: {
    httpOnly: true,            // client-side JS erişemez (XSS koruması)
    secure: process.env.NODE_ENV === 'production', // HTTPS ise true
    sameSite: 'lax',           // CSRF koruması
    maxAge: 1000 * 60 * 60     // 1 saat (ms cinsinden)
  }
}));

//check admin
  app.get('/admin',(req, res) => {
    console.log(req.session)
    if(req.session.auth){
      res.sendFile(path.resolve('./admin.html'))
    }else{
      res.redirect('/login')
    }
  })
//logout
  app.get('/logout',  (req, res) => {
    req.session.destroy((err) => {
      res.redirect('/login')
    })
  })
