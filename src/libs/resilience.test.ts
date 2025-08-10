import { retry } from "./resilience";
import { it, expect } from "vitest";

it("tenta N vezes e falha no final", async () => {
  const fn = async () => { throw new Error("boom"); };
  await expect(
    retry({ fn, attempts: 3, baseMs: 1, jitter: false })
  ).rejects.toThrow("boom");
});

it("para na primeira vez que dá certo", async () => {
  let called = 0;
  const fn = async () => {
    if (called++ === 0) throw new Error("x");
    return "ok";
  };
  await expect(
    retry({ fn, attempts: 3, baseMs: 1, jitter: false })
  ).resolves.toBe("ok");
});

it("executa com jitter ligado", async () => {
  let called = 0;
  const fn = async () => {
    if (called++ === 0) throw new Error("x");
    return "ok";
  };
  await expect(
    retry({ fn, attempts: 2, baseMs: 1, jitter: true })
  ).resolves.toBe("ok");
});
