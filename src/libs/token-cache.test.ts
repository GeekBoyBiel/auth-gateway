import { it, expect, vi, beforeEach, describe } from "vitest";
import { setToken, getToken } from "./token-cache";
import type { FastifyInstance } from "fastify";

const mockRedis = {
  set: vi.fn(),
  get: vi.fn(),
};

const mockLog = {
  warn: vi.fn(),
};

const fakeApp = { redis: mockRedis, log: mockLog } as unknown as FastifyInstance;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("token-cache", () => {
  it("não seta token se valor for undefined", async () => {
    await setToken(fakeApp, "prov", "sub", undefined);
    expect(mockRedis.set).not.toHaveBeenCalled();
  });

  it("retorna null se chave não existir no Redis", async () => {
    mockRedis.get.mockResolvedValueOnce(null);
    const result = await getToken(fakeApp, "prov", "sub");
    expect(result).toBeNull();
  });

  it("retorna token válido do Redis", async () => {
    mockRedis.get.mockResolvedValueOnce("abc123");
    const result = await getToken(fakeApp, "prov", "sub");
    expect(result).toBe("abc123");
  });

  it("loga e retorna null se Redis.get lançar erro", async () => {
    mockRedis.get.mockRejectedValueOnce(new Error("get error"));
    const result = await getToken(fakeApp, "prov", "sub");
    expect(result).toBeNull();
    expect(mockLog.warn).toHaveBeenCalledWith(
      { err: expect.any(Error), key: "auth:token:prov:sub" },
      "redis_get_token_error"
    );
  });

  it("seta token no Redis com TTL", async () => {
    await setToken(fakeApp, "prov", "sub", "abc123");
    expect(mockRedis.set).toHaveBeenCalledWith(
      "auth:token:prov:sub",
      "abc123",
      "EX",
      expect.any(Number)
    );
  });

  it("loga se Redis.set lançar erro", async () => {
    mockRedis.set.mockRejectedValueOnce(new Error("set error"));
    await setToken(fakeApp, "prov", "sub", "abc123");
    expect(mockLog.warn).toHaveBeenCalledWith(
      { err: expect.any(Error), key: "auth:token:prov:sub" },
      "redis_set_token_error"
    );
  });
});
