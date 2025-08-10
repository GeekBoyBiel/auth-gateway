import fp from "fastify-plugin";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

const REF_MAP: Record<string, string> = {
  "GoogleCreds#": "#/components/schemas/GoogleCreds",
  GoogleCreds: "#/components/schemas/GoogleCreds",
  "AzureCreds#": "#/components/schemas/AzureCreds",
  AzureCreds: "#/components/schemas/AzureCreds",
  "LoginBody#": "#/components/schemas/LoginBody",
  LoginBody: "#/components/schemas/LoginBody",
  "Login200#": "#/components/schemas/Login200",
  Login200: "#/components/schemas/Login200",
  "ErrorSchema#": "#/components/schemas/ErrorSchema",
  ErrorSchema: "#/components/schemas/ErrorSchema",
  "Validate200#": "#/components/schemas/Validate200",
  Validate200: "#/components/schemas/Validate200",
  "Validate401#": "#/components/schemas/Validate401",
  Validate401: "#/components/schemas/Validate401",
};

function remapRefs(node: any): void {
  if (!node || typeof node !== "object") return;
  if (typeof (node as any).$ref === "string" && REF_MAP[(node as any).$ref]) {
    (node as any).$ref = REF_MAP[(node as any).$ref];
  }
  for (const k of Object.keys(node)) remapRefs((node as any)[k]);
}

export default fp(async (app) => {
  await app.register(swagger, {
    mode: "dynamic",
    openapi: {
      info: { title: "Auth Gateway", version: "1.0.0" },
      security: [{ bearerAuth: [] }],
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      defaultModelsExpandDepth: -1,
      defaultModelExpandDepth: 2,
      persistAuthorization: true,
    },
    transformSpecification: (spec: any) => {
      const registered = app.getSchemas?.() ?? {};
      spec.components = spec.components || {};
      spec.components.schemas = spec.components.schemas || {};
      for (const [id, schema] of Object.entries(registered)) {
        if (!spec.components.schemas[id]) spec.components.schemas[id] = schema;
      }

      remapRefs(spec);
      if (spec.definitions) delete spec.definitions;
      const lb = spec?.components?.schemas?.LoginBody;
      const credsOneOf = lb?.properties?.credentials?.oneOf;
      if (lb && Array.isArray(credsOneOf)) {
        lb.discriminator = {
          propertyName: "provider",
          mapping: {
            google: "#/components/schemas/GoogleCreds",
            azure:  "#/components/schemas/AzureCreds",
          },
        };
      }

      // exemplos dos scheamas
      if (spec.components.schemas.GoogleCreds) {
        spec.components.schemas.GoogleCreds.example = { token: "google_valid_token_123" };
      }
      if (spec.components.schemas.AzureCreds) {
        spec.components.schemas.AzureCreds.example = { username: "john.doe", password: "Test@123" };
      }

      if (lb) {
        lb.example = {
          provider: "google",
          credentials: { token: "google_valid_token_123" },
        };
      }

      const loginOp = spec.paths?.["/auth/login"]?.post;
      const content = loginOp?.requestBody?.content?.["application/json"];
      if (content) {
        content.examples = {
          google: {
            summary: "Google (token)",
            value: {
              provider: "google",
              credentials: { token: "google_valid_token_123" },
            },
          },
          azure: {
            summary: "Azure (username/password)",
            value: {
              provider: "azure",
              credentials: { username: "john.doe", password: "Test@123" },
            },
          },
        };

        if (content.schema && !content.schema.example) {
          content.schema.example = {
            provider: "google",
            credentials: { token: "google_valid_token_123" },
          };
        }
      }

      return spec;
    },
  });
});
