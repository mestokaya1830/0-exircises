import fs from 'fs'
import path from 'path'

const httpLogger = (req, res, next) => {
  const start = Date.now()

  res.on('finish', () => {
    const log = [
      `URL     : ${req.url}`,
      `Method  : ${req.method}`,
      `Status  : ${res.statusCode}`,
      `Duration: ${Date.now() - start}ms`,
      `Date    : ${new Date().toLocaleString()}`,
      `IP      : ${req.ip}`,
      '----------------------------'
    ].join('\n') + '\n'

    fs.appendFile(
      new URL('./logger.txt', import.meta.url),
      log,
      (err) => { if (err) console.error('Log yazılamadı:', err) }
    )
  })

  next()
}

export default httpLogger
