import { body } from 'express-validator'

export const postCreateValidation = [
  body('title', 'Enter the title of the article')
    .isLength({ min: 2 })
    .isString(),
  body('text', 'Enter the text of the article')
    .isLength({
      min: 5,
    })
    .isString(),
  body('image_url', 'Invalid image link').optional().isString(),
]
