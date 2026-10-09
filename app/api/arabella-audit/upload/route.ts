import { NextRequest } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { generateUploadUrl } from "@/lib/r2";
import { notifyInternal } from "@/lib/email";
import { z } from "zod";

// Public, unauthenticated: the Arabella team answering the information request
// straight from /ArabellaProject, because a shared drive that somebody has to
// set up and grant access to is how a document request dies in its first week.
// The request document offers a shared folder as well, so this is the easier of
// two routes rather than the only one.
//
// POST presigns a direct-to-R2 PUT and hands back the key. PUT records the row
// once the browser reports the upload finished.
//
// These are bank statements, payer tariffs, payroll and a patient database, so a
// readable URL is NEVER returned to the browser. lib/r2.ts getPublicUrl would
// hand out a permanent public link when R2_PUBLIC_URL is configured, which it
// is, so it is deliberately not used here. Reading a file back goes through a
// short-lived presigned GET behind platform auth, in
// app/api/arabella-audit/upload/[id].
//
// That is not sufficient on its own. scripts/verify-osteon-upload.ts proved the
// cfa-uploads bucket serves objects over its public r2.dev domain to anyone who
// knows the key, which is how every other upload flow in this app is designed
// to work. Until that domain is turned off, the key is the only thing standing
// between this client's bank statement and the open internet, so audit keys are
// 256 bits of randomness with no filename in them rather than the shared
// buildKey, whose 48-bit id sits next to a descriptive filename.
//
// The patient database export in section H is the single most sensitive object
// this endpoint will ever receive. It is one file holding 3,000+ women's
// identities and clinical histories.

const ENGAGEMENT = "arabella";
const FOLDER = "documents";
// A scanned bank statement or a stack of register photographs runs well past
// 25MB, and the file never touches the app, so the ceiling is R2's patience
// on a slow line rather than ours.
const MAX_FILE_SIZE_MB = 100;
// Long enough for 100MB on a poor Abuja uplink.
const PRESIGN_SECONDS = 3600;

// Wider than the generic public uploader, because an audit arrives as
// spreadsheet exports and photographs of paper registers, not just PDFs.
const ALLOWED: Record<string, true> = {
  "application/pdf": true,
  "application/msword": true,
  "application/x-msword": true,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
  "application/vnd.ms-excel": true,
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": true,
  "application/vnd.ms-powerpoint": true,
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": true,
  "text/csv": true,
  "text/plain": true,
  "image/jpeg": true,
  "image/png": true,
  "image/webp": true,
  "image/heic": true,
  "image/heif": true,
  "image/tiff": true,
  "image/gif": true,
  "application/zip": true,
  "application/x-zip-compressed": true,
  "application/vnd.rar": true,
  "application/x-rar-compressed": true,
  "application/x-7z-compressed": true,
  "application/rtf": true,
  "text/rtf": true,
  "application/vnd.oasis.opendocument.text": true,
  "application/vnd.oasis.opendocument.spreadsheet": true,
  "application/vnd.apple.numbers": true,
  "application/vnd.apple.pages": true,
  "application/vnd.apple.keynote": true,
  "video/mp4": true,
  "video/quicktime": true,
  "audio/mpeg": true,
  "audio/mp4": true,
  "audio/ogg": true,
};

const EXT_TO_MIME: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  csv: "text/csv",
  txt: "text/plain",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  tif: "image/tiff",
  tiff: "image/tiff",
  gif: "image/gif",
  zip: "application/zip",
  rar: "application/vnd.rar",
  "7z": "application/x-7z-compressed",
  rtf: "application/rtf",
  odt: "application/vnd.oasis.opendocument.text",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  numbers: "application/vnd.apple.numbers",
  pages: "application/vnd.apple.pages",
  key: "application/vnd.apple.keynote",
  mp4: "video/mp4",
  mov: "video/quicktime",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  ogg: "audio/ogg",
  opus: "audio/ogg",
};

/** Letters of the information request (A to J since the 9 October revision), plus a catch-all. */
const SECTIONS = /^([A-J]|priority|other)$/;

// Per-IP limiter, same shape as the generic public uploader.
const hits = new Map<string, { n: number; resetAt: number }>();
const WINDOW_MS = 60_000;
// Each file is two requests and a front office uploads from one shared IP, so
// 30 stopped a folder of photographs at the fifteenth.
const MAX_PER_WINDOW = 200;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  if (hits.size > 10_000) {
    for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
  }
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { n: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.n++;
  return entry.n > MAX_PER_WINDOW;
}

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

