module.exports = function errorHandler(err, req, res, next) {
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${req.method} ${req.url}`, err);
  } else {
    console.error(`[ERROR] ${req.method} ${req.url}: ${err.message}`);
  }

  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    success:    false,
    message:    err.message || 'An unexpected error occurred',
    statusCode: statusCode,
    data:       null,
  });
};