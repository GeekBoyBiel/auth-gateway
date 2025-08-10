// src/config/env.ts
import "dotenv/config";
import { cleanEnv, str, num, bool } from "envalid";

export const env = cleanEnv(process.env, {
  NODE_ENV:   str({ choices: ["development", "test", "production"], default: "development" }),
  PORT:       num({ default: 3000 }),
  LOG_LEVEL:  str({ default: "info" }),
  JWT_SECRET: str(),

  // Redis
  REDIS_URL:        str({ default: "redis://localhost:6379" }),
  JWT_TTL_SECONDS:  num({ default: 900 }),

  // Rate limit
  DISABLE_RATELIMIT: bool({ default: false }),
  RATE_LIMIT_MAX:    num({ default: 10 }),
  RATE_LIMIT_WINDOW: str({ default: "1 minute" }),

  // Mock
  ALLOW_MOCK_PROVIDERS: bool({ default: false }),
});
