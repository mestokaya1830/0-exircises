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

