  app.post('/login',  (req, res) => {
    if (req.body.username == 'mesto' && req.body.password == '9090') {
      const user = {
        name:'mesto',
        age:50
      }
      res.setHeader('set-cookie',`auth=${JSON.stringify(user)};expires=Mon, 15 March 2024 18:10:00 UTC`)
      res.redirect('/admin')
    } else {
      res.redirect('/login')
    }
  })
//check admin
  app.get('/admin',(req, res) => {
    // console.log(req.headers?.cookie)
    if(req.headers?.cookie !== undefined){
      const allCookies = req.headers?.cookie.split(";")
      const key = allCookies.filter(item => (item.split('=')[0]).trim() == 'auth')
      console.log(key)
      if(key.length > 0){
        res.sendFile(path.resolve('./admin.html'))
      } else {
        res.redirect('/login')
      }
    } else {
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

