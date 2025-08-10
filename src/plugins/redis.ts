import fp from "fastify-plugin";
import Redis from "ioredis";
import { env } from "@/config/env";

export default fp(async (app) => {
  const isTest = env.NODE_ENV === "test";

  const client = new Redis(env.REDIS_URL, isTest ? {
    // não conectar nos testes
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 0,
    connectTimeout: 100,
    retryStrategy: () => null, // sem retry
  } : {
    maxRetriesPerRequest: 1,
    connectTimeout: 5000,
  });

  app.decorate("redis", client as any);

  client.on("connect", () => {
    app.log.info({ url: env.REDIS_URL }, "redis_connected");
  });

  client.on("error", (err) => {
    app.log.error(err, "redis_connection_error");
  });
});