const hashIp = (ip: string) => createHash("sha256").update(ip).digest("hex").slice(0, 32);

const presignSchema = z.object({
  filename: z.string().min(1).max(260),
  contentType: z.string().max(160).optional(),
  fileSize: z.number().int().positive(),
  section: z.string().regex(SECTIONS),
});

const recordSchema = z.object({
  storageKey: z.string().min(1).max(400),
  filename: z.string().min(1).max(260),
  contentType: z.string().min(1).max(160),
  fileSize: z.number().int().positive(),
  section: z.string().regex(SECTIONS),
  uploadedBy: z.string().max(120).optional(),
  note: z.string().max(2000).optional(),
});

/**
 * An unguessable key. No filename, because "bank-statements-jan-jun.pdf" in a
 * URL describes the contents to anyone who sees it, and 256 bits because the
 * bucket is publicly readable to anyone holding the key.
 */
function auditKey(section: string, filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
  const rand = randomBytes(32).toString("base64url");
  return `${FOLDER}/arabella-audit/${section}/${rand}${ext ? `.${ext}` : ""}`;
}

/** POST: presign a direct browser upload. */
export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return Response.json({ error: "Too many uploads at once. Please try again in a minute." }, { status: 429 });
  }

  const parsed = presignSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
  const { filename, contentType, fileSize, section } = parsed.data;

  if (fileSize > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return Response.json(
      { error: `That file is larger than ${MAX_FILE_SIZE_MB}MB. Send it to hello@consultforafrica.com and we will collect it.` },
      { status: 413 }
    );
  }

  // Trust the allowlist first, fall back to the extension, because browsers
  // report nothing useful for some spreadsheet and phone-camera formats.
  let resolved = contentType && ALLOWED[contentType] ? contentType : "";
  if (!resolved) {
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    resolved = EXT_TO_MIME[ext] ?? "";
  }
  if (!resolved) {
    return Response.json(
      { error: "That file type is not accepted. Documents, spreadsheets, photographs, voice notes, video and zip are. Try saving it as a PDF." },
      { status: 415 }
    );
  }

  const storageKey = auditKey(section, filename);
  try {
    const uploadUrl = await generateUploadUrl(storageKey, resolved, PRESIGN_SECONDS, fileSize);
    // Deliberately no readable URL in this response.
    return Response.json({ uploadUrl, storageKey, contentType: resolved });
  } catch (err) {
    console.error("[arabella-audit/upload] presign failed", err);
    return Response.json({ error: "Could not start the upload. Please try again." }, { status: 500 });
  }
}

/** PUT: record a completed upload. */
export async function PUT(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return Response.json({ error: "Too many uploads at once." }, { status: 429 });
  }

  const parsed = recordSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
  const d = parsed.data;

  // The key is minted by POST above, so anything not under our prefix is not ours.
  if (!d.storageKey.startsWith(`${FOLDER}/arabella-audit/`)) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const row = await prisma.auditUpload.upsert({
    where: { storageKey: d.storageKey },
    create: {
      engagement: ENGAGEMENT,
      section: d.section,
      filename: d.filename.slice(0, 260),
      storageKey: d.storageKey,
      contentType: d.contentType,
      sizeBytes: d.fileSize,
      uploadedBy: d.uploadedBy?.trim() || null,
      note: d.note?.trim() || null,
      ipHash: hashIp(ip),
    },
    update: {},
    select: { id: true, createdAt: true },
  });

  // A document landing is worth knowing about the same day, never at the cost
  // of the uploader seeing an error.
  try {
    const total = await prisma.auditUpload.count({ where: { engagement: ENGAGEMENT } });
    await notifyInternal(
      "debo.odulana@consultforafrica.com",
      `Arabella: ${d.filename} uploaded (section ${d.section}, ${total} in)`,
      `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1F2937">
<p><b>${d.uploadedBy?.trim() || "Someone at Arabella"}</b> uploaded <b>${d.filename}</b> against section <b>${d.section}</b>.</p>
${d.note?.trim() ? `<p style="color:#475569">Their note: ${d.note.trim()}</p>` : ""}
<p>That is <b>${total}</b> document${total === 1 ? "" : "s"} received so far.</p>
<p><a href="https://www.consultforafrica.com/admin/arabella-audit" style="color:#0B3C5D">See what has come in</a></p>
</div>`
    );
  } catch (err) {
    console.error("[arabella-audit/upload] notification failed", err);
  }

  return Response.json({ ok: true, id: row.id });
}
