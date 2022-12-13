import express from 'express'
import { TopicGroupController } from '../controllers/index.js'

const router = express.Router()

router.get('/', TopicGroupController.get_all)

export default router
