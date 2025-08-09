import Fastify from "fastify";

export function buildApp() {
  const app = Fastify({
    logger: { level: process.env.LOG_LEVEL ?? "info" },
  });

  app.get("/health", async () => ({ status: "ok" }));

  return app;
}
