import { z } from "zod"
import dotenv from "dotenv"

dotenv.config()

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  MONGO: z.string().startsWith("mongodb://"),
  REDIS: z.string().startsWith("redis://"),
  JWT: z.string().min(10, "JWT secret too weak"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format())
  process.exit(1)
}

export const env = parsed.data
