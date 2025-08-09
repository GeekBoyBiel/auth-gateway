import type { AzureCreds, GoogleCreds } from "@/types/auth";

export type AuthPayload = {
  sub: string;
  provider: "google" | "azure";
  role?: "user" | "admin";
};

const safeCompare = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

type UserRec = { sub: string; role: "user" | "admin"; password: string };

const MOCK = {
  GOOGLE_VALID_TOKEN: "google_valid_token_123",
  USERS: {
    "john.doe": { sub: "azure-user-001", role: "user",  password: "Test@123" },
    "admin":    { sub: "azure-admin-001", role: "admin", password: "Admin@123" },
  } as Record<string, UserRec>,
} as const;

export const googleAuth = async (creds: GoogleCreds): Promise<AuthPayload | null> => {
  if (!creds?.token) return null;
  if (!safeCompare(creds.token, MOCK.GOOGLE_VALID_TOKEN)) return null;
  return { sub: "google-user-123", provider: "google", role: "user" };
};

export const azureAuth = async (creds: AzureCreds): Promise<AuthPayload | null> => {
  const username = creds?.username?.trim().toLowerCase();
  const password = creds?.password ?? "";
  if (!username || !password) return null;

  const rec = MOCK.USERS[username];
  if (!rec) return null;
  if (!safeCompare(password, rec.password)) return null;

  return { sub: rec.sub, provider: "azure", role: rec.role };
};

export const PROVIDERS: Record<"google" | "azure", (c: any) => Promise<AuthPayload | null>> = {
  google: googleAuth,
  azure:  azureAuth,
};
