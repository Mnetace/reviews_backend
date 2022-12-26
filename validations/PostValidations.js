import {body, query} from 'express-validator'
import handleValidationErrors from "../middleware/handleValidationErrors.js";

const titleRule = body('title')
    .isLength({ min: 2 })
    .isString()

const textRule = body('text')
    .isLength({
      min: 5,
    })
    .isString()

const topicRules = [
  body('topic_id').isString().optional().notEmpty(),
  body('topic').isObject().optional().notEmpty(),
  body('topic.title')
      .if(body('topic').exists())
      .isString()
      .notEmpty(),
  body('topic.group')
      .if(body('topic').exists())
      .isString()
      .notEmpty()
]

const tagsRule = body('tags', 'Invalid tags').isArray().customSanitizer(value => {
  return value.map(tag => tag.toLowerCase())
})

const imageUrlRule = body('image_url').optional().isString().isURL()

const ratingRule = body('rating').isInt({ min: 1, max: 10 })

const userIdRule = body('user_id').optional().isString().notEmpty()

export const postCreateValidation = [
  titleRule,
  textRule,
  ...topicRules,
  tagsRule,
  imageUrlRule,
  ratingRule,
  userIdRule,
  handleValidationErrors
]

export const postUpdateValidation = [
  titleRule,
  textRule,
  tagsRule,
  imageUrlRule,
  ratingRule,
  handleValidationErrors,
]

export const getAllPostsValidation = [
    query('sort').optional().custom(value => {
      const allowedSortOrders = ['createdAt', 'updatedAt', 'rating', 'title']
      // remove 'minus' sign
      const fieldToSort = value.startsWith('-') ? value.substring(1) : value
      if (!allowedSortOrders.includes(fieldToSort)) {
        throw new Error('Unknown sort. Allowed fields are: ' + allowedSortOrders.join(', '))
      }
      return true
    }),
    query('tag').optional().notEmpty(),
    query('topic_id').optional().notEmpty(),
    query('user_id').optional().notEmpty(),
    handleValidationErrors
]