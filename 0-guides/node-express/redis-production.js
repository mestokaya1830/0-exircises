imimport { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error("Redis: Max retry attempts reached.");
        return new Error("Redis connection lost after 10 retries"); // appError değil
      }
      return Math.min(retries * 100, 3000);
    },
  },
});

client.on("connect", () => console.log("Redis: Connecting..."));
client.on("ready", () => console.log("Redis: Ready!"));
client.on("reconnecting", () => console.warn("Redis: Reconnecting..."));
client.on("error", (err) => console.error("Redis Error:", err.message));

const connectRedis = async () => {
  if (client.isReady) return;       // zaten hazırsa geç
  try {
    await client.connect();
    console.log("Redis: Connected successfully");
  } catch (err) {
    console.error("Redis: Connection failed:", err.message);
    throw err;                       // uygulamayı haberdar et
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  await client.quit();
  console.log("Redis: Connection closed.");
  process.exit(0);
});

export { connectRedis };
export default client;
