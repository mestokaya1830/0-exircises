import express from 'express'
import helmet from 'helmet'
const app = express()


app.use(helmet())
app.use(express.json())

app.get('/', (req, res) => {
  res.status(200).json({result: 'This app is running on PORT 4000 redirected from proxy server 3000'})
})


app.listen(4000, () => console.log('Server is running on port 4000'))