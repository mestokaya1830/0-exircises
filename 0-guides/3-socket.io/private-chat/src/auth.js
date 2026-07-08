import jwt from 'jsonwebtoken'

const auth = (socket, next) => {
  try {
    const token = socket.handshake.auth.token
    if(!token){
      console.error('No Token')
    }

    const decoded = jwt.verify(token, '12345')
    socket.apiKey = decoded.apiKey
    socket.companyId = decoded.companyId
    next()
  } catch (error) {
    console.error(error)
  }
}

export default auth