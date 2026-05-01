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
    requestID: req.id,
    ip: req.ip,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    code: err.code,
    status: err.status,
    message: err.isOperational ? err.message : "Server Error",
    stack: process.env.NODE_ENV == "development" ? err.stack : undefined,
  });
});
