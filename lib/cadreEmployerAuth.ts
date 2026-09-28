import crypto from "crypto";
import { cookies } from "next/headers";

const SECRET = () => {
  const s =
    process.env.CADRE_EMPLOYER_SECRET ||
    process.env.CADRE_PORTAL_SECRET ||
    process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("No JWT secret available (set CADRE_EMPLOYER_SECRET, CADRE_PORTAL_SECRET, or NEXTAUTH_SECRET)");
  return s + "_employer"; // namespace even if sharing the same env var
};

function base64url(input: string): string {
  return Buffer.from(input).toString("base64url");
}

function signJWT(payload: Record<string, unknown>, secret: string): string {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const exp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days
  const body = base64url(
    JSON.stringify({ ...payload, exp, iat: Math.floor(Date.now() / 1000) })
  );
  const sig = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${sig}`;
}

function verifyJWT<T>(token: string, secret: string): T | null {
  try {
    const [header, body, sig] = token.split(".");
    if (!header || !body || !sig) return null;
    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${header}.${body}`)
      .digest("base64url");
    if (
      sig.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    ) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload as T;
  } catch {
    return null;
  }
}

// ─── CadreHealth Employer Session ───

export interface CadreEmployerSession {
  sub: string; // employer account ID
  email: string;
  companyName: string;
  contactName: string;
  /**
   * Cached at sign-in and therefore up to 30 days stale. Never gate anything on
   * this: an admin verifying an employer would otherwise have no effect until
   * that employer happened to log out. Read `getCadreEmployerContext().org`.
   */
  isVerified: boolean;
  facilityId: string | null;
}

export function signCadreEmployerJWT(payload: Record<string, unknown>): string {
  return signJWT(payload, SECRET());
}

export function verifyCadreEmployerToken(token: string): CadreEmployerSession | null {
  return verifyJWT<CadreEmployerSession>(token, SECRET());
}

export async function getCadreEmployerSession(): Promise<CadreEmployerSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("cadre_employer_token")?.value;
  if (!token) return null;
  return verifyCadreEmployerToken(token);
}

// ─── Employer context ───

/**
 * The authoritative view of who is asking, loaded fresh on every request.
 *
 * The token alone is not enough for two reasons. It caches `isVerified` for
 * thirty days, and verification is what releases a professional's contact
 * details. And it carries `companyName`, which is what tenancy used to be keyed
 * on: roles were scoped by comparing that string to the mandate's `facilityName`
 * text, so two accounts that typed the same hospital name saw each other's
 * applicants. Scoping now runs on `org.id`.
 */
export interface CadreEmployerContext {
  accountId: string;
  contactName: string;
  contactEmail: string;
  role: "OWNER" | "RECRUITER" | "VIEWER";
  org: {
    id: string;
    name: string;
    facilityId: string | null;
    isVerified: boolean;
  };
}

export async function getCadreEmployerContext(): Promise<CadreEmployerContext | null> {
  const session = await getCadreEmployerSession();
  if (!session) return null;

  // Imported here rather than at module scope: this file is also pulled into
  // edge-ish paths that only need the token helpers, and Prisma should not be
  // dragged along with them.
  const { prisma } = await import("@/lib/prisma");

  const account = await prisma.cadreEmployerAccount.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      contactName: true,
      contactEmail: true,
      role: true,
      org: {
        select: { id: true, name: true, facilityId: true, isVerified: true },
      },
    },
  });

  // A token that outlives its account is not a session. Deleting an employer
  // should log them out, not leave a signed cookie acting on a missing row.
  if (!account) return null;

  return {
    accountId: account.id,
    contactName: account.contactName,
    contactEmail: account.contactEmail,
    role: account.role,
    org: account.org,
  };
}

/** Roles permitted to change the state of a role or a pipeline. */
const WRITE_ROLES = new Set(["OWNER", "RECRUITER"]);

export function canWrite(ctx: CadreEmployerContext): boolean {
  return WRITE_ROLES.has(ctx.role);
}

/** Only an owner can invite, remove, or change a colleague's access. */
export function canManageTeam(ctx: CadreEmployerContext): boolean {
  return ctx.role === "OWNER";
}
