import dotenv from "dotenv";
dotenv.config();

import express from "express";
import helmet from "helmet";
import cors from "cors";
import catchAsync from "./middleware/cacthAsync.js";
import ErrorHandler from "./middleware/errorHandler.js";
import {httpLogger, logger} from "./middleware/httpLogger.js";
const app = express();

app.use(helmet());
app.use(cors({ origin: ["http://myapp.com", "http://www.myapp.com"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger)

app.get(
  "/",
  catchAsync(async (req, res) => {
    res.send("Hello, World!");
  }),
);

app.use((req, res, next) => {
  return next(new ErrorHandler(404,"Not Found"));
});

app.use((err, req, res, next) => {
  //logger error
   logger.error('Unhandled Error', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });


  //sysyem error
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.isOperational ? err : "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const start = async () => {
  try {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
    process.exit(1);
  }
};

start();

