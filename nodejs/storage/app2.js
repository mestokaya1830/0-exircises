import express from 'express'
const app = express()
import path from 'path'
import cookieParser from 'cookie-parser'

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(cookieParser());

//go index page
  app.get('/',  (req, res) => {
    res.sendFile(path.resolve('./index.html'))
  })
//go login page
  app.get('/login',  (req, res) => {
    res.sendFile(path.resolve('./login.html'))
  })
//post check login
  app.post('/login',  (req, res) => {
    if (req.body.username == 'mesto' && req.body.password == '9090') {
      const user = {
        name:'mesto',
        age:50
      }
      res.cookie('user', user, {
        // maxAge: 10000, //or use expires
        maxAge: new Date('26 september 2024'),
        httpOnly: false, //not access in browser from javascript
        secure: false //not force to https
      })
     
      res.redirect('/admin')
    } else {
      res.redirect('/login')
    }
  })
//check admin
  app.get('/admin',(req, res) => {
    console.log(req.cookies['user'])
    if(req.cookies['user']){
      res.sendFile(path.resolve('./admin.html'))
    }else{
      res.redirect('/login')
    }
  })
//logout
  app.get('/logout',  (req, res) => {
    res.setHeader('set-cookie', 'user=; max-age=0')
    res.redirect('/')
  })

  app.use(function(req, res, next) {
    res.setHeader('Content-Type', 'text/event-stream');
    next();
  });

  app.use((err, req, res, next) => {
    console.log(err)
    next(err)
  })
app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running...')
})