export default (err, req, res, next) => {
  console.log(err)
  const status = Number.isInteger(err.status) ? err.status : 500
  res.status(status).json({
    message: err.message || 'Failed to complete operation: ' + err,
  })
}
