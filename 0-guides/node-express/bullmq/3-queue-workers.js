import { Worker, Queue } from 'bullmq'
import connectRedis from '../redis/connectRedis.js'
import logger from '../utils/logger.js'
// import { sendEmailWithProvider } from '../utils/emailProvider.js'

const deadLetterQueue = new Queue('email-dlq', { connection: connectRedis })

const processor = async (job) => {
  const { to, subject, body } = job.data
  logger.info('job-started', { jobId: job.id, to })
  // await sendEmailWithProvider({ to, subject, body })
  logger.info('job-finished', { jobId: job.id })
}

const workers = [
  new Worker('email-critical',  processor, { connection: connectRedis, concurrency: 5 }),
  new Worker('email-important', processor, { connection: connectRedis, concurrency: 4 }),
  new Worker('email-normal',    processor, { connection: connectRedis, concurrency: 3 }),
  new Worker('email-bulk',      processor, { connection: connectRedis, concurrency: 1 }),
]

workers.forEach(item => {
  item.on('completed', (job) => logger.info('completed', { jobId: job.id }))
  item.on('error',     (err) => logger.error('worker-error', { error: err.message }))
  item.on('failed', async (job, err) => {
    logger.error('failed', { jobId: job.id, error: err.message })
    if (job.attemptsMade === job.opts.attempts) {
      await deadLetterQueue.add('failed-job', {
        originalJob: job.data,
        error: err.message,
        failedAt: new Date().toISOString()
      })
    }
  })
})
