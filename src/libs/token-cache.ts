import type { FastifyInstance } from "fastify";

const TTL_SECONDS = Number(process.env.JWT_TTL_SECONDS || 900); // 15 min default
const keyFor = (provider: string, sub: string) => `auth:token:${provider}:${sub}`;

export async function getToken(app: FastifyInstance, provider: string, sub: string) {
  const key = keyFor(provider, sub);
  try {
    return await app.redis.get(key);
  } catch (err) {
    app.log.warn({ err, key }, "redis_get_token_error");
    return null;
  }
}

export async function setToken(
  app: FastifyInstance,
  provider: string,
  sub: string,
  token?: string
) {
  if (typeof token === "undefined") return;

  const key = keyFor(provider, sub);
  try {
    await app.redis.set(key, token, "EX", TTL_SECONDS);
  } catch (err) {
    app.log.warn({ err, key }, "redis_set_token_error");
  }
}