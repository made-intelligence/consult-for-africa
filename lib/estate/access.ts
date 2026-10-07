import crypto from "crypto";
import { cookies } from "next/headers";

/**
 * Getting a tenant and a guard into their own screen.
 *
 * There is no password. Each person gets one long unguessable URL, the way every
 * other private page on this platform is handed out, and the URL is the
 * credential — the same arrangement as the Maarova rater links and the client
 * project pages.
 *
 * That is a deliberate trade, not an oversight. The alternative is a password
 * for twelve tenants and five guards, which means a reset flow, which means the
 * office fielding reset requests at 11pm in a blackout — the exact moment the
 * generator log most needs writing. The link is revocable and rotatable from the
 * founder side, which is the control that actually matters here.
 *
 * The ground team gets one thing more: a PIN, and a short cookie so it is typed
 * once a shift rather than once an action. Signing mirrors
 * lib/clientPortalAuth.ts — hand-rolled HS256 over `header.body`, verified by
 * recomputing across the raw string rather than trusting the decoded header.
 */

const SECRET = () => {
  const s = process.env.ESTATE_PORTAL_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("ESTATE_PORTAL_SECRET environment variable is required");
  return `${s}_estate`;
};

const CREW_COOKIE = "estate_crew_token";

/**
 * Twelve hours for the ground team, so a session dies with the shift. These are
 * shared handsets left on a desk in a gatehouse, and the generator log is the
 * one record that has to survive the next person picking the phone up.
 */
const CREW_TTL = 12 * 60 * 60;

function base64url(input: string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: Record<string, unknown>, ttlSeconds: number): string {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const body = base64url(JSON.stringify({ ...payload, iat: now, exp: now + ttlSeconds }));
  const sig = crypto.createHmac("sha256", SECRET()).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

function verify<T>(token: string): T | null {
  try {
    const [header, body, sig] = token.split(".");
    if (!header || !body || !sig) return null;
    const expected = crypto
      .createHmac("sha256", SECRET())
      .update(`${header}.${body}`)
      .digest("base64url");
    if (sig.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload as T;
  } catch {
    return null;
  }
}

/**
 * The secret that goes in a link.
 *
 * 256 bits and no structure. These URLs get forwarded into WhatsApp threads and
 * live in phone browser history, so the only thing standing between a stranger
 * and a tenant's balance is how hard the token is to guess.
 */
export function mintAccessToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function tenantLink(token: string, origin: string): string {
  return `${origin.replace(/\/$/, "")}/estate/home/${token}`;
}

export function crewLink(token: string, origin: string): string {
  return `${origin.replace(/\/$/, "")}/estate/crew/${token}`;
}

// ─── Ground team ─────────────────────────────────────────────────────────────

/**
 * Identity only.
 *
 * No scope, no role. Those are read from the database on every request, so a
 * supervisor moved from one area to another takes effect at once instead of at
 * the end of a twelve-hour session — the lesson lib/cadreEmployerAuth.ts learned
 * the hard way about gating on what a token remembers.
 */
export interface CrewSession {
  sub: string;
  name: string;
}

export async function setCrewSession(s: CrewSession): Promise<void> {
  const jar = await cookies();
  jar.set(CREW_COOKIE, sign({ ...s }, CREW_TTL), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: CREW_TTL,
    // Root path, not "/estate". The screens live under /estate but the actions
    // they call live under /api/estate, and a cookie scoped to /estate is never
    // sent to /api/estate — every write would have come back "enter your PIN".
    path: "/",
  });
}

export async function getCrewSession(): Promise<CrewSession | null> {
  const jar = await cookies();
  const token = jar.get(CREW_COOKIE)?.value;
  if (!token) return null;
  return verify<CrewSession>(token);
}

export async function clearCrewSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(CREW_COOKIE);
}

/**
 * A four-digit PIN, hashed.
 *
 * Not a serious secret and not pretending to be one. It exists because the
 * handset is shared: it stops the cleaner idly stopping a generator run from a
 * phone somebody left unlocked on the gatehouse desk, which is a real thing that
 * happens and a costly one, since a stopped run stops the meter on twelve
 * people's bills.
 */
export function isValidPin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}
