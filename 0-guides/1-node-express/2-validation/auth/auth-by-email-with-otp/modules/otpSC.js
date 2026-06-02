import Mongoose from 'mongoose'

const OtpSchema = new Mongoose.Schema({
  name: {
    type: String, 
    required: [true, 'Name required!']
  },
  email: {
    type: String, 
    required: [true, 'Email required!']
  },
  password: {
    type: String, 
    required: [true, 'Password required!']
  },
  otp: {
    type: String, 
    required: [true,'Otp required!']
  },
  created_at: {
    type: Date,
    default: Date.now(),
    index: {expires: '1000'}
  }
})

export default  Mongoose.model('otp', OtpSchema)