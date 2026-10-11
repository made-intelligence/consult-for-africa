import { describe, it, expect, vi, beforeAll } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));
vi.mock("@/lib/cadreEmail", () => ({ sendCadreEmail: vi.fn() }));
vi.mock("@/lib/audit", () => ({ logAudit: vi.fn() }));
vi.mock("@/lib/r2", () => ({ buildKey: vi.fn(), generateUploadUrl: vi.fn(), getPublicUrl: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));

beforeAll(() => {
  process.env.CADRE_PORTAL_SECRET = "test-secret";
});

describe("CV upload token", () => {
  it("names the record it was issued for", async () => {
    const { signCvToken, verifyCvToken } = await import("../cadreHealth/cvRequest");
    expect(verifyCvToken(signCvToken("pro_123"))).toBe("pro_123");
  });

  it("rejects a token pointed at another record", async () => {
    const { signCvToken, verifyCvToken } = await import("../cadreHealth/cvRequest");
    expect(verifyCvToken(signCvToken("pro_123").replace("pro_123", "pro_999"))).toBeNull();
  });

  it("rejects an altered expiry", async () => {
    const { signCvToken, verifyCvToken } = await import("../cadreHealth/cvRequest");
    const [id, , sig] = signCvToken("pro_123").split(".");
    expect(verifyCvToken(`${id}.1.${sig}`)).toBeNull();
  });

  it("is not a session, and a session is not one of these", async () => {
    const { signCvToken, verifyCvToken } = await import("../cadreHealth/cvRequest");
    const { signCadreJWT, verifyCadreToken } = await import("../cadreAuth");
    expect(verifyCadreToken(signCvToken("pro_123"))).toBeNull();
    expect(verifyCvToken(signCadreJWT({ sub: "pro_123" }))).toBeNull();
  });
});
