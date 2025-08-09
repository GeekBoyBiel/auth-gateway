import { FastifyInstance } from "fastify";
import { signJwt, verifyJwt } from "@/libs/jwt";

type GoogleBody = { provider: "google"; credentials: { token: string } };
type AzureBody = { provider: "azure"; credentials: { username: string; password: string } };
type LoginBody = GoogleBody | AzureBody;

export default async function authRoutes(app: FastifyInstance) {
  app.post(
    "/auth/login",
    {
      schema: {
        body: { $ref: "LoginBody#" },
        response: {
          200: { $ref: "Login200#" },
          400: { $ref: "ErrorSchema#" },
          401: { $ref: "ErrorSchema#" },
        },
        tags: ["auth"],
        summary: "Login via provider mock",
      },
    },
    async (req, reply) => {
      const body = req.body as LoginBody;

      if (body.provider === "google") {
        if (body.credentials.token !== "google_valid_token_123") {
          return reply.code(401).send({ error: "Invalid credentials" });
        }
        const token = await signJwt({ sub: "google-user-123", provider: "google", role: "user" });
        return reply.send({ token });
      }

      if (body.provider === "azure") {
        const { username, password } = body.credentials;
        if (username === "john.doe" && password === "Test@123") {
          const token = await signJwt({ sub: "azure-user-001", provider: "azure", role: "user" });
          return reply.send({ token });
        }
        if (username === "admin" && password === "Admin@123") {
          const token = await signJwt({ sub: "azure-admin-001", provider: "azure", role: "admin" });
          return reply.send({ token });
        }
        return reply.code(401).send({ error: "Invalid credentials" });
      }

      return reply.code(400).send({ error: "Unsupported provider" });
    }
  );

  app.get(
  "/auth/validate",
  {
    schema: {
      summary: "Validate JWT issued by the gateway",
      tags: ["auth"],
      headers: {
        type: "object",
        properties: {
          authorization: { type: "string", description: "Bearer <jwt>" }
        },
        required: ["authorization"]
      },
      security: [{ bearerAuth: [] }],
       parameters: [
        {
          in: "header",
          name: "Authorization",
          required: true,
          description: "Bearer <jwt>",
          schema: { type: "string" }
        }
      ],
      response: {
        200: { $ref: "Validate200#" },
        401: { $ref: "Validate401#" }
      }
    }
  },
    async (req, reply) => {
      const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
      if (!token) return reply.code(401).send({ valid: false, error: "Missing token" });

      try {
        const payload = await verifyJwt(token);
        return reply.send({ valid: true, payload });
      } catch {
        return reply.code(401).send({ valid: false, error: "Invalid token" });
      }
    }
  );
}
