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
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational ?? false;

  logger.error({
    message: err.message,
    stack: err.stack,
    requestID: req.id,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    statusCode,
    isOperational,
  });

  res.status(statusCode).json({
    success: false,
    requestID: req.id,
    message: isOperational ? err.message : "Server Error!",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
});
