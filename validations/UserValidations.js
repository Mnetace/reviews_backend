import { body } from 'express-validator'
import {handleValidationErrors} from "../middleware/index.js";

const emailRule = body('email', 'Invalid e-mail format').isEmail()
const passwordRule = body('password', 'The password must contain at least 5 characters')
    .isLength({ min: 5 })

export const loginValidation = [
  emailRule,
  passwordRule,
  handleValidationErrors
]

export const registerValidation = [
  emailRule,
  passwordRule,
  body('first_name', 'Enter the correct first name').isLength({ min: 1 }),
  body('last_name', 'Enter the correct last name').isLength({ min: 1 }),
  body('avatar_url', 'Incorrect link to the avatar').optional(),
  handleValidationErrors
]
