import Fastify from "fastify";
import swaggerPlugin from "./plugin/swagger";

export function buildApp() {
  const app = Fastify({
    logger: { level: process.env.LOG_LEVEL ?? "info" },
  });

  app.get("/health", async () => ({ status: "ok" }));

  app.get("/ready", async (_req, reply) => {
    return reply.code(200).send({ status: "ready" });
  });

  // Docs
  app.register(swaggerPlugin);

  return app;
}
