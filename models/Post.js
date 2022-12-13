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
    // TODO
    topic_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
    },
    // TODO: tag_names (only names wihtout IDs)
    tag_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
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
