import PostModel from '../models/Post.js'
import PostLike from '../models/PostLike.js'
import UserModel from '../models/User.js'
import PostSchema from '../models/Post.js'
import { session } from './../mongoose.js'
import { HttpError } from './errors/HttpError.js'
import TopicModel from '../models/Topic.js'
import mongoose from 'mongoose'

// TODO
const getOrCreateTopic = (req) => {}

// TODO: create and delete tags (if not connections with another posts)
const proccesTags = (oldTags, newTags) => {}

const agregation = (match, userId) => {
  return [
    match,
    {
      $project: {
        title: 1,
        text: 1,
        rating: 1,
        comments: 1,
        createdAt: 1,
        updatedAt: 1,
        user_id: 1,
        tag_ids: 1,
        topic_id: 1,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $lookup: {
        from: 'tags',
        localField: 'tag_ids',
        foreignField: '_id',
        as: 'tags',
      },
    },
    {
      $lookup: {
        from: 'topics',
        localField: 'topic_id',
        foreignField: '_id',
        as: 'topic',
      },
    },
    {
      $lookup: {
        from: 'postlikes',
        localField: '_id',
        foreignField: 'post_id',
        as: 'post_likes',
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$user_id', new mongoose.Types.ObjectId(userId)],
              },
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: '$topic',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        title: 1,
        text: 1,
        rating: 1,
        comments: 1,
        createdAt: 1,
        user: {
          first_name: 1,
          last_name: 1,
          likes_number: 1,
          avatar_url: 1,
        },
        tags: 1,
        topic: 1,
        has_user_like: {
          $eq: [
            {
              $size: '$post_likes',
            },
            1,
          ],
        },
      },
    },
  ]
}
// TODO: write the check in a separate file (for users and posts)
const userValidation = (userId, reqId, role, message) => {
  if (userId !== reqId && role !== 'admin') {
    res.status(403).json({
      message: `Failed to ${message} an post`,
    })
  }
}

export const updatePostLike = async (req, res, addLike) => {
  const post = await PostSchema.findById(req.params.id)

  if (post === undefined) {
    throw new HttpError(400, 'Post not found')
  }

  const postLikeData = {
    user_id: req.userId,
    post_id: req.params.id,
  }

  const postLike = await PostLike.findOne(postLikeData)

  if (addLike && postLike !== null) {
    throw new HttpError(409, 'Like is already added')
  }

  if (!addLike && postLike === null) {
    throw new HttpError(409, 'Like does not exist')
  }

  session.startTransaction()
  try {
    if (addLike) {
      await new PostLike(postLikeData).save()
    } else {
      await PostLike.deleteOne(postLikeData)
    }
    await UserModel.updateOne(
      {
        _id: post.user_id,
      },
      {
        $inc: { likes_number: addLike ? 1 : -1 },
      }
    )
    session.commitTransaction()
  } catch (e) {
    session.abortTransaction()
    throw e
  }

  res.json({
    success: true,
  })
}
// TODO: (create and update (only for tags without topic))
// req.body.tags
// req.body.topic_id || req.body.topic === {title, group}
export const create = async (req, res) => {
  try {
    const userId = req.body.user_id || req.userId

    userValidation(userId, req.userId, req.userRole, 'create')

    const topicId = getOrCreateTopic(req)

    // TODO: session.startTransaction
    proccesTags([], req.body.tags)

    // TODO:
    // const topic = new TopicModel({
    //   title: req.body.title,
    //   group: req.body.group,
    // })
    //
    // const topic = await doc.save()

    const doc = new PostModel({
      title: req.body.title,
      topic_id: topicId,
      tag_ids: req.body.tags,
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
  const match = {
    $match: {
      _id: new mongoose.Types.ObjectId(req.params.id),
    },
  }

  const posts = await PostModel.aggregate(agregation(match, req.userId)).exec()

  if (posts.length === 0) {
    res.status(404).json({
      message: 'Post not found',
    })
    return
  }

  res.json(posts[0])
}

export const get_all = async (req, res) => {
  try {
    const sortOrder = req.query.sort || '-createdAt'
    const userId = req.query.user_id

    const filterCondition = userId ? { user_id: userId } : {}

    const match = {
      $match: filterCondition,
    }

    const posts = await PostModel.aggregate(agregation(match, req.userId))
      .sort(sortOrder)
      .exec()

    res.json(posts)
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Failed to get posts',
    })
  }
}

export const remove = async (req, res) => {
  try {
    const postId = req.params.id

    const post = await PostModel.findOne(postId)

    userValidation(post.user_id, req.userId, req.userRole, 'delete')

    proccesTags(post.tags, [])

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

    const post = await PostModel.findOne(postId)

    proccesTags(post.tags, req.body.tags)

    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        topic_id: req.body.topic_id,
        tag_ids: req.body.tags,
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

export const addLike = async (req, res) => {
  await updatePostLike(req, res, true)
}

export const removeLike = async (req, res) => {
  await updatePostLike(req, res, false)
}
