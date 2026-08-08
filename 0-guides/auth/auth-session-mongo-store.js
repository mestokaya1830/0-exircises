import session from 'express-session';
import MongoStore from 'connect-mongo'

//session middleware
//connect-mongo ile session db'ye yazilir ve client request'te req.session ile db'den otomatik okunur
app.use(session({
  secret: process.env.SESSION_SECRET || 'super-secret-key', // güçlü key
  name: 'sid',                  // cookie name
  resave: false,                 // sadece değişirse yaz
  saveUninitialized: false,      // boş session yaratma
  rolling: true,                 // kullanıcı aktifse süreyi yenile
  cookie: {
    httpOnly: true,              // XSS koruması
    secure: process.env.NODE_ENV === 'production', // HTTPS zorunlu
    sameSite: 'lax',             // CSRF koruması
    maxAge: 1000 * 60 * 60       // 1 saat
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/works',
    ttl: 60 * 60,                // 1 saat, cookie ile uyumlu
    autoRemove: 'native'          // TTL ile cleanup
  })
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
