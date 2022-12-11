import express from 'express'
import { UserController } from '../controllers/index.js'
import { checkAuth, handleValidationErrors } from '../middleware/index.js'
import {
  loginValidation,
  registerValidation,
} from '../validations/UserValidations.js'

const router = express.Router()

// Create user
router.post(
  '/register',
  registerValidation,
  handleValidationErrors,
  UserController.register
)
// Login user
router.post(
  '/login',
  loginValidation,
  handleValidationErrors,
  UserController.login
)

// Get me
router.get('/me', checkAuth, UserController.get_me)
// Get all users (admins only)
router.get('/all', checkAuth, UserController.get_all)

router.patch('/:id', checkAuth, UserController.update)

router.delete('/:id', checkAuth, UserController.remove)

export default router
