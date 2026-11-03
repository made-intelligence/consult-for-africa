import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { logAudit } from "@/lib/audit";
import { buildKey, generateUploadUrl, objectExists } from "@/lib/r2";
import { loadSlaAttachment, programmeAccess, render, sendProviderEmail, templateHash } from "@/lib/signings";

const Body = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("SETTINGS"),
    senderName: z.string().trim().min(2).max(80),
    chaseSubject: z.string().trim().min(3).max(160),
    chaseBody: z.string().trim().min(20).max(4000),
    chaseDays: z.array(z.number().int().min(1).max(60)).min(1).max(8),
    documentsChecklist: z.string().max(4000).nullable(),
  }),
  z.object({ action: z.literal("TEST_CHASE") }),
  z.object({ action: z.literal("CHASE_ON") }),
  z.object({ action: z.literal("CHASE_OFF") }),
  z.object({
    action: z.literal("SLA_UPLOAD_URL"),
    fileName: z.string().min(1).max(200),
    contentType: z.enum(["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]),
    size: z.number().int().positive().max(8 * 1024 * 1024),
  }),
  z.object({ action: z.literal("SLA_SET"), key: z.string().min(1), fileName: z.string().min(1).max(200) }),
]);

/**
 * Programme settings, for the lead only. The automatic chase stays off until
 * the lead has sent the current wording to themselves, and any change to the
 * wording switches it back off, so nothing reaches a hospital unread.
 */
export const PATCH = handler(async function PATCH(req: NextRequest, ctx: { params: Promise<{ programmeId: string }> }) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { programmeId } = await ctx.params;
  const access = await programmeAccess(programmeId, session.user);
  if (!access) return Response.json({ error: "Not found" }, { status: 404 });
  if (!access.canLead) return Response.json({ error: "Only the engagement lead can change this." }, { status: 403 });
  const p = access.programme;

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  const b = parsed.data;

  if (b.action === "SETTINGS") {
    const wordingChanged = b.chaseSubject !== p.chaseSubject || b.chaseBody !== p.chaseBody || b.senderName !== p.senderName;
    await prisma.signingProgramme.update({
      where: { id: p.id },
      data: {
        senderName: b.senderName,
        chaseSubject: b.chaseSubject,
        chaseBody: b.chaseBody,
        chaseDays: [...new Set(b.chaseDays)].sort((x, y) => x - y),
        documentsChecklist: b.documentsChecklist?.trim() || null,
        ...(wordingChanged && { chaseEnabled: false, chaseApprovedAt: null, chaseApprovedById: null }),
      },
    });
    return Response.json({ ok: true, chaseSwitchedOff: wordingChanged && p.chaseEnabled });
  }

  if (b.action === "TEST_CHASE") {
    const sample = await prisma.providerSigning.findFirst({ where: { programmeId: p.id, stage: "SLA_SENT" } });
    const fields = {
      contact: sample?.signatoryName || sample?.contactName || "Dr Adeyemi",
      facility: sample?.facility || "Grace Clinic, Egbeda",
      sender: p.senderName,
      link: sample ? `(the provider's own return link)` : "(the provider's own return link)",
    };
    const res = await sendProviderEmail({
      to: session.user.email!,
      toName: session.user.name,
      subject: `TEST: ${render(p.chaseSubject, fields)}`,
      text: render(p.chaseBody, fields),
      senderName: p.senderName,
      attachment: await loadSlaAttachment(p),
      tag: "signing-chase-test",
    });
    if (!res.ok) return Response.json({ error: `Test did not send: ${res.error}` }, { status: 502 });
    await logAudit({
      userId: session.user.id,
      action: "CREATE",
      entityType: "SigningEmailTest",
      entityId: p.id,
      details: { hash: templateHash(p.chaseSubject, p.chaseBody), kind: "chase" },
    });
    return Response.json({ ok: true, sentTo: session.user.email });
  }

  if (b.action === "CHASE_ON") {
    const hash = templateHash(p.chaseSubject, p.chaseBody);
    const tests = await prisma.auditLog.findMany({
      where: { userId: session.user.id, entityType: "SigningEmailTest", entityId: p.id, createdAt: { gte: new Date(Date.now() - 24 * 3600 * 1000) } },
      select: { details: true },
    });
    if (!tests.some((t) => (t.details as { hash?: string } | null)?.hash === hash)) {
      return Response.json({ error: "Send the current wording to yourself first, read it, then switch it on." }, { status: 409 });
    }
    await prisma.signingProgramme.update({
      where: { id: p.id },
      data: { chaseEnabled: true, chaseApprovedAt: new Date(), chaseApprovedById: session.user.id },
    });
    return Response.json({ ok: true });
  }

  if (b.action === "CHASE_OFF") {
    await prisma.signingProgramme.update({ where: { id: p.id }, data: { chaseEnabled: false } });
    return Response.json({ ok: true });
  }

  if (b.action === "SLA_UPLOAD_URL") {
    const key = buildKey(`signings/${p.id}/template`, b.fileName);
    return Response.json({ key, url: await generateUploadUrl(key, b.contentType, 600, b.size) });
  }

  // SLA_SET
  if (!b.key.startsWith(`signings/${p.id}/template/`) || !(await objectExists(b.key))) {
    return Response.json({ error: "Upload not found" }, { status: 400 });
  }
  await prisma.signingProgramme.update({ where: { id: p.id }, data: { slaFileKey: b.key, slaFileName: b.fileName } });
  return Response.json({ ok: true });
});
