import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import ErrorHandler from './middleware/errorHandler.js';
import authRouter from './routes/authRouter.js'
import userRouter from './routes/userRouter.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(helmet())
app.use(cors({origin: ['https://mydomain.com','http://127.0.0.1:5500']}))
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use((req, res, next) => {
  res.on('finish', () => {
    console.log('--- Yanıt Başlıkları ---');
    console.log(res.getHeaders());
  });
  next();
});

app.use((req, res, next) => {
  console.log("İstek geldi, Origin:", req.headers.origin);
  next();
});

app.use('/api', authRouter)
app.use('/api', userRouter)


app.use((req, res, next) => {
  return next(new ErrorHandler('Page Not Found', 404))
})

app.use((err,req, res, next) => {
  console.error(err.stack)
  const statusCode = err.statusCode

  res.status(statusCode).json({
    success: false,
    url: req.url,
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl,
    timestamp: new Date().toISOString(),
    message: err.isOperational ? err.message: 'Server Error!',
    stack: process.env.NODE_ENV == 'development' ? err.stack : undefined
  })
})



const startServer = async () => {
  try {
    app.listen(PORT, () => console.log('Server is runngin on PORT', PORT))
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

startServer()




//index.html
<!DOCTYPE html>
<html>
<body>
    <h1>CORS Test Paneli</h1>
    <button onclick="fetchData()">Veri Çek</button>
    <p id="result"></p>

    <script>
        async function fetchData() {
            try {
                const response = await fetch('http://localhost:3000/api');
                const data = await response.json();
                document.getElementById('result').innerText = data.message;
            } catch (error) {
                document.getElementById('result').innerText = 'Hata: ' + error.message;
                console.error('CORS Hatası:', error);
            }
        }
    </script>
</body>
</html>
