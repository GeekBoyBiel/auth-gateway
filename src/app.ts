import Fastify from "fastify";
import swaggerPlugin from "@/plugins/swagger";
import authRoutes from "@/routes/auth";
import { registerAuthSchemas } from "@/schemas/auth";
import rateLimit from "@fastify/rate-limit";

export function buildApp() {
  const app = Fastify({ logger: { level: process.env.LOG_LEVEL ?? "info" } });

  registerAuthSchemas(app);

  app.register(swaggerPlugin);
  app.get("/health", async () => ({ status: "ok" }));
  app.get("/ready", async (_req, reply) => reply.code(200).send({ status: "ready" }));
  app.register(authRoutes);

  if (process.env.DISABLE_RATELIMIT !== "1") {
    app.register(rateLimit, { max: 10, timeWindow: "1 minute" });
  }

  return app;
}
