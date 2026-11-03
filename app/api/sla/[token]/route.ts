import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { buildKey, generateDownloadUrl, generateUploadUrl, objectExists } from "@/lib/r2";
import { siteUrl, isSigned } from "@/lib/signings";
import { sendViaZeptoMail } from "@/lib/zeptomail";

/**
 * The provider's return link. Public: the token in the path is the only
 * credential, so nothing here reveals more than the facility's own name, and
 * uploads land under that provider's own folder and nowhere else.
 */

const TYPES = ["application/pdf", "image/jpeg", "image/png", "image/heic", "image/webp"] as const;
const MAX = 15 * 1024 * 1024;

const Body = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("UPLOAD_URL"),
    kind: z.enum(["SLA", "DOC"]),
    fileName: z.string().min(1).max(200),
    contentType: z.enum(TYPES),
    size: z.number().int().positive().max(MAX),
  }),
  z.object({
    action: z.literal("CONFIRM"),
    kind: z.enum(["SLA", "DOC"]),
    key: z.string().min(1).max(400),
    fileName: z.string().min(1).max(200),
    signatoryName: z.string().trim().max(160).optional(),
  }),
]);

async function find(token: string) {
  if (!/^[A-Za-z0-9_-]{20,40}$/.test(token)) return null;
  return prisma.providerSigning.findUnique({
    where: { returnToken: token },
    include: {
      owner: { select: { email: true, name: true } },
      programme: {
        select: {
          id: true,
          name: true,
          senderName: true,
          documentsChecklist: true,
          slaFileKey: true,
          engagement: { select: { engagementManager: { select: { email: true, name: true } } } },
        },
      },
    },
  });
}

export const GET = handler(async function GET(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const p = await find(token);
  if (!p) return Response.json({ error: "This link is not valid." }, { status: 404 });
  if (req.nextUrl.searchParams.get("download") === "sla") {
    if (!p.programme.slaFileKey) return Response.json({ error: "No agreement on file." }, { status: 404 });
    return Response.redirect(await generateDownloadUrl(p.programme.slaFileKey), 302);
  }
  return Response.json({
    facility: p.facility,
    senderName: p.programme.senderName,
    checklist: p.programme.documentsChecklist,
    hasTemplate: !!p.programme.slaFileKey,
    signed: !!p.signedFileKey,
    documents: p.documentKeys.length,
  });
});

export const POST = handler(async function POST(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const p = await find(token);
  if (!p) return Response.json({ error: "This link is not valid." }, { status: 404 });
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Please upload a PDF or a photo, up to 15MB." }, { status: 400 });
  const b = parsed.data;
  const folder = `signings/${p.programme.id}/returns/${p.returnToken}`;

  if (b.action === "UPLOAD_URL") {
    const key = buildKey(`${folder}/${b.kind.toLowerCase()}`, b.fileName);
    return Response.json({ key, url: await generateUploadUrl(key, b.contentType, 900, b.size) });
  }

  if (!b.key.startsWith(`${folder}/`) || !(await objectExists(b.key))) {
    return Response.json({ error: "The upload did not arrive. Please try again." }, { status: 400 });
  }
  const now = new Date();
  if (b.kind === "SLA") {
    const promote = !isSigned(p.stage);
    await prisma.$transaction([
      prisma.providerSigning.update({
        where: { id: p.id },
        data: {
          signedFileKey: b.key,
          signedFileName: b.fileName,
          ...(b.signatoryName && !p.signatoryName && { signatoryName: b.signatoryName }),
          ...(promote && { stage: "SIGNED", signedAt: now, nextAction: "Check the signed copy and collect any missing documents", nextActionAt: now }),
        },
      }),
      prisma.providerSigningEvent.create({
        data: { signingId: p.id, kind: "UPLOAD", note: `Signed SLA returned through the link: ${b.fileName}${b.signatoryName ? `, signed by ${b.signatoryName}` : ""}` },
      }),
      ...(promote ? [prisma.providerSigningEvent.create({ data: { signingId: p.id, kind: "STAGE", stage: "SIGNED" as const } })] : []),
    ]);
  } else {
    await prisma.$transaction([
      prisma.providerSigning.update({ where: { id: p.id }, data: { documentKeys: { push: b.key } } }),
      prisma.providerSigningEvent.create({ data: { signingId: p.id, kind: "UPLOAD", note: `Document returned through the link: ${b.fileName}` } }),
    ]);
  }

  // Tell the owner (or the lead, if nobody owns the row) the same minute. A
  // failed notification never fails the provider's upload.
  const to = p.owner ?? p.programme.engagement.engagementManager;
  if (to?.email) {
    try {
      await sendViaZeptoMail({
        from: { email: "hello@consultforafrica.com", name: "Consult for Africa" },
        to: [{ email: to.email, name: to.name }],
        subject: `${b.kind === "SLA" ? "Signed SLA returned" : "Document returned"}: ${p.facility}`,
        textbody: `${p.facility} has just returned ${b.kind === "SLA" ? "its signed SLA" : `a document (${b.fileName})`} through its link.\n\nOpen the signing desk to check it: ${siteUrl()}/admin/signings/${p.programme.id}?q=${encodeURIComponent(p.facility)}`,
      });
    } catch (err) {
      console.error("[sla return] owner notification failed", err);
    }
  }
  return Response.json({ ok: true });
});
