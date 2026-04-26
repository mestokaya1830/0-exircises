
npm install @bull-board/api@latest @bull-board/express@latest


import express from "express";
import pkg from "@bull-board/api";
import { ExpressAdapter } from "@bull-board/express";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";

const { createBullBoard } = pkg;

import emailQueue from '../config/connectBullmq.js';

const app = express();

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(emailQueue)], // ✅ QUEUE
  serverAdapter,
});

app.use("/admin/queues", serverAdapter.getRouter());

app.listen(3001, () => {
  console.log("http://localhost:3001/admin/queues");
});



