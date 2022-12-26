import express from 'express'
import cors from 'cors'
// noinspection ES6UnusedImports
import { db, session } from './mongoose.js'
import handleErrors from './middleware/handleErrors.js'
import async from 'express-async-errors'
import parseToken from './middleware/parseToken.js'
import routes from "./routes/index.js";

const app = express()
app.use(express.json())
app.use(cors())
app.use(parseToken)
app.use('/', routes)
app.use(handleErrors)

app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    return console.error(err)
  }
  console.log('The server is running at PORT = 4444!')
})
