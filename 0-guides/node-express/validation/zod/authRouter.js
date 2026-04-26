import express from 'express'
import catchAsync from '../middelware/catchAsync.js';
import ErrorHandler from '../middelware/errorHandler.js';
import userSC from '../models/userSC.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validate from '../middelware/validate.js'
import { registerSchema } from '../validation/registerSC.js';

const router = express.Router()

router.post('/register', validate(registerSchema), catchAsync(async(req, res, next) => {  
  const { username, email, password } = req.body

  const newUser = new userSC({
    username,
    email,
    password: await bcrypt.hash(password, 10)
  })
  if(!newUser) {
    return next(new ErrorHandler('Server Error', 500))
  }

  console.log(newUser)
  await newUser.save()

  res.status(201).json({
    success: true,
    message:'User created!'
  })
}))

router.post('/login', catchAsync(async(req, res, next) => {
  const { email, password } = req.body
  console.log(password)
 const user = await userSC.findOne({email: email}).select('+password')
 if(!user){
  return next(new ErrorHandler('User not found!', 400))
 }
 const isMatchPassword = await bcrypt.compare(password, user.password)
 
 if(!isMatchPassword){
  return next(new ErrorHandler('User or password is invalid!', 400))
 }

 const token = jwt.sign({id: user.id}, process.env.JWT, {expiresIn: '1h'})
  res.status(201).json({
    success: true,
    message:'Welcome to Mesfor!',
    token
  })
}))


export default router