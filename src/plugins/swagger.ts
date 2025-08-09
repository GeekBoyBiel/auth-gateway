import fp from "fastify-plugin";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

function remapRefsToOpenAPI(node: any): any {
  if (!node || typeof node !== "object") return node;

  if (typeof node.$ref === "string") {
    if (node.$ref === "GoogleCreds#" || node.$ref === "GoogleCreds") {
      node.$ref = "#/components/schemas/GoogleCreds";
    }
    if (node.$ref === "AzureCreds#" || node.$ref === "AzureCreds") {
      node.$ref = "#/components/schemas/AzureCreds";
    }
    if (node.$ref === "LoginBody#" || node.$ref === "LoginBody") {
      node.$ref = "#/components/schemas/LoginBody";
    }
    if (node.$ref === "Login200#" || node.$ref === "Login200") {
      node.$ref = "#/components/schemas/Login200";
    }
    if (node.$ref === "ErrorSchema#" || node.$ref === "ErrorSchema") {
      node.$ref = "#/components/schemas/ErrorSchema";
    }
    if (node.$ref === "Validate200#" || node.$ref === "Validate200") {
      node.$ref = "#/components/schemas/Validate200";
    }
    if (node.$ref === "Validate401#" || node.$ref === "Validate401") {
      node.$ref = "#/components/schemas/Validate401";
    }
  }

  for (const k of Object.keys(node)) {
    const v = (node as any)[k];
    if (v && typeof v === "object") remapRefsToOpenAPI(v);
  }
  return node;
}

export default fp(async (app) => {
  await app.register(swagger, {
    mode: "dynamic",
    openapi: {
      info: { title: "Auth Gateway", version: "1.0.0" },
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: { docExpansion: "list" },
    transformSpecification: (spec: any) => {
      const registered = app.getSchemas?.() ?? {};
      spec.components = spec.components || {};
      spec.components.schemas = { ...(spec.components.schemas || {}), ...registered };

      remapRefsToOpenAPI(spec);

      // Discriminator p doc
      const lb = spec?.components?.schemas?.LoginBody;
      const credsOneOf = lb?.properties?.credentials?.oneOf;
      if (lb && Array.isArray(credsOneOf)) {
        lb.discriminator = {
          propertyName: "provider",
          mapping: {
            google: "#/components/schemas/GoogleCreds",
            azure: "#/components/schemas/AzureCreds",
          },
        };
      }

      // Try it out
      if (spec.components.schemas.GoogleCreds) {
        spec.components.schemas.GoogleCreds.example = { token: "google_valid_token_123" };
      }
      if (spec.components.schemas.AzureCreds) {
        spec.components.schemas.AzureCreds.example = { username: "john.doe", password: "Test@123" };
      }

      return spec;
    },
  });
});
