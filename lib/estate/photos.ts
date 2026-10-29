import crypto from "crypto";
import { generateDownloadUrl } from "@/lib/r2";

/**
 * Photographs of people's homes.
 *
 * The cfa-uploads bucket serves any object over its public r2.dev domain to
 * anyone holding the key — scripts/verify-osteon-upload.ts proved it — so the
 * key is the only access control there is. That makes a leaked key equivalent to
 * a leaked photograph, and these are pictures of the inside of tenants' flats
 * and of a family's gatehouse.
 *
 * So: 256 bits of randomness, and the filename never goes in the key. A key
 * ending "kitchen-leak-flat-3b.jpg" describes the contents to anyone who sees it
 * in a log, a referrer header or an address bar. Reads go out as short-lived
 * presigned GETs and a durable public URL is never returned to a browser.
 */

const FOLDER = "estate";

export type PhotoScope = "issue" | "run" | "delivery" | "dip" | "receipt";

export function estatePhotoKey(scope: PhotoScope, filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
  const rand = crypto.randomBytes(32).toString("base64url");
  return `${FOLDER}/${scope}/${rand}${ext ? `.${ext}` : ""}`;
}

/** Anything not minted by us is not ours, whatever the client claims. */
export function isEstateKey(key: string, scope?: PhotoScope): boolean {
  return key.startsWith(scope ? `${FOLDER}/${scope}/` : `${FOLDER}/`);
}

/** Five minutes. Long enough to render a page, short enough not to be a link. */
export async function viewUrl(key: string): Promise<string> {
  return generateDownloadUrl(key, 300);
}

export async function viewUrls(keys: string[]): Promise<string[]> {
  return Promise.all(keys.map((k) => viewUrl(k)));
}

/**
 * What a phone camera actually produces, plus the formats iPhones hand over
 * without asking. HEIC is on the list because leaving it off means half the
 * photographs the ground team takes are silently rejected.
 */
export const ALLOWED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export const MAX_PHOTO_BYTES = 15 * 1024 * 1024;

export function resolveContentType(declared: string | undefined, filename: string): string | null {
  const d = (declared ?? "").toLowerCase();
  if ((ALLOWED_PHOTO_TYPES as readonly string[]).includes(d)) return d;
  // Browsers report nothing useful for some phone-camera formats, so fall back
  // to the extension rather than turning the upload away.
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const byExt: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    heic: "image/heic",
    heif: "image/heif",
  };
  return byExt[ext] ?? null;
}
