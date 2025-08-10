import fp from "fastify-plugin";
import Redis from "ioredis";
import { env } from "@/config/env";

export default fp(async (app) => {
  const client = new Redis(env.REDIS_URL);

  app.decorate("redis", client);

  client.on("connect", () => {
    app.log.info({ url: env.REDIS_URL }, "redis_connected");
  });

  client.on("error", (err) => {
    app.log.error(err, "redis_connection_error");
  });
});
