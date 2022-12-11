import express from 'express'
import { PostController } from '../controllers/index.js'
import { checkAuth } from '../middleware/index.js'

const router = express.Router()

// Get one post
router.get('/:id', PostController.get_one)
// Get all posts (query - sort, user_id)
router.get('/', PostController.get_all)

// Create post (optional user_id field for admins)
router.post('/', checkAuth, PostController.create)

// Update post
router.patch('/:id')

// Delete post
router.delete('/:id', checkAuth, PostController.remove)

export default router
