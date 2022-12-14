import express from 'express'
import { PostController } from '../controllers/index.js'
import { checkAuth } from '../middleware/index.js'
import {getAllPostsValidation, postCreateValidation, postUpdateValidation} from "../validations/PostValidations.js";

const router = express.Router()

// Get one post
router.get('/:id', PostController.get_one)
// Get all posts (query - sort, user_id)
router.get('/', getAllPostsValidation, PostController.get_all)

// Create post (optional user_id field for admins)
router.post('/', checkAuth, ...postCreateValidation, PostController.create)

// Update post
router.patch('/:id', checkAuth, ...postUpdateValidation, PostController.update)

// Delete post
router.delete('/:id', checkAuth, PostController.remove)

// Add like to post
router.post('/:id/like', checkAuth, PostController.addLike)
// Remove like from post
router.delete('/:id/like', checkAuth, PostController.removeLike)

export default router
