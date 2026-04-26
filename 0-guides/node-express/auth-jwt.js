import jwt from 'jsonwebtoken'
import ErrorHandler from './errorHandler.js';

const auth = (req, res, next) => {
  try {
    const { authorization } = req.headers
    if(!authorization || !authorization.startsWith('Bearer ')){
      return next(new ErrorHandler('Unauthorized!'))
    }
    const token = authorization.replace('Bearer ', '')
    req.user = jwt.verify(token , process.env.JWT)
    next()
  } catch (error) {
    return next(new ErrorHandler('Invalid token!', 401))
  }
} 

export default auth


👉 login route
client must store token in localstoateg or in wuex pinia
app.post('/login', tryCatch(async(req, res, next) => {
  const token = jwt.sign({id: 1}, process.env.JWT_SECRET, {expiresIn: '10m'})
  res.status(200).json({
    status:200,
    success: true,
    message:'Welcome to Mesfor',
    token
  })
}))

👉 client.http
GET http://localhost:3000/admin
Authorization: Bearer token
or in frontend----------------------------------------------
fetch('https://reqbin.com/echo/get/json', {
  headers: {Authorization: 'Bearer {token}'}
})
.then(resp => resp.json())
.then(json => console.log(JSON.stringify(json)))

👉 admin route
app.get('/admin', auth, tryCatch(async(req, res, next) => {
  res.status(200).json({message: 'Welcome to Mesfor'})
}))

