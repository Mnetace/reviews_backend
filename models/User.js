import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: 'user',
    },
    is_blocked: {
      type: Boolean,
      required: true,
      default: false,
    },
    likes_number: {
      type: Number,
      default: null,
    },
    properties: {
      theme: {
        type: String,
        required: true,
        default: 'light',
      },
      language: {
        type: String,
        required: true,
        default: 'English',
      },
    },
    avatar_url: String,
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('User', UserSchema)
