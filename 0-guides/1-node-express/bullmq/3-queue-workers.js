import { Worker, Queue } from "bullmq";
import connectRedis from "../redis/connectRedis.js";

const deadLetterQueue = new Queue("email-dlq", { connection: connectRedis });

const worker = new Worker(
  "reset-password-queue",
  async (job) => {
    const { to, subject, body } = job.data;
  },
  {
    connection: connectRedis,
    concurrency: 5,
  },
);

worker.on("completed", (job) => console.log("COMPLETED", job.id));
worker.on("error", (err) => console.log("ERROR", err));
worker.on('failed', async (job, err) => {
  console.log('Failed:', job.id, err.message)
  if (job.attemptsMade === job.opts.attempts) {
    await deadLetterQueue.add('failed-job', {
      originalJob: job.data,
      error: err.message,
    })
  }
})

export default worker;

