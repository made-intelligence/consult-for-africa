import { z } from "zod";
import { handler } from "@/lib/api-handler";
import { isRateLimited } from "@/lib/rate-limit";
import { generateUploadUrl } from "@/lib/r2";
import {
  estatePhotoKey,
  resolveContentType,
  MAX_PHOTO_BYTES,
  type PhotoScope,
} from "@/lib/estate/photos";
import { gateTenant, gateCrew, clientIp } from "@/lib/estate/gate";

/**
 * A photograph on its way to R2, from a phone held by somebody with no account.
 *
 * NO PLATFORM AUTH — the link token is the credential, the same arrangement as
 * app/api/osteon-audit/upload. The browser asks here for a presigned PUT, sends
 * the bytes straight to R2, then hands the key back to whichever route is
 * recording the thing the photograph belongs to.
 *
 * A readable URL is never returned. The cfa-uploads bucket serves any object to
 * anyone holding its key, and these are photographs of the inside of people's
 * homes, so the key is minted with 256 bits of randomness and no filename and
 * reads go back out as five-minute presigned GETs.
 */

const SCOPES = ["issue", "run", "delivery", "dip", "receipt"] as const;

const schema = z.object({
  token: z.string().min(20).max(120),
  audience: z.enum(["tenant", "crew"]),
  scope: z.enum(SCOPES),
  filename: z.string().min(1).max(260),
  contentType: z.string().max(160).optional(),
  fileSize: z.number().int().positive(),
});

export const POST = handler(async function POST(req: Request) {
  const ip = clientIp(req);
  if (isRateLimited(ip, "estate-upload", { windowMs: 60_000, max: 40 })) {
    return Response.json({ error: "Too many uploads. Wait a moment." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });
  const d = parsed.data;

  const gate = d.audience === "tenant" ? await gateTenant(d.token) : await gateCrew(d.token);
  if (!gate.ok) return Response.json({ error: gate.error }, { status: gate.status });
  if (d.audience === "crew" && "locked" in gate.ctx && gate.ctx.locked) {
    return Response.json({ error: "Enter your PIN first." }, { status: 403 });
  }

  if (d.fileSize > MAX_PHOTO_BYTES) {
    return Response.json(
      { error: `That photo is too large. The limit is ${Math.round(MAX_PHOTO_BYTES / 1024 / 1024)}MB.` },
      { status: 400 },
    );
  }

  const contentType = resolveContentType(d.contentType, d.filename);
  if (!contentType) {
    return Response.json({ error: "Photos only — JPG, PNG, WEBP or HEIC." }, { status: 400 });
  }

  const storageKey = estatePhotoKey(d.scope as PhotoScope, d.filename);
  const uploadUrl = await generateUploadUrl(storageKey, contentType, 900, d.fileSize);

  // Deliberately no readable URL in this response.
  return Response.json({ uploadUrl, storageKey, contentType });
});
