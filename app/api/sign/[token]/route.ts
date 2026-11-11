import { randomBytes } from "node:crypto";
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { isRateLimited } from "@/lib/rate-limit";
import { generateUploadUrl, objectExists } from "@/lib/r2";
import { sendViaZeptoMail } from "@/lib/zeptomail";
import { SIGNED_STAGES, isClosed } from "@/lib/outreach";
import { FILE_TYPES, MAX_FILE, SITE, chaseStartFields, hospitalMove, isToken, viewUrl } from "@/lib/outreach-hospital";

// A hospital's private page. Public: the token is the only credential, so the
// response carries nothing beyond the facility's own name and its own files'
// names. Uploads go under the target's own folder in private storage.

const Body = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("YES"),
    signatoryName: z.string().trim().min(2, "Who signs for the facility?").max(160),
    signatoryRole: z.string().trim().max(120).optional().default(""),
    signatoryPhone: z.string().trim().max(60).optional().default(""),
    signatoryEmail: z.union([z.string().trim().toLowerCase().email("That email does not look right").max(200), z.literal("")]).optional().default(""),
  }),
  z.object({ action: z.literal("NOT_NOW"), reason: z.string().trim().max(1000).optional().default("") }),
  z.object({ action: z.literal("UPLOAD_URL"), kind: z.enum(["AGREEMENT", "DOCUMENT"]), fileName: z.string().min(1).max(200), contentType: z.enum(FILE_TYPES), size: z.number().int().positive().max(MAX_FILE) }),
  z.object({
    action: z.literal("CONFIRM"),
    kind: z.enum(["AGREEMENT", "DOCUMENT"]),
    key: z.string().min(1).max(300),
    fileName: z.string().min(1).max(200),
    contentType: z.enum(FILE_TYPES),
    size: z.number().int().positive().max(MAX_FILE),
    signedBy: z.string().trim().max(160).optional(),
  }),
  z.object({ action: z.literal("PACK_READY") }),
]);

async function find(token: string) {
  if (!isToken(token)) return null;
  return prisma.sprintTarget.findUnique({
    where: { token },
    include: {
      hospital: { select: { name: true } },
      owner: { select: { name: true, email: true } },
      files: { orderBy: { createdAt: "asc" } },
      sprint: { include: { members: { where: { role: "LEAD" }, include: { user: { select: { name: true, email: true } } } } } },
    },
  });
}
type Found = NonNullable<Awaited<ReturnType<typeof find>>>;

async function tellOwner(t: Found, subject: string, line: string) {
  const to = t.owner ?? t.sprint.members[0]?.user;
  if (!to?.email) return;
  try {
    await sendViaZeptoMail({
      from: { email: "hello@consultforafrica.com", name: "Consult for Africa" },
      to: [{ email: to.email, name: to.name }],
      subject: `${subject}: ${t.hospital.name}`,
      textbody: `${t.hospital.name} ${line} on its page.\n\nOpen it on the signing desk: ${SITE}/sprints/${t.sprint.slug}/t/${t.id}`,
    });
  } catch (err) {
    console.error("[sign] owner notification failed", err);
  }
}

export const GET = handler(async (req: NextRequest, ctx: { params: Promise<{ token: string }> }) => {
  const { token } = await ctx.params;
  const t = await find(token);
  if (!t || !t.sprint.active) return Response.json({ error: "This link is not valid." }, { status: 404 });
  const now = new Date();

  if (req.nextUrl.searchParams.get("download") === "agreement") {
    if (!t.sprint.agreementKey) return Response.json({ error: "The agreement is not on file yet." }, { status: 404 });
    // Having the agreement in hand is what the chase runs from.
    if (!t.sentAt && !isClosed(t.stage) && !SIGNED_STAGES.includes(t.stage as never)) {
      await hospitalMove(t, "DOWNLOADED", { stage: "SENT", extra: chaseStartFields(now) });
    }
    return Response.redirect(await viewUrl(t.sprint.agreementKey), 302);
  }

  if (!t.linkOpenedAt) {
    await prisma.sprintTarget.update({ where: { id: t.id }, data: { linkOpenedAt: now } });
    await prisma.sprintTouch.create({ data: { targetId: t.id, actor: "HOSPITAL", channel: "LINK", outcome: "OPENED", stageFrom: t.stage, stageTo: t.stage } });
  }

  const client = t.sprint.clientName ?? t.sprint.name;
  return Response.json({
    facility: t.hospital.name,
    client,
    pitch: t.sprint.pitch,
    checklist: t.sprint.checklist,
    hasAgreement: !!t.sprint.agreementKey,
    stage: t.stage,
    saidYes: !["TARGET", "CONTACTED"].includes(t.stage),
    signatoryName: t.signatoryName,
    packReady: !!t.packReadyAt,
    files: t.files.map((f) => ({ id: f.id, kind: f.kind, fileName: f.fileName, rejected: !!f.rejectedAt, rejectNote: f.rejectNote })),
    contact: t.owner?.name ?? null,
  });
});

