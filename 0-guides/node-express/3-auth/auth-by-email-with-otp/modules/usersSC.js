import Mongoose from 'mongoose'

const UsersSchema = new Mongoose.Schema({
  name: {
    type: String, 
    required: [true, 'Name required!']
  },
  email: {
    type: String, 
    required: [true,'Email required!'],
    minlength:[4,'Email must be less 10 charecters!']
  },
  password: {
    type: String, 
    required: [true,'Password required!'],
    minlength:[4,'Password must be less 4 charecters!']
  },
  created_at: {
    type: Date, 
    default: Date.now()
  }
})

export default  Mongoose.model('Users', UsersSchema)