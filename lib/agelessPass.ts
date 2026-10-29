import { createHash } from "crypto";

/**
 * The AGELESS pass code for a registration. Four characters a door can read
 * aloud: no 0/O, 1/I/L. Must stay identical to scripts/send-ageless-passes.ts,
 * which printed it on every pass and into every QR.
 */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function agelessPassCode(id: string): string {
  const h = createHash("sha256").update(`ageless:${id}`).digest();
  return "AGL-" + Array.from(h.subarray(0, 4), (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/**
 * Pulls a pass code out of whatever the usher has: the QR text
 * ("AGELESS AGL-7K3P Name admits 2"), "AGL-7K3P", "agl 7k3p" or just "7K3P".
 */
export function normalisePassCode(raw: string): string | null {
  const s = raw.toUpperCase();
  const m = s.match(/AGL[\s-]*([2-9A-HJ-NP-Z]{4})\b/) ?? s.trim().match(/^([2-9A-HJ-NP-Z]{4})$/);
  return m ? `AGL-${m[1]}` : null;
}

/**
 * The code on the pass the guest actually holds. Twelve registrations were
 * re-created after the database reset of 20 October 2026, so their ids, and
 * the codes those ids give, are new. Their original codes are written into
 * coordinatorNotes as "Original pass code: AGL-XXXX", and that is what the
 * QR in their inbox carries.
 */
export function agelessHeldCode(id: string, notes: string | null): string {
  const m = notes?.match(/Original pass code: (AGL-[2-9A-HJ-NP-Z]{4})/);
  return m ? m[1] : agelessPassCode(id);
}
