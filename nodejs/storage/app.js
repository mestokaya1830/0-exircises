import express from 'express'
const app = express()
import path from 'path'

app.use(express.json())
app.use(express.urlencoded({extended: true}))


  app.get('/',  (req, res) => {
    res.sendFile(path.resolve('./index.html'))
  })

  app.get('/login',  (req, res) => {
    res.sendFile(path.resolve('./login.html'))
  })

  app.post('/login',  (req, res) => {
    if (req.body.username == 'mesto') {
      const user = {
        name:'mesto',
        age:50
      }
      res.cookie('auth', user, {
        maxAge: 3600000,         
        httpOnly: true,          
        secure: true     
    });
      res.redirect('/admin')
    } else {
      res.redirect('/login')
    }
  })

  app.get('/admin',(req, res) => {
    if(req.headers?.cookie !== undefined){
      const allCookies = req.headers.cookie.split(";")
      const key = allCookies.filter(item => (item.split('=')[0]).trim() == 'auth')
      if(key.length > 0){
        res.sendFile(path.resolve('./admin.html'))
      } else {
        res.redirect('/login')
      }
    } else {
      res.redirect('/login')
    }
  })

  app.get('/logout',  (req, res) => {
    res.setHeader('set-cookie', 'user=; max-age=0')
    res.redirect('/')
  })


  app.use((err, req, res, next) => {
    console.log(err)
    next(err)
  })

app.listen(process.env.PORT || 4000, () => {
  console.log('Server is running...')
})
