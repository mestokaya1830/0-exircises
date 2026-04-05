import session from 'express-session'

// Node memory tabanlı session
// store eklemediğimiz için Express session default olarak MemoryStore kullanır
// uygulama kapanirsa session olur
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 60 * 1000,
    sameSite: 'lax' // the best is 'strict' but it can cause issues with some browsers, so 'lax' is a good compromise
  }
}));

// Check admin page
app.get('/admin', (req, res) => {
  console.log('Session data:', req.session); // Node memory'de saklanan session
  if (req.session.auth) {
    res.sendFile(path.resolve('./admin.html'));
  } else {
    res.redirect('/login');
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    res.redirect('/login');
  });
});
