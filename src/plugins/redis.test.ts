import redisPlugin from "./redis";
import Fastify from "fastify";
import { it, expect, vi } from "vitest";

it("loga erro no evento error", async () => {
  const app = Fastify({ logger: false });
  await app.register(redisPlugin);

  // substitui o logger por mocks
  app.log = { ...app.log, error: vi.fn(), info: vi.fn() } as any;

  const err = new Error("fake error");
  app.redis.emit("error", err);

  expect(app.redis).toBeDefined();
  expect(app.log.error).toHaveBeenCalledWith(err, "redis_connection_error");
});

it("loga connect no evento connect", async () => {
  const app = Fastify({ logger: false });
  await app.register(redisPlugin);

  app.log = { ...app.log, error: vi.fn(), info: vi.fn() } as any;

  app.redis.emit("connect");

  expect(app.redis).toBeDefined();
  expect(app.log.info).toHaveBeenCalledWith(
    { url: process.env.REDIS_URL },
    "redis_connected"
  );
});
