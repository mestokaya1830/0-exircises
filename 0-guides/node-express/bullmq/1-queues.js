import { Queue } from "bullmq";
import connectRedis from '../redis/connectRedis.js'


const defaultJobOptions = {
  attemps: 5,
  backoff: {type: 'exponential', delay: 3000},
  removeOnComplete: 100,
  removeOnFail: 200
}

export const resetPasswordQueue = new Queue('reset-password-queue', {
  connection: connectRedis,
  defaultJobOptions,
  limiter: {max: 5, duration: 1000}
})

