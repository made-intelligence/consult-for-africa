import { createHmac, timingSafeEqual } from "crypto";

/**
 * An unguessable link to one founders' note: kind and Lagos date, signed with
 * CRON_SECRET. The page renders the note live, so the link carries no content.
 */
export type NoteKind = "monday" | "friday";

function sig(kind: NoteKind, date: string) {
  const secret = process.env.CRON_SECRET ?? "";
  return createHmac("sha256", secret).update(`haven-note:${kind}:${date}`).digest("hex").slice(0, 24);
}

export function lagosDate(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(d);
}

export function noteToken(kind: NoteKind, date = lagosDate()) {
  return `${kind}-${date}-${sig(kind, date)}`;
}

export function readNoteToken(token: string): { kind: NoteKind; date: string } | null {
  const m = token.match(/^(monday|friday)-(\d{4}-\d{2}-\d{2})-([0-9a-f]{24})$/);
  if (!m || !process.env.CRON_SECRET) return null;
  const want = Buffer.from(sig(m[1] as NoteKind, m[2]));
  const got = Buffer.from(m[3]);
  return want.length === got.length && timingSafeEqual(want, got) ? { kind: m[1] as NoteKind, date: m[2] } : null;
}
