import { Worker } from 'bullmq'
import logger from '../utils/logger.js'
import { Queue } from 'bullmq';
const connection = {
  host: 'localhost',
  port: 6379,
  password: '11130113'
}
const deadLetterQueue = new Queue("email-dlq", { connection });

const worker = new Worker(
  'email-queue',
  async (job) => {
    const { to, subject, body } = job.data

    logger.info('job-started', {
      jobId: job.id
    })

    try {
      console.log('worker running')

      logger.info('job-finished', {
        jobId: job.id
      })

      console.log(to, subject, body)

    } catch (error) {
      logger.error('job failed', {
        jobId: job.id,
        error: error.message
      })
      throw error
    }
  },
  { connection }
)

// debug events
worker.on('completed', job => console.log('COMPLETED', job.id))
worker.on('error', err => console.log('ERROR', err))
worker.on("failed", async (job, err) => {
  console.log("Failed:", job.id, err.message);

  // max retry dolduysa DLQ'ya at
  if (job.attemptsMade >= job.opts.attempts) {
    await deadLetterQueue.add("failed-job", {
      originalJob: job.data,
      error: err.message,
    });
  }
});
export default worker
