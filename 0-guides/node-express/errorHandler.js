class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError
 
 
index.js
app.use((err, req, res, next) => {
  console.error(err.stack);
  
   //logger error
   logger.error('Unhandled Error', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
    message: err.isOperational ? err.message : 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;

  logger.error({
    success: false,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  res.status(statusCode).json({
    success: false,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    message:
      process.env.NODE_ENV === "production" && !err.isOperational
        ? "Internal Server Error!"
        : err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

