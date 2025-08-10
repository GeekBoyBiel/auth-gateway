/// <reference path="../types/fastify.d.ts" />

import Fastify from "fastify";
import { it, expect, vi } from "vitest";
import redisPlugin from "./redis";
import { env } from "../config/env";

it("loga erro no evento error", async () => {
  const app = Fastify({ logger: { level: "info" } });
  vi.spyOn(app.log, "error");

  await app.register(redisPlugin);

  app.redis.emit("error", new Error("fake error")); // já tipado

  expect(app.redis).toBeDefined();
  expect(app.log.error).toHaveBeenCalled();
});

it("loga connect no evento connect", async () => {
  const app = Fastify({ logger: { level: "info" } });
  vi.spyOn(app.log, "info");

  await app.register(redisPlugin);

  app.redis.emit("connect");

  expect(app.redis).toBeDefined();
  expect(app.log.info).toHaveBeenCalledWith(
    { url: env.REDIS_URL },
    "redis_connected"
  );
});
