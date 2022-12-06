export default async (req, res, next) => {
  if (req.params.id === req.user_id) {
    next()
  } else {
    return res.status(403).json({
      message: 'No access!',
    })
  }
}
