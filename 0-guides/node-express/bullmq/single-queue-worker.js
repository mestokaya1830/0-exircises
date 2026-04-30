import { Worker} from 'bullmq'
import logger from '../utils/logger.js'
import connectRedis from '../redis/connectRedis.js'

const deadLetterQueue = new Queue('email-dlq', { connectRedis })

const worker = new Worker(
  'email-queue',
  async (job) => {
    const { to, subject, body } = job.data

    logger.info('job-started', { jobId: job.id })
    console.log(to, subject, body)
    logger.info('job-finished', { jobId: job.id })
  },
  { connectRedis }
)

worker.on('completed', job => console.log('COMPLETED', job.id))
worker.on('error', err => console.log('ERROR', err))
worker.on('failed', async (job, err) => {
  console.log('Failed:', job.id, err.message)
  if (job.attemptsMade === job.opts.attempts) {
    await deadLetterQueue.add('failed-job', {
      originalJob: job.data,
      error: err.message,
    })
  }
})

export default worker
