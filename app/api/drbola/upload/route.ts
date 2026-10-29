import { NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { generateUploadUrl } from "@/lib/r2";
import { isRateLimited } from "@/lib/rate-limit";
import { UPLOAD_KEY_PREFIX as KEY_PREFIX } from "@/lib/drbola";

// Public, unauthenticated: X-rays and clinical photos attached to a referral or
// a second opinion request on Dr Bola Akinola's site.
//
// This only presigns. The rows are written by /api/drbola when the form itself
// is submitted, so a half-finished form leaves an orphan object, never an
// orphan record pointing at a patient who did not send anything.
//
// These are patient images, and the cfa-uploads bucket is publicly readable to
// anyone who holds a key (see the note in app/api/osteon-audit/upload). So the
// key is 256 bits of randomness with no filename in it, and no readable URL is
// ever returned. Reading one back goes through /api/osteon-audit/upload/[id],
// which presigns a five-minute GET behind platform auth.

const MAX_MB = 25;

const ALLOWED: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  dcm: "application/dicom",
  zip: "application/zip",
};

const schema = z.object({
  filename: z.string().min(1).max(260),
  contentType: z.string().max(160).optional(),
  fileSize: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip, "drbola-upload", { windowMs: 60_000, max: 30 })) {
    return Response.json({ error: "Too many files at once. Please try again in a minute." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
  const { filename, contentType, fileSize } = parsed.data;

  if (fileSize > MAX_MB * 1024 * 1024) {
    return Response.json({ error: `Files must be under ${MAX_MB}MB. Send larger ones by WhatsApp.` }, { status: 413 });
  }

  const ext = filename.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
  const resolved = contentType && Object.values(ALLOWED).includes(contentType) ? contentType : ALLOWED[ext];
  if (!resolved) {
    return Response.json({ error: "Images, PDF, DICOM or zip only." }, { status: 415 });
  }

  const storageKey = `${KEY_PREFIX}${randomBytes(32).toString("base64url")}${ext ? `.${ext}` : ""}`;
  try {
    const uploadUrl = await generateUploadUrl(storageKey, resolved, 900, fileSize);
    return Response.json({ uploadUrl, storageKey, contentType: resolved });
  } catch (err) {
    console.error("[drbola/upload] presign failed", err);
    return Response.json({ error: "Could not start the upload. Please try again." }, { status: 500 });
  }
}
