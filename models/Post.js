import mongoose from 'mongoose'

const commentsModel = new mongoose.Schema({
  type: String,
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
})

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    topic_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
    },
    tags: [String],
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
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('Post', PostSchema)
