import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username must be at most 30 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscore'],
      unique: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/([^ ]+)@([^ ]+)\.([a-z]{2,3})(\.[a-z]{2,3})?$/, 'Email is not valid'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // query'lerde password otomatik gelmez
    },

    role: {
      type: String,
      enum: {
        values: ['user', 'admin', 'moderator'],
        message: '{VALUE} is not a valid role',
      },
      default: 'user',
    },

    age: {
      type: Number,
      min: [18, 'Age must be at least 18'],
      max: [120, 'Age must be at most 120'],
    },

    phone: {
      type: String,
      match: [/^\+?[1-9]\d{7,14}$/, 'Phone number is not valid'],
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    profileImage: {
      type: String,
      default: null,
    },

    loginAttempts: {
      type: Number,
      default: 0,
      max: [5, 'Too many login attempts'],
    },
  },
  {
    timestamps: true,           // createdAt, updatedAt otomatik
    versionKey: false,          // __v field'ini kaldırır
  }
)

// ── Index ──────────────────────────────────────────────
userSchema.index({ email: 1 })
userSchema.index({ username: 1 })

const User = mongoose.model('User', userSchema)

export default User
