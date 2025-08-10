import { signJwt, verifyJwt } from "./jwt";
import { it, expect } from "vitest";

it("assina e valida JWT", async () => {
  const token = await signJwt({ sub: "u1", provider: "google", role: "user" });
  const payload = await verifyJwt(token);
  expect(payload.sub).toBe("u1");
  expect(payload.iss).toBe("auth-gateway");
  expect(payload.aud).toBe("internal-services");
});

it("token adulterado deve falhar", async () => {
  const token = await signJwt({ sub: "u1" });
  const parts = token.split(".");
  const tampered = parts.slice(0, 2).join(".") + ".AAAA";
  await expect(verifyJwt(tampered)).rejects.toBeTruthy();
});
