export default (req, res, next) => {
  if (req.userId) {
    next()
  } else {
    return res.status(403).json({
      message: 'No access!',
    })
  }
}
