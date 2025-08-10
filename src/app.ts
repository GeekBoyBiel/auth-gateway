import Fastify from "fastify";
import rateLimit from "@fastify/rate-limit";
import Redis from "ioredis";
import swaggerPlugin from "@/plugins/swagger";
import authRoutes from "@/routes/auth";
import { registerAuthSchemas } from "@/schemas/auth";
import { env } from "@/config/env";
import redisPlugin from "@/plugins/redis";

export function buildApp() {
  const app = Fastify({
    logger: env.NODE_ENV === "test" ? false : { level: env.LOG_LEVEL },
  });

  registerAuthSchemas(app);

  if (!env.DISABLE_RATELIMIT) {
    app.register(async (instance) => {
      app.register(rateLimit, {
        global: false,
        max: env.RATE_LIMIT_MAX,
        timeWindow: env.RATE_LIMIT_WINDOW,
        redis: instance.redis,
      });
    });
  }


  app.get("/health", async () => ({ status: "ok" }));
  app.get("/ready", async () => ({ status: "ready" }));

  app.register(redisPlugin);
  app.register(swaggerPlugin);
  app.register(authRoutes);

  app.get("/openapi.json", { schema: { hide: true } }, async (_req, reply) => {
    const spec: any = (app as any).swagger?.();
    const schemas = spec?.components?.schemas;
    const lb = schemas?.LoginBody;
    if (lb && Array.isArray(lb.oneOf)) {
      lb.discriminator = {
        propertyName: "provider",
        mapping: {
          google: "#/components/schemas/LoginBody/oneOf/0",
          azure: "#/components/schemas/LoginBody/oneOf/1",
        },
      };
    }
    return reply.send(spec);
  });

  return app;
}
