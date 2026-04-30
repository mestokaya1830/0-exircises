import connectRedis from '../redis/connectRedis.js'
import { Queue } from 'bullmq'

const defaultJobOptions = {
  attempts: 5,
  backoff: { type: 'exponential', delay: 3000 },
  removeOnComplete: 100,
  removeOnFail: 200
}

// 🔐 Kritik → hızlı işle, az limitle (garantili geçsin)
export const criticalQueue = new Queue('email-critical', {
  connection: connectRedis,
  defaultJobOptions,
  limiter: { max: 5, duration: 1000 }
})

// 📩 Normal
export const normalQueue = new Queue('email-normal', {
  connection: connectRedis,
  defaultJobOptions,
  limiter: { max: 5, duration: 1000 }
})

// 📢 Bulk → yavaş işle, sistemi yorma
export const bulkQueue = new Queue('email-bulk', {
  connection: connectRedis,
  defaultJobOptions,
  limiter: { max: 2, duration: 1000 }
})
