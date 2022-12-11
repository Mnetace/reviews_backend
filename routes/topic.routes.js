import express from 'express'
import { TopicController } from '../controllers/index.js'

const router = express.Router()

router.get('/', TopicController.get_all)

router.post('/', TopicController.create)

export default router
