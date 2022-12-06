import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import { UserController } from './controllers/index.js'
import {
  checkAuth,
  checkAdmin,
  checkMe,
  handleValidationErrors,
} from './utils/index.js'
import {
  loginValidation,
  registerValidation,
} from './validations/UserValidations.js'

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

app.post(
  '/auth/register',
  registerValidation,
  handleValidationErrors,
  UserController.register
)
app.post(
  '/auth/login',
  loginValidation,
  handleValidationErrors,
  UserController.login
)

app.get('/auth/me', checkAuth, UserController.get_me)
app.get('/auth/all', checkAuth, checkAdmin, UserController.get_all)

// Update any user (administrator only)
app.patch('/auth/update/:id', checkAuth, checkAdmin, UserController.update)
// Update yourself (only to yourself)
app.patch('/auth/update/me/:id', checkAuth, checkMe, UserController.update_me)
// Update the rating to the user (all users)
app.patch('/auth/update/rating/:id', checkAuth, UserController.update_rating)

// Delete any user (administrator only)
app.delete('/auth/remove/:id', checkAuth, checkAdmin, UserController.remove)
// Delete yourself (only to yourself)
app.delete('/auth/remove/me/:id', checkAuth, checkMe, UserController.remove)

app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    return console.error(err)
  }
  console.log('The server is running at PORT = 4444!')
})
