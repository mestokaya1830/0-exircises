import jwt from 'jsonwebtoken'


const auth = (socket, next) => {
  try {
    const token = socket.handshake.auth.token
    console.log(token)
    if(!token) {
      console.log('Unauthorized', 401, 'UNAUTHORIZED')
    }
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT)
    const user = decoded
    const apiKey = decoded
    next()
  } catch (error) {
    console.log('Invalid Token', 401, 'INVALID_TOKEN')
  }
}

export default auth
