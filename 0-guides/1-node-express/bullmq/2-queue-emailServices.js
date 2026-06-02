import { resetPasswordQueue } from "./queues.js";

export const sendResetEmail = async(to, subject, body) => {
  await resetPasswordQueue.add('reset-password', { to, subject, body })
}

