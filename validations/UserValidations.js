import { body } from 'express-validator'

export const loginValidation = [
  body('email', 'Invalid e-mail format').isEmail(),
  body('password', 'The password must contain at least 5 characters').isLength({
    min: 5,
  }),
]

export const registerValidation = [
  body('email', 'Invalid e-mail format').isEmail(),
  body('password', 'The password must contain at least 5 characters').isLength({
    min: 5,
  }),
  body('first_name', 'Enter the correct first name').isLength({ min: 1 }),
  body('last_name', 'Enter the correct last name').isLength({ min: 1 }),
  body('avatar_url', 'Incorrect link to the avatar').optional(),
]
