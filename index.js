import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import userRoutes from './routes/user.routes.js'
import postRoutes from './routes/post.routes.js'
import tagRoutes from './routes/tag.routes.js'
import topicRoutes from './routes/topic.routes.js'

mongoose
  .connect(
    'mongodb+srv://admin:wwwwww@cluster0.lpglxzt.mongodb.net/viewer?retryWrites=true&w=majority'
  )
  .then(() => {
    console.log('The DB is OK!')
  })
  .catch((err) => {
    console.log('The DB is error!', err)
  })

const app = express()
app.use(express.json())
app.use(cors())

app.use('/auth', userRoutes)
app.use('/posts', postRoutes)
app.use('/tags', tagRoutes)
app.use('/topics', topicRoutes)

app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    return console.error(err)
  }
  console.log('The server is running at PORT = 4444!')
})
