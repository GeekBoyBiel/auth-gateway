import fp from "fastify-plugin";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

export default fp(async (app) => {
  await app.register(swagger, {
    openapi: {
      info: { title: "Auth Gateway", version: "1.0.0" },
      servers: [{ url: "http://localhost:3000" }],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
  });
});
