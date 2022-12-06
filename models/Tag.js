import mongoose from 'mongoose'

const TagSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    unique: true,
  },
})

export default mongoose.model('Tag', TagSchema)
