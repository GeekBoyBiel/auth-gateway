import { beforeAll, afterAll, it, expect } from "vitest";
import { buildApp } from "../app";

process.env.DISABLE_RATELIMIT = "1";

const app = buildApp();

beforeAll(async () => {
  await app.ready(); // garante plugins/rotas prontos
});

afterAll(async () => {
  await app.close(); // fecha tudo bonitinho
});

it("health e ready", async () => {
  const h = await app.inject({ method: "GET", url: "/health" });
  expect(h.statusCode).toBe(200);

  const r = await app.inject({ method: "GET", url: "/ready" });
  expect(r.statusCode).toBe(200);
});

it("login google OK e validate OK", async () => {
  const login = await app.inject({
    method: "POST",
    url: "/auth/login",
    payload: { provider: "google", credentials: { token: "google_valid_token_123" } },
  });
  expect(login.statusCode).toBe(200);

  const token = login.json().token as string;

  const valid = await app.inject({
    method: "GET",
    url: "/auth/validate",
    headers: { authorization: `Bearer ${token}` },
  });
  expect(valid.statusCode).toBe(200);
  expect(valid.json().valid).toBe(true);
});

it("login azure user/admin OK", async () => {
  const user = await app.inject({
    method: "POST",
    url: "/auth/login",
    payload: { provider: "azure", credentials: { username: "john.doe", password: "Test@123" } },
  });
  expect(user.statusCode).toBe(200);

  const admin = await app.inject({
    method: "POST",
    url: "/auth/login",
    payload: { provider: "azure", credentials: { username: "admin", password: "Admin@123" } },
  });
  expect(admin.statusCode).toBe(200);
});

it("erros: google inválido, azure inválido, validate sem header", async () => {
  const g = await app.inject({
    method: "POST",
    url: "/auth/login",
    payload: { provider: "google", credentials: { token: "wrong" } },
  });
  expect(g.statusCode).toBe(401);

  const a = await app.inject({
    method: "POST",
    url: "/auth/login",
    payload: { provider: "azure", credentials: { username: "john.doe", password: "wrong" } },
  });
  expect(a.statusCode).toBe(401);

  const v = await app.inject({ method: "GET", url: "/auth/validate" });
  expect(v.statusCode).toBe(401);
});

it("validate com token inválido -> 401", async () => {
  const v = await app.inject({
    method: "GET",
    url: "/auth/validate",
    headers: { authorization: "Bearer xxx.yyy.zzz" },
  });
  expect(v.statusCode).toBe(401);
  expect(v.json().error).toBe("Invalid token");
});

it("login com provider não suportado -> 400", async () => {
  const res = await app.inject({
    method: "POST",
    url: "/auth/login",
    payload: { provider: "facebook", credentials: {} } as any,
  });
  expect(res.statusCode).toBe(400);
});

it("login google sem credentials -> 400", async () => {
  const res = await app.inject({
    method: "POST",
    url: "/auth/login",
    payload: { provider: "google" }, // sem credentials
  });
  expect(res.statusCode).toBe(400);
});
