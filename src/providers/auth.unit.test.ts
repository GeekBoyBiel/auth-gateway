import { googleAuth, azureAuth } from "./auth";
import { it, expect, describe } from "vitest";

describe("providers/auth", () => {
  it("google ok e inválido", async () => {
    const ok = await googleAuth({ token: "google_valid_token_123" });
    expect(ok?.provider).toBe("google");

    const bad = await googleAuth({ token: "wrong" });
    expect(bad).toBeNull();
  });

  it("google retorna null se credenciais vazias", async () => {
    const bad = await googleAuth({} as any);
    expect(bad).toBeNull();
  });

  it("azure user/admin e inválido", async () => {
    const user = await azureAuth({ username: "john.doe", password: "Test@123" });
    expect(user?.role).toBe("user");

    const admin = await azureAuth({ username: "admin", password: "Admin@123" });
    expect(admin?.role).toBe("admin");

    const wrong = await azureAuth({ username: "john.doe", password: "nope" });
    expect(wrong).toBeNull();
  });

  it("azure aceita username com case/espacos", async () => {
    const user = await azureAuth({ username: "  John.Doe ", password: "Test@123" });
    expect(user?.role).toBe("user");
  });
});
