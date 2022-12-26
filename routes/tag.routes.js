import express from 'express'
import { TagController } from '../controllers/index.js'

const router = express.Router()

router.get('/', TagController.get_all)

export default router
