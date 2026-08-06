import iordis from 'ioredis'

const redisClient = new iordis({
  host: 'localhost',
  port: 6379,
  password: '11130113',
  commandTimeout: 10000,
  connectTimeout: 10000,
  keepAlive: 15000,
  retryStrategy(times) {
    if(times > 20) return null
    return Math.min(0, times * 100, 3000)
  },
  reconnectOnError(err) {
    const targetErrors = ['READONLY', 'ETIMEDOUT', 'ECONNRESET']
    if(targetErrors.some(item => err.message.includes(item))){
      return true
    }
    return false
  }
})

redisClient.on('connect', () => console.log('Redis Connected0'))

export default redisClient