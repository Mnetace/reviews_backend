import express from "express";
import userRoutes from "./user.routes.js";
import postRoutes from "./post.routes.js";
import tagRoutes from "./tag.routes.js";
import topicRoutes from "./topic.routes.js";
import topicGroups from "./topicGroup.routes.js";

const router = express.Router()

router.use('/auth', userRoutes)
router.use('/posts', postRoutes)
router.use('/tags', tagRoutes)
router.use('/topics', topicRoutes)
router.use('/topicGroups', topicGroups)

export default router