import { FastifyInstance } from "fastify";
import { signJwt, verifyJwt } from "@/libs/jwt";
import { PROVIDERS } from "@/providers/auth";
import type { LoginBody } from "@/types/auth";
import { getToken, setToken } from "@/libs/token-cache";
import { env } from "@/config/env";

export default async function authRoutes(app: FastifyInstance) {
  const rateLimitConfig = env.DISABLE_RATELIMIT
    ? undefined
    : {
        max: env.RATE_LIMIT_MAX,
        timeWindow: env.RATE_LIMIT_WINDOW,
      };

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
      config: rateLimitConfig ? { rateLimit: rateLimitConfig } : {},
    },
    async (req, reply) => {
      const body = req.body as LoginBody;

      const providerFn = PROVIDERS[body.provider as "google" | "azure"];
      if (!providerFn) {
        return reply.code(400).send({ error: "Unsupported provider" });
      }

      const auth = await providerFn(body.credentials as any);
      if (!auth) {
        req.log.warn(
          { event: "auth_failed", provider: body.provider },
          "invalid credentials"
        );
        return reply.code(401).send({ error: "Invalid credentials" });
      }

      const cached = await getToken(app, auth.provider, auth.sub);
      if (cached) {
        req.log.info(
          { event: "login_cache_hit", provider: auth.provider, sub: auth.sub },
          "token from cache"
        );
        return reply.send({ token: cached });
      }

      const token = await signJwt({
        sub: auth.sub,
        provider: auth.provider,
        role: auth.role,
      });
      await setToken(app, auth.provider, auth.sub, token);

      req.log.info(
        {
          event: "login_success",
          provider: auth.provider,
          sub: auth.sub,
          role: auth.role,
        },
        "auth ok"
      );
      return reply.send({ token });
    }
  );

  app.get(
    "/auth/validate",
    {
      schema: {
        summary: "Validate JWT issued by the gateway",
        tags: ["auth"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "header",
            name: "Authorization",
            required: true,
            description: "Bearer <jwt>",
            schema: { type: "string" },
          },
        ],
        response: {
          200: { $ref: "Validate200#" },
          401: { $ref: "Validate401#" },
        },
      },
      config: rateLimitConfig ? { rateLimit: rateLimitConfig } : {},
    },
    async (req, reply) => {
      const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
      if (!token) {
        return reply.code(401).send({ valid: false, error: "Missing token" });
      }

      try {
        const decoded = await verifyJwt(token);
        const payload =
          decoded && typeof decoded === "object"
            ? { ...decoded }
            : { value: decoded };

        return reply.send({ valid: true, payload });
      } catch {
        return reply.code(401).send({ valid: false, error: "Invalid token" });
      }
    }
  );


}
