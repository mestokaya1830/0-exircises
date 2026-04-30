import dotenv from "dotenv";
dotenv.config();

import processHandlers from "./loader/processHandler.js";
processHandlers()

import express from "express";
import helmet from "helmet";
import cors from "cors";

import ErrorHandler from "./middleware/errorHandler.js";
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import logger from "./loggers/logger.js";
import httpLogger from "./loggers/httpLogger.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: ["https://frontend.com"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger)



app.use("/api/auth", authRouter);
app.use("/api", userRouter);




app.use((req, res, next) => {
  return next(new ErrorHandler("Page Not Found!", 404));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;

  logger.error({
    success: false,
    url: req.url,
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl,
    timestamp: new Date().toISOString(),
    ip: req.ip,
    method: req.method,
    message: err.isOperational ? err.message : "Server Error!",
  });
  res.status(statusCode).json({
    success: false,
    url: req.url,
    baseUrl: req.baseUrl,
    otiginalUrl: req.originalUrl,
    timestamp: new Date().toISOString(),
    ip: req.ip,
    method: req.method,
    message: err.isOperational ? err.message : "Server Error!",
    stack: process.env.NODE_ENV == "development" ? err.stack : undefined,
  });
});

const startServer = async () => {
  try {
    app.listen(PORT, () => console.log("Server is running on PORT", PORT));
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

startServer();

