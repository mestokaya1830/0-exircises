import { randomUUID } from "crypto";

const requestId = (req, res, next) => {
  req.id = req.headers["x-request-id"] || randomUUID();

  // response’a da koy (debug için çok önemli)
  res.setHeader("x-request-id", req.id);

  next();
};

export default requestId;
