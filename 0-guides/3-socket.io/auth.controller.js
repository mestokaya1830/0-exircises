import jwt from 'jsonwebtoken'

export const login = async(req, res, next) => {
  const {apiKey, companyId} = req.body
  if(companyId !== 'mesfor'){
    console.log('Invalid Credentials')
    return
  }
  const token = jwt.sign({apiKey, companyId}, '12345', {expiresIn: '1h'})
  res.json({
    success: true,
    token
  })
}