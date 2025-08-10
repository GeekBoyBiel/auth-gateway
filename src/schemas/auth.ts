import type { FastifyInstance } from "fastify";

export function registerAuthSchemas(app: FastifyInstance) {
  app.addSchema({
    $id: "GoogleCreds",
    type: "object",
    properties: { token: { type: "string" } },
    required: ["token"],
    additionalProperties: false,
  });

  app.addSchema({
    $id: "AzureCreds",
    type: "object",
    properties: {
      username: { type: "string" },
      password: { type: "string" },
    },
    required: ["username", "password"],
    additionalProperties: false,
  });

  app.addSchema({
    $id: "LoginBody",
    type: "object",
    required: ["provider", "credentials"],
    properties: {
      provider: { type: "string", enum: ["google", "azure"] },
      credentials: {
        oneOf: [{ $ref: "GoogleCreds#" }, { $ref: "AzureCreds#" }],
      },
    },
    additionalProperties: false,
  });

  app.addSchema({
    $id: "Login200",
    type: "object",
    properties: { token: { type: "string" } },
    required: ["token"],
    additionalProperties: false,
  });

  app.addSchema({
    $id: "ErrorSchema",
    type: "object",
    properties: { error: { type: "string" } },
    required: ["error"],
    additionalProperties: false,
  });

  app.addSchema({
    $id: "AnyObject",
    type: "object",
    additionalProperties: true,
  });

  app.addSchema({
    $id: "Validate200",
    type: "object",
    properties: {
      valid: { type: "boolean" },
      payload: { $ref: "AnyObject#" }, 
    },
    required: ["valid", "payload"],
    additionalProperties: false,
  });

  app.addSchema({
    $id: "Validate401",
    type: "object",
    properties: { valid: { type: "boolean" }, error: { type: "string" } },
    required: ["valid", "error"],
    additionalProperties: false,
  });
}
