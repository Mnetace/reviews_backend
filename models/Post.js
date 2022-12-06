import mongoose from 'mongoose'

const commentsModel = new mongoose.Schema({
  text: String,
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
})

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  topic_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true,
  },
  tag_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  comments: [commentsModel],
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
})

export default mongoose.model('Post', PostSchema)
