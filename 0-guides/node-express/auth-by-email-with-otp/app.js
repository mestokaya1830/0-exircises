import express from 'express'
const app = express()
import db from './modules/db.js'
import helmet from 'helmet'
import dotenv from 'dotenv'
import authRouter from './routers/authRouter.js'
import usersRouter from './routers/usersRouter.js'

dotenv.config()
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('static'))

app.use('/api', authRouter)
app.use('/api', usersRouter)

app.use((error, req, res, next) => {
  console.error({error})
  res.json({error})
})

//listen server
app.listen(process.env.PORT || 3000, () => {
  console.log('Server listen...')
})