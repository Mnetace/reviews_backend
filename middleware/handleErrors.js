export default (err, req, res, next) => {
  const status = Number.isInteger(err.status) ? err.status : 500
  res.status(status).json({
    message: err.message || 'Failed to complete operation: ' + err,
  })
}
