import express from 'express'
const app = express()
import https from 'https'
import path from 'path'
import fs from 'fs'

app.get('/', (req, res, next) => {
  res.json({data:'Secure'})
})


const server = https.createServer({
  key: fs.readFileSync(path.resolve('cert/key.pem')),
  cert: fs.readFileSync(path.resolve('cert/cert.pem'))
}, app)

server.listen(3443, () => {
  console.log('Ssl server is running...')
})
