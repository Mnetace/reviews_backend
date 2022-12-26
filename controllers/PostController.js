import PostModel from '../models/Post.js'
import PostLike from '../models/PostLike.js'
import UserModel from '../models/User.js'
import PostSchema from '../models/Post.js'
import { session } from './../mongoose.js'
import { HttpError } from './errors/HttpError.js'
import TopicModel from '../models/Topic.js'
import TagModel from '../models/Tag.js'
import mongoose from 'mongoose'
import {knownTopicGroups} from "./TopicGroupController.js";

// getOrCreateTopic("id", undefined)
// getOrCreateTopic(undefined, {title: "t", group: "Films"})
// returns ObjectId("topic id")
const getOrCreateTopic = async (existingTopicId, newTopic) => {
  if (existingTopicId && newTopic) {
    throw new HttpError(400, 'Pass either topic_id or topic fields but not both')
  }
  if (existingTopicId) {
    if (!(await TopicModel.findOne({_id: existingTopicId}))) {
      throw new HttpError(400, `Topic ${existingTopicId} not found`)
    }
    return new mongoose.Types.ObjectId(existingTopicId)
  }

  if (!knownTopicGroups.includes(newTopic.group)) {
    throw new HttpError(
        400,
        `Unknown topic group: ${newTopic.group}. ` +
        `Should be one of: ${knownTopicGroups.join(', ')}`
    )
  }
  const topicDoc = new TopicModel({
    title: newTopic.title,
    group: newTopic.group,
  })
  await topicDoc.save()
  return topicDoc._id
}

// oldTags and newTags are arrays of tag names
const handleTagsChange = async (oldTags, newTags) => {
  const tagsDeleted = oldTags.filter(oldTag => !newTags.includes(oldTag))
  const tagsAdded = newTags.filter(newTag => !oldTags.includes(newTag))

  await Promise.all(tagsAdded.map(tagAdded => TagModel.findOneAndUpdate(
      {text: tagAdded},
      {text: tagAdded},
      {upsert: true, new: true, setDefaultsOnInsert: true}
  ).exec()))

  await Promise.all(tagsDeleted.map(async tagDeleted => {
    const postsWithTheTag = await PostModel.find({tags: {$elemMatch: {$eq: tagDeleted}}}).exec()
    if (postsWithTheTag.length === 0) {
      await TagModel.deleteOne({text: tagDeleted}).exec()
    }
  }))
}

const preparePostAggregation = (matchCondition, viewingUserId) => {
  return [
    matchCondition,
    {
      $project: {
        title: 1,
        text: 1,
        rating: 1,
        comments: 1,
        createdAt: 1,
        updatedAt: 1,
        user_id: 1,
        tags: 1,
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
                $eq: ['$user_id', new mongoose.Types.ObjectId(viewingUserId)],
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

const checkUserPostAccess = (postUserId, loggedInUserId, loggedInUserRole, action) => {
  if (postUserId !== loggedInUserId && loggedInUserRole !== 'admin') {
    throw new HttpError(403, `You are not allowed to ${action} this post`)
  }
}

export const updatePostLike = async (req, res, addLike) => {
  await session.withTransaction(async () => {
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
    res.json({ success: true })
  })
}

// req.body.tags - tag names array
// req.body.topic_id || req.body.topic === {title, group}
export const create = async (req, res) => {
  const userId = req.body.user_id || req.userId
  checkUserPostAccess(userId, req.userId, req.userRole, 'create')

  await session.withTransaction(async () => {
    // todo: check user exists
    const topicId = await getOrCreateTopic(req.body.topic_id, req.body.topic)
    const doc = new PostModel({
      title: req.body.title,
      topic_id: topicId,
      tags: req.body.tags,
      text: req.body.text,
      image_url: req.body.image_url,
      rating: req.body.rating,
      user_id: new mongoose.Types.ObjectId(userId),
    })
    const post = await doc.save()
    await handleTagsChange([], req.body.tags)
    res.json({
      success: true,
      post_id: post._id.toString()
    })
  })
}

export const get_one = async (req, res) => {
  const match = {
    $match: {
      _id: new mongoose.Types.ObjectId(req.params.id),
    },
  }

  const posts = await PostModel.aggregate(preparePostAggregation(match, req.userId)).exec()
  if (posts.length === 0) {
    throw new HttpError(404, 'Post not found')
  }

  res.json(posts[0])
}

// Possible query params:
//    sort=field or sort=-field    (to set sort order)
//    tag=tag_name                 (to show posts for tag)
//    user_id=
//    topic_id=
export const get_all = async (req, res) => {
  const sortOrder = req.query.sort || '-createdAt'
  const filter = {}
  req.query.user_id && (filter.user_id = req.query.user_id)
  req.query.topic_id && (filter.topic_id = req.query.topic_id)
  req.query.tag && (filter.tags = {$elemMatch: {$eq: req.query.tag}})

  const match = {
    $match: filter,
  }

  const posts = await PostModel.aggregate(preparePostAggregation(match, req.userId))
    .sort(sortOrder)
    .exec()

  res.json(posts)
}

export const remove = async (req, res) => {
  const postFilter = { _id: new mongoose.Types.ObjectId(req.params.id) }
  const post = await PostModel.findOne(postFilter)
  if (!post) {
    throw new HttpError(404, 'Post not found')
  }

  checkUserPostAccess(post.user_id.toString(), req.userId, req.userRole, 'delete')

  await session.withTransaction(async () => {
    await PostModel.findOneAndDelete(postFilter).exec()
    await handleTagsChange(post.tags, [])
    res.json({ success: true })
  })
}

export const update = async (req, res) => {
  const postId = req.params.id
  const post = await PostModel.findOne({_id: postId})
  checkUserPostAccess(post.user_id.toString(), req.userId, req.userRole, 'update')

  await session.withTransaction(async () => {
    await PostModel.updateOne(
        {
          _id: postId,
        },
        {
          title: req.body.title,
          tags: req.body.tags,
          text: req.body.text,
          image_url: req.body.image_url,
          rating: req.body.rating,
        }
    )
    await handleTagsChange(post.tags, req.body.tags)
    res.json({ success: true })
  })
}

export const addLike = async (req, res) => {
  await updatePostLike(req, res, true)
}

export const removeLike = async (req, res) => {
  await updatePostLike(req, res, false)
}
