import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
const app = express()


app.use('/', createProxyMiddleware({
  target: 'http://localhost:4000',
  changeOrigin: true,
  pathRewrite:{
    '^/':'/'
  }
}))

app.listen(3000)