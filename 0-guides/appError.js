class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.code = code
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError
 
 
index.js
app.use((err, req, res, next) => {
  console.error(err) // for development mode
  const statusCode = err.statusCode || 500

  logger.error({
    requestID: req.id,
    ip: req.ip,
    url: req.originalUrl,
    method: req.method,
    statusCode,
    code: err.code,
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  })

  res.status(statusCode).json({
    success: false,
    requestID: req.id,
    code: err.code || 'INTERNAL_ERROR',
    message: err.isOperational
      ? err.message
      : 'Internal Server Error',
    err: err //for development
  })
})
