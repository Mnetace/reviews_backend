import mongoose from 'mongoose'

const TopicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  group: {
    type: String,
    required: true,
  },
})

export default mongoose.model('Topic', TopicSchema)
