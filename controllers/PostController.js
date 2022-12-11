import PostModel from '../models/Post.js'

export const create = async (req, res) => {
  try {
    const userId = req.body.user_id || req.user_id

    if (userId !== req.user_id && req.userRole !== 'admin') {
      res.status(403).json({
        message: 'Failed to create an article',
      })
    }

    const doc = new PostModel({
      title: req.body.title,
      topic_id: req.body.topic_id,
      tags: req.body.tags,
      text: req.body.text,
      image_url: req.body.image_url,
      rating: req.body.rating,
      user_id: userId,
    })

    const post = await doc.save()

    res.json(post)
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Failed to create an article',
    })
  }
}

export const get_one = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id)
    // Добавить post.has_like (смотреть в PostLike по req.user_id и post._id)
    // Добавить post.topic_title (смотреть в Topic по post.topic_id)
    // Добавить post.tags_text (смотреть в Tag по post.tags)
    // Посмотреть mongo агрегацию
    if (!post) {
      console.log(err)
      return res.status(500).json({
        message: 'Failed to return the article',
      })
    }

    res.json(post)
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Failed to get articles',
    })
  }
}

export const get_all = async (req, res) => {
  try {
    const sortOrder = req.query.sort || '-createdAt'
    const userId = req.query.user_id

    const filterCondition = userId ? { user_id: userId } : {}

    const posts = await PostModel.find(filterCondition).sort(sortOrder).exec()

    res.json(posts)
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Failed to get articles',
    })
  }
}

export const remove = async (req, res) => {
  try {
    const postId = req.params.id

    PostModel.findOneAndDelete(
      {
        _id: postId,
      },
      (err, doc) => {
        if (err) {
          console.log(err)
          return res.status(500).json({
            message: 'Couldn not delete the article',
          })
        }

        if (!doc) {
          return res.status(404).json({
            message: 'Article not found',
          })
        }

        res.json({
          succes: true,
        })
      }
    )
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Failed to get articles',
    })
  }
}

export const update = async (req, res) => {
  try {
    const postId = req.params.id
    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        topic_id: req.body.topic_id,
        tags: req.body.tags,
        text: req.body.text,
        image_url: req.body.image_url,
        rating: req.body.rating,
      }
    )
    res.json({
      success: true,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Failed to update an article',
    })
  }
}
