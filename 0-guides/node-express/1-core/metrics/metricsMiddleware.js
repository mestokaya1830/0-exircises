import {httpRequestsDuration, httpRequestsTotal, httpErrorsTotal} from "./metrics.js";

const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const route =
      (req.baseUrl || "") + (req.route?.path || req.originalUrl.split("?")[0]);
    const status = String(res.statusCode);
    const labels = { method: req.method, route, status };
    const duration = Date.now() - start / 1000;

    httpRequestsDuration.labels(labels).observe(duration);
    httpRequestsTotal.labels(labels).inc();

    if (status > 400) httpErrorsTotal.labels(labels).inc();
  });
  next();
};

export default metricsMiddleware;
