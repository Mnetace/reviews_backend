import express from 'express'
import cors from 'cors'
import userRoutes from './routes/user.routes.js'
import postRoutes from './routes/post.routes.js'
import tagRoutes from './routes/tag.routes.js'
import topicRoutes from './routes/topic.routes.js'
import topicGroups from './routes/topicGroup.routes.js'
// noinspection ES6UnusedImports
import { db, session } from './mongoose.js'
import handleErrors from './middleware/handleErrors.js'
import async from 'express-async-errors'
import parseToken from './middleware/parseToken.js'

const app = express()
app.use(express.json())
app.use(cors())

app.use(parseToken)

app.use('/auth', userRoutes)
app.use('/posts', postRoutes)
app.use('/tags', tagRoutes)
app.use('/topics', topicRoutes)
app.use('/topicGroups', topicGroups)

app.use(handleErrors)

app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    return console.error(err)
  }
  console.log('The server is running at PORT = 4444!')
})
