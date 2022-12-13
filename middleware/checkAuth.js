import jwt from 'jsonwebtoken'

export default (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/Bearer\s?/, '')

  if (req.userId) {
    next()
  } else {
    return res.status(403).json({
      message: 'No access!',
    })
  }
}
