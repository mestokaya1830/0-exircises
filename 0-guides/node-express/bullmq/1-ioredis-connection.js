import ioredis from 'ioredis'

const redisIO = new ioredis({
  host: 'localhost',
  port: 6379,
  password: "11130113",
  maxRetriesPerRequest: null
})

redisIO.on('connect', () => console.log('connected to RedisIO'))
redisIO.on('error', (err) => console.error(err))


export default redisIO


//in inxex.js inside 
const start = async () => {
  try {
    await redisIO.ping()
    app.listen(PORT, () => {
      console.log("Server is running on PORT", PORT);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