export const POST = handler(async (req: NextRequest, ctx: { params: Promise<{ token: string }> }) => {
  const { token } = await ctx.params;
  if (isRateLimited(`sign:${token}`, "sprint-sign", { max: 40 })) return Response.json({ error: "Too many tries. Please wait a minute." }, { status: 429 });
  const t = await find(token);
  if (!t || !t.sprint.active) return Response.json({ error: "This link is not valid." }, { status: 404 });
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Please upload a PDF or a photo, up to 15MB." }, { status: 400 });
  const b = parsed.data;
  const folder = `sprints/${t.sprintId}/${t.id}/`;
  const now = new Date();

  if (b.action === "YES") {
    await hospitalMove(t, "HOSPITAL_YES", {
      stage: "INTERESTED",
      said: [b.signatoryName, b.signatoryRole].filter(Boolean).join(", ") + " signs.",
      nextAction: t.sprint.agreementKey ? "Said yes on their page: call the signatory to confirm they have the agreement" : "Said yes on their page: send the SLA today",
      extra: {
        ...(t.signatoryName ? {} : { signatoryName: b.signatoryName }),
        ...(t.signatoryRole || !b.signatoryRole ? {} : { signatoryRole: b.signatoryRole }),
        ...(t.signatoryPhone || !b.signatoryPhone ? {} : { signatoryPhone: b.signatoryPhone }),
        ...(t.signatoryEmail || !b.signatoryEmail ? {} : { signatoryEmail: b.signatoryEmail }),
      },
    });
    await tellOwner(t, "Said yes", "said yes and named who signs");
    return Response.json({ ok: true });
  }

  if (b.action === "NOT_NOW") {
    await hospitalMove(t, "HOSPITAL_NOT_NOW", { said: b.reason || null, nextAction: "Said not now on their page: call to understand why" });
    return Response.json({ ok: true });
  }

  if (b.action === "UPLOAD_URL") {
    const key = `${folder}${randomBytes(32).toString("hex")}`;
    return Response.json({ key, url: await generateUploadUrl(key, b.contentType, 900, b.size) });
  }

  if (b.action === "CONFIRM") {
    if (!b.key.startsWith(folder) || !(await objectExists(b.key))) return Response.json({ error: "The upload did not arrive. Please try again." }, { status: 400 });
    if (await prisma.sprintFile.findUnique({ where: { key: b.key } })) return Response.json({ ok: true });
    await prisma.sprintFile.create({ data: { targetId: t.id, kind: b.kind, key: b.key, fileName: b.fileName, contentType: b.contentType, size: b.size, signedBy: b.signedBy || null } });
    if (b.kind === "AGREEMENT") {
      await hospitalMove(t, "RETURNED_AGREEMENT", {
        stage: "SIGNED",
        note: `${b.fileName}${b.signedBy ? `, signed by ${b.signedBy}` : ""}`,
        nextAction: "Check the signed copy, and collect any missing documents",
        extra: { ...(t.signedAt ? {} : { signedAt: now }), ...(t.sentAt ? {} : { sentAt: now }), escalatedAt: null },
      });
      await tellOwner(t, "Signed agreement returned", "returned its signed agreement");
    } else {
      await hospitalMove(t, "RETURNED_DOCUMENT", { note: b.fileName });
    }
    return Response.json({ ok: true });
  }

  // PACK_READY: only once there is a signed agreement we have not rejected.
  if (!t.files.some((f) => f.kind === "AGREEMENT" && !f.rejectedAt)) return Response.json({ error: "Send the signed agreement first." }, { status: 400 });
  await hospitalMove(t, "PACK_READY", { nextAction: "Review the pack: mark Docs complete, or reject a file", extra: { packReadyAt: now } });
  await tellOwner(t, "Pack ready for review", "says its agreement and documents are complete");
  return Response.json({ ok: true });
});
