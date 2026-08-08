import express from 'express'
const Router = express.Router()
import Users  from '../modules/usersSC.js'
import tryCatch from '../middleware/tryCatch.js'

Router.get('/users', tryCatch(async(req, res) => {
  const allUsers = await Users.find({})
  res.json({users: allUsers})
}))
export default Router