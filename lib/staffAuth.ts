import crypto from "crypto";
import { cookies } from "next/headers";

/**
 * Sign-in for a client's own staff. No passwords.
 *
 * Nineteen people, almost all on personal email, most reaching this on a phone
 * part way through a shift, and nobody at the hospital whose job is to
 * administer password resets. A password here would mean a reset queue that
 * lands on somebody who already has three jobs, and people quietly not using
 * the thing. So: a single-use link, and a session that lasts long enough that
 * they are not signing in every week.
 *
 * Only the hash of the token is stored, so a leaked table cannot be used to
 * sign in as anybody.
 */

const SECRET = () => {
  const s = process.env.STAFF_PORTAL_SECRET ?? process.env.CLIENT_PORTAL_SECRET;
  if (!s) throw new Error("STAFF_PORTAL_SECRET (or CLIENT_PORTAL_SECRET) is required");
  return s;
};

export const STAFF_COOKIE = "haven_staff_session";
const SESSION_DAYS = 30;
export const TOKEN_TTL_MINUTES = 30;

function b64url(input: string) {
  return Buffer.from(input).toString("base64url");
}

export interface StaffSession {
  sub: string; // StaffMember id
  clientId: string;
  name: string;
  tiers: ("ALL_STAFF" | "SUPERVISOR" | "LEADERSHIP" | "BOARD")[];
}

export function signStaffJWT(payload: StaffSession): string {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const body = b64url(
    JSON.stringify({ ...payload, iat: now, exp: now + SESSION_DAYS * 24 * 60 * 60 })
  );
  const sig = crypto.createHmac("sha256", SECRET()).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

export function verifyStaffToken(token: string): StaffSession | null {
  try {
    const [header, body, sig] = token.split(".");
    if (!header || !body || !sig) return null;
    const expected = crypto
      .createHmac("sha256", SECRET())
      .update(`${header}.${body}`)
      .digest("base64url");
    // Length check first: timingSafeEqual throws on a length mismatch, which
    // would otherwise be a way to probe the signature length.
    if (sig.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload as StaffSession;
  } catch {
    return null;
  }
}

export async function getStaffSession(): Promise<StaffSession | null> {
  const jar = await cookies();
  const raw = jar.get(STAFF_COOKIE)?.value;
  return raw ? verifyStaffToken(raw) : null;
}

/**
 * The code is six digits. Links lose here: email clients mangle them, forwards
 * break them, and they assume the person reads email on the device they will
 * use the page on. A code can be read on one screen and typed on another, and
 * everyone already knows the pattern from their bank.
 *
 * Six digits is only a million possibilities, so two things carry the weight.
 * The stored value is an HMAC keyed to the staff member, which means the same
 * code issued to two people stores differently and a leaked table cannot be
 * reversed with a precomputed list. And the row dies after MAX_ATTEMPTS, which
 * is what actually stops a brute force, because no hash choice can.
 */
export const MAX_ATTEMPTS = 5;

export function hashLoginCode(staffId: string, code: string) {
  return crypto.createHmac("sha256", SECRET()).update(`${staffId}:${code}`).digest("hex");
}

export function newLoginCode(staffId: string) {
  // randomInt is uniform. Math.random would bias the low digits.
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  return { code, hash: hashLoginCode(staffId, code) };
}

/**
 * How the code reaches the person. Email today. SMS slots in here once there is
 * a provider, and WhatsApp behind that, without touching the routes.
 */
export type DeliveryChannel = "EMAIL" | "SMS";

export type Tier = StaffSession["tiers"][number];

/**
 * Capabilities, not a ladder.
 *
 * BOARD broke the ladder, and that is the point rather than a nuisance. The
 * founders sit ABOVE leadership on the hospital's numbers, including the
 * financials, and BELOW everybody on anything about a named person. A board
 * that can read the ward's own notes, or see which nurse failed which test,
 * ends both of those things inside a month: the notes go quiet and the test
 * becomes something to survive rather than something to learn from.
 *
 * So the gate is per capability. Anything else forces a choice between showing
 * the founders too much and showing them too little.
 */
export type Capability =
  | "READ_DIRECTORY"
  | "READ_NOTES"
  | "POST_NOTES"
  | "REQUEST_LEAVE"
  | "DECIDE_LEAVE"
  | "VIEW_SCOREBOARD"
  | "ENTER_SCOREBOARD"
  | "VIEW_FINANCIALS"
  | "ENTER_FINANCIALS"
  | "SCHEDULE_TRAINING"
  | "VIEW_COMPETENCY_NAMED"
  | "VIEW_COMPETENCY_AGGREGATE"
  | "VIEW_NEAR_MISS_DETAIL";

const GRANTS: Record<Capability, Tier[]> = {
  READ_DIRECTORY: ["ALL_STAFF", "SUPERVISOR", "LEADERSHIP", "BOARD"],

  // Not BOARD. This is the ward talking to itself, and an owner reading over
  // their shoulder is how it stops being used.
  READ_NOTES: ["ALL_STAFF", "SUPERVISOR", "LEADERSHIP"],
  POST_NOTES: ["ALL_STAFF", "SUPERVISOR", "LEADERSHIP"],

  // The founders are not employees of the hospital in this sense.
  REQUEST_LEAVE: ["ALL_STAFF", "SUPERVISOR", "LEADERSHIP"],
  DECIDE_LEAVE: ["SUPERVISOR", "LEADERSHIP"],

  VIEW_SCOREBOARD: ["ALL_STAFF", "SUPERVISOR", "LEADERSHIP", "BOARD"],
  ENTER_SCOREBOARD: ["SUPERVISOR", "LEADERSHIP"],

  // Financials are the founders' own business and the operations manager's job
  // to keep current. They are never on a staff surface: staff hear a revenue
  // figure as a conversation about their pay.
  VIEW_FINANCIALS: ["LEADERSHIP", "BOARD"],
  ENTER_FINANCIALS: ["LEADERSHIP"],

  SCHEDULE_TRAINING: ["SUPERVISOR", "LEADERSHIP"],

  // Named competency stops at the people who have to act on it. The board gets
  // the shape, never the name.
  VIEW_COMPETENCY_NAMED: ["SUPERVISOR", "LEADERSHIP"],
  VIEW_COMPETENCY_AGGREGATE: ["LEADERSHIP", "BOARD"],

  // Detail stops at leadership. The board sees that reports are rising, which
  // is the number that matters to them, and not who filed what.
  VIEW_NEAR_MISS_DETAIL: ["LEADERSHIP"],
};

export function can(session: StaffSession | null, capability: Capability) {
  if (!session) return false;
  // The union of what they hold. A founder who is also the Chief Medical
  // Director gets the clinical permissions through LEADERSHIP; a founder who
  // only owns shares holds BOARD alone and does not.
  return session.tiers.some((t) => GRANTS[capability].includes(t));
}

/**
 * Kept for the handful of call sites that genuinely mean seniority, and
 * deliberately excludes BOARD so an owner never inherits an operational
 * permission by accident.
 */
const RANK: Record<Tier, number> = {
  ALL_STAFF: 0,
  SUPERVISOR: 1,
  LEADERSHIP: 2,
  BOARD: -1,
};

export function atLeast(session: StaffSession | null, tier: Tier) {
  if (!session) return false;
  if (tier === "BOARD") return session.tiers.includes("BOARD");
  return session.tiers.some((t) => RANK[t] >= RANK[tier]);
}
