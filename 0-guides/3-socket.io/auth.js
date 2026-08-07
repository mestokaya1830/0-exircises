import AppError from "../utils/app.error.js";
import jwt from  'jsonwebtoken'
import env from '../config/env.js'


const auth = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token
    if(!token){
      return next(new AppError('Invalid Token', 401, 'INVALID_TOKEN'))
    }
    const decoded = jwt.verify(token, env.JWT_SECRET)
    socket.apiKey = decoded.apiKey
    socket.tenantId = decoded.tenantId
    next()
  } catch (error) { 
    console.error(error)
    return next(new AppError(error, 500, 'SERVER_ERROR'))
  }
}

export default auth
