// morganLogger.js
import morgan from 'morgan'
import fs from 'fs'
import path from 'path'

const accessLogStream = fs.createWriteStream(
  new URL('./access.log', import.meta.url),
  { flags: 'a' }
)

const morganLogger = morgan('combined', { stream: accessLogStream })

export default morganLogger
