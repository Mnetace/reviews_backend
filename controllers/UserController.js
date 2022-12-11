import UserModel from '../models/User.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userValidation = (paramId, reqId, role) => {
  if (paramId !== reqId && role !== 'admin') {
    res.status(403).json({
      message: 'Failed to update a user',
    })
  }
}

const createToken = (id, role) => {
  const token = jwt.sign(
    {
      _id: id,
      role: role,
    },
    'secret123',
    {
      expiresIn: '30d',
    }
  )
  return token
}

export const register = async (req, res) => {
  try {
    const password = req.body.password
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const doc = new UserModel({
      email: req.body.email,
      password_hash: hash,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      avatar_url: req.body.avatar_url,
    })

    const user = await doc.save()

    const token = createToken(user._id, user.role)

    const { password_hash, ...user_data } = user._doc

    res.json({
      ...user_data,
      token,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Failed to register!',
    })
  }
}

export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({
      email: req.body.email,
    })
    if (!user) {
      return res.status(404).json({
        message: 'User not found!',
      })
    }

    const is_valid_pass = await bcrypt.compare(
      req.body.password,
      user._doc.password_hash
    )
    if (!is_valid_pass) {
      return res.status(400).json({
        message: 'Invalid login or password!',
      })
    }

    const token = createToken(user._id, user.role)

    delete user._doc.password_hash

    res.json({
      ...user._doc,
      token,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Failed to log in!',
    })
  }
}

export const get_me = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user_id)

    if (!user) {
      return res.status(404).json({
        message: 'User not found!',
      })
    }

    const { password_hash, ...user_data } = user._doc

    res.json(user_data)
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'No access!',
    })
  }
}

export const get_all = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({
        message: 'Failed to get a users list',
      })
    }

    const users = (await UserModel.find().exec()).map((item) => {
      const { password_hash, ...user_data } = item._doc
      return user_data
    })

    if (!users) {
      return res.status(404).json({
        message: 'Users not found!',
      })
    }

    res.json(users)
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'No access!',
    })
  }
}

export const remove = async (req, res) => {
  try {
    const userId = req.params.id

    userValidation(userId, req.user_id, req.userRole)

    UserModel.findOneAndDelete(
      {
        _id: userId,
      },
      (err, doc) => {
        if (err) {
          console.log(err)
          return res.status(500).json({
            message: "Couldn't delete the user!",
          })
        }

        if (!doc) {
          return res.status(404).json({
            message: 'User not found!',
          })
        }

        res.json({
          success: true,
        })
      }
    )
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'No access!',
    })
  }
}

export const update = async (req, res) => {
  try {
    const userId = req.params.id

    userValidation(userId, req.user_id, req.userRole)

    if (req.userRole !== 'admin') {
      await UserModel.updateOne(
        {
          _id: userId,
        },
        {
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          properties: req.body.properties,
          avatar_url: req.body.avatar_url,
        }
      )
      return res.json({
        message: 'Update me success',
      })
    }

    await UserModel.updateOne(
      {
        _id: userId,
      },
      {
        role: req.body.role,
        is_blocked: req.body.is_blocked,
      }
    )
    res.json({
      message: 'Update by admin success',
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'No access.',
    })
  }
}
