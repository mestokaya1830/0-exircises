sudo systemctl restart prometheus

👉control metrics 
http://localhost:4000/metrics
http://localhost:9090/api/v1/targets

👉 go to garafana 
install garafana on linux go to garafana web site
sudo apt-get install prometheus-node-exporter -y
sudo systemctl start prometheus-node-exporter
sudo systemctl enable prometheus-node-exporter

 http://localhost:3000
 user = admin pass = admin
  
👉 bind prome to garafana

🖥️ 1) Server monitoring (1860)
CPU
RAM
Disk
Network
System load

Settings (⚙️)
Data Sources
Add data source
Prometheus seç
http://localhost:9090 //url bolumune bunu ekle
dashboard links menu new -> Import
dashboard ID  1860
click import


👉 “Bu değer sürekli değişiyor mu?” → Gauge
👉 “Toplam sayım mı?” → Counter
👉 “Süre / dağılım mı?” → Histogram









import dotenv from "dotenv";
dotenv.config();
import express from "express";
import http from "http";
import helmet from "helmet";
import cors from "cors";
import AppError from "./middleware/appError.js";
import logger from "./winston/logger.js";
import httpLogger from "./winston/httpLogger.js";
import processHandler from "./utils/processHandler.js";
import client from "prom-client";
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import connectMongo from "./mongodb/connectMongo.js";
import { initSocket } from "./sockets/initSocket.js";

const app = express();
const PORT = process.env.PORT || 5000;
client.collectDefaultMetrics();

app.use(helmet());
app.use(
  cors({
    origin: ["http://fronetne.com"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("src/public"));
app.use(httpLogger);

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
     const route = (req.baseUrl || '') + (req.route?.path || req.originalUrl.split('?')[0])
    const duration = (Date.now() - start) / 1000;

    httpRequestDurationSeconds
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);

    httpRequestsTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
  });
  next();
});

app.get("/metrics", async (req, res, next) => {
  try {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
  } catch (error) {
    res.status(500).end(error.message);
  }
});

app.use("/api/auth", authRouter);
app.use("/api", userRouter);

app.use((req, res, next) => {
  return next(new AppError("Page Not Found!", 404, "PAGE_NOT_FOUND"));
});

app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;

  logger.error({
    requestID: req.id,
    ip: req.ip,
    url: req.originalUrl,
    method: req.method,
    status: err.status,
    code: err.code,
    message: err.isOperational ? err.message : "Server Error",
  });

  res.status(statusCode).json({
    requestID: req.id,
    ip: req.ip,
    url: req.originalUrl,
    method: req.method,
    status: err.status,
    code: err.code,
    timestamp: new Date().toISOString(),
    message: err.isOperational ? err.message : "Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const startServer = async () => {
  try {
    await connectMongo();
    const appServer = http.createServer(app);
    initSocket(appServer);
    const server = appServer.listen(PORT, () =>
      console.log("Server is running on PORT", PORT),
    );
    processHandler(server);
  } catch (error) {
    console.error(error);
    logger.error(error);
    process.exit(1);
  }
};

startServer();

