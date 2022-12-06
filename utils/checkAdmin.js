import UserModel from '../models/User.js'

export default async (req, res, next) => {
  const user = await UserModel.findById(req.user_id)
  const user_role = user.role

  if (user_role === 'admin') {
    next()
  } else {
    return res.status(403).json({
      message: 'The user is not an administrator!',
    })
  }
}
