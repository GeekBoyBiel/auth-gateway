import { SignJWT, jwtVerify } from "jose";

const ISSUER = "auth-gateway";
const AUDIENCE = "internal-services";

function getKey() {
  const secret = process.env.JWT_SECRET || "dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function signJwt(payload: Record<string, unknown>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime("15m")
    .sign(getKey());
}

export async function verifyJwt(token: string) {
  const { payload } = await jwtVerify(token, getKey(), {
    issuer: ISSUER,
    audience: AUDIENCE,
  });
  return payload;
}
