import type { AzureCreds, GoogleCreds } from "@/types/auth";
import { retry } from "@/libs/resilience";
import { env } from "@/config/env";
import { createHash, timingSafeEqual } from "node:crypto";

export type AuthPayload = {
  sub: string;
  provider: "google" | "azure";
  role?: "user" | "admin";
};

function ensureMockAllowed() {
  if (env.NODE_ENV === "production" && !env.ALLOW_MOCK_PROVIDERS) {
    throw new Error("Mock providers are disabled in production");
  }
}

function safeEqual(a: string, b: string) {
  const ah = createHash("sha256").update(a).digest();
  const bh = createHash("sha256").update(b).digest();
  return timingSafeEqual(ah, bh);
}

type UserRec = { sub: string; role: "user" | "admin"; password: string };

const MOCK = {
  GOOGLE_VALID_TOKEN: "google_valid_token_123",
  USERS: {
    "john.doe": { sub: "azure-user-001", role: "user", password: "Test@123" },
    admin: { sub: "azure-admin-001", role: "admin", password: "Admin@123" },
  } as Record<string, UserRec>,
} as const;

async function legacyCall<T>(work: () => Promise<T>) {
  return retry<T>({ fn: work, attempts: 3, baseMs: 120, maxMs: 1000, jitter: true });
}

export const googleAuth = async (creds: GoogleCreds): Promise<AuthPayload | null> => {
  ensureMockAllowed();
  if (!creds?.token) return null;
  if (!safeEqual(creds.token, MOCK.GOOGLE_VALID_TOKEN)) return null;
  try {
    await legacyCall(async () => true);
  } catch {
    return null;
  }
  return { sub: "google-user-123", provider: "google", role: "user" };
};

export const azureAuth = async (creds: AzureCreds): Promise<AuthPayload | null> => {
  ensureMockAllowed();
  const username = creds?.username?.trim().toLowerCase();
  const password = creds?.password ?? "";
  if (!username || !password) return null;
  const rec = MOCK.USERS[username];
  if (!rec || !safeEqual(password, rec.password)) return null;
  try {
    await legacyCall(async () => true);
  } catch {
    return null;
  }
  return { sub: rec.sub, provider: "azure", role: rec.role };
};

export const PROVIDERS: Record<"google" | "azure", (c: any) => Promise<AuthPayload | null>> = {
  google: googleAuth,
  azure: azureAuth,
};
