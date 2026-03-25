import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
  APP_BASE_URL: z.string().url().default("http://localhost:3000"),
  CRON_SECRET: z.string().optional(),
  DEMO_ADMIN_EMAIL: z.string().email().default("admin@contenthunter.local"),
  DEMO_ADMIN_PASSWORD: z.string().default("demo-password"),
  SEED_DEMO_MODE: z.string().optional(),
  IG_APP_ID: z.string().optional(),
  IG_APP_SECRET: z.string().optional(),
  IG_REDIRECT_URI: z.string().optional()
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  APP_BASE_URL: process.env.APP_BASE_URL,
  CRON_SECRET: process.env.CRON_SECRET,
  DEMO_ADMIN_EMAIL: process.env.DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD: process.env.DEMO_ADMIN_PASSWORD,
  SEED_DEMO_MODE: process.env.SEED_DEMO_MODE,
  IG_APP_ID: process.env.IG_APP_ID,
  IG_APP_SECRET: process.env.IG_APP_SECRET,
  IG_REDIRECT_URI: process.env.IG_REDIRECT_URI
});

export const isDemoMode = process.env.SEED_DEMO_MODE === "true";
