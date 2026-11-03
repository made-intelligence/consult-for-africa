import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { logAudit } from "@/lib/audit";
import {
  cadenceAt,
  isClosed,
  loadSlaAttachment,
  mergeFieldsFor,
  programmeAccess,
  providerEmail,
  render,
  sendProviderEmail,
  suppressedEmails,
  templateHash,
} from "@/lib/signings";

export const maxDuration = 300;

const MAX_PER_SEND = 300;

const Body = z.object({
  mode: z.enum(["TEST", "SEND"]),
  ids: z.array(z.string()).min(1).max(MAX_PER_SEND),
  subject: z.string().trim().min(3).max(160),
  body: z.string().trim().min(20).max(4000),
  attachSla: z.boolean(),
});

/**
 * Follow-up email to the providers selected on the desk. Every send is one
 * email per provider, from the programme's sender name, with replies going to
 * the person sending. TEST sends the first provider's version to the sender
 * alone; SEND refuses unless that exact wording was tested in the last two
 * hours. Providers already signed or parked are skipped, as are suppressed
 * addresses and rows with no email.
 */
export const POST = handler(async function POST(req: NextRequest, ctx: { params: Promise<{ programmeId: string }> }) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { programmeId } = await ctx.params;
  const access = await programmeAccess(programmeId, session.user);
  if (!access) return Response.json({ error: "Not found" }, { status: 404 });
  const p = access.programme;

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  const b = parsed.data;
  const hash = templateHash(b.subject, b.body);
  const me = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id }, select: { email: true, name: true } });

  const providers = await prisma.providerSigning.findMany({ where: { programmeId, id: { in: b.ids } } });
  const attachment = b.attachSla ? await loadSlaAttachment(p) : null;
  if (b.attachSla && !attachment) return Response.json({ error: "No SLA file on the programme yet. Ask the lead to upload it, or untick the attachment." }, { status: 400 });

  if (b.mode === "TEST") {
    const sample = providers.find((x) => providerEmail(x)) ?? providers[0];
    const f = mergeFieldsFor(sample, p.senderName);
    const res = await sendProviderEmail({
      to: me.email,
      toName: me.name,
      subject: `TEST: ${render(b.subject, f)}`,
      text: render(b.body, f),
      senderName: p.senderName,
      replyTo: { email: me.email, name: me.name },
      attachment,
      tag: "signing-bulk-test",
    });
    if (!res.ok) return Response.json({ error: `Test did not send: ${res.error}` }, { status: 502 });
    await logAudit({ userId: session.user.id, action: "CREATE", entityType: "SigningEmailTest", entityId: p.id, details: { hash, kind: "bulk" } });
    return Response.json({ ok: true, sentTo: me.email, sample: sample.facility });
  }

  const tested = await prisma.auditLog.findMany({
    where: { userId: session.user.id, entityType: "SigningEmailTest", entityId: p.id, createdAt: { gte: new Date(Date.now() - 2 * 3600 * 1000) } },
    select: { details: true },
  });
  if (!tested.some((t) => (t.details as { hash?: string } | null)?.hash === hash)) {
    return Response.json({ error: "Send this exact email to yourself first, read it, then send." }, { status: 409 });
  }

  const suppressed = await suppressedEmails(providers.map(providerEmail).filter((e): e is string => !!e));
  const skipped: { facility: string; reason: string }[] = [];
  let sent = 0;
  const now = new Date();
  const seen = new Set<string>();
  for (const x of providers) {
    const to = providerEmail(x);
    if (isClosed(x.stage)) { skipped.push({ facility: x.facility, reason: "already signed or parked" }); continue; }
    if (!to) { skipped.push({ facility: x.facility, reason: "no email" }); continue; }
    if (suppressed.has(to.toLowerCase())) { skipped.push({ facility: x.facility, reason: "address is suppressed" }); continue; }
    if (seen.has(to.toLowerCase())) { skipped.push({ facility: x.facility, reason: "same address as another row in this send" }); continue; }
    seen.add(to.toLowerCase());
    const f = mergeFieldsFor(x, p.senderName);
    const res = await sendProviderEmail({
      to,
      toName: x.signatoryName || x.contactName,
      subject: render(b.subject, f),
      text: render(b.body, f),
      senderName: p.senderName,
      replyTo: { email: me.email, name: me.name },
      attachment,
      tag: "signing-bulk",
    });
    if (!res.ok) { skipped.push({ facility: x.facility, reason: `send failed: ${res.error}` }); continue; }
    sent++;
    // An email carrying the SLA to someone who did not have it starts the chase.
    const startsChase = attachment && ["TARGET", "CONTACTED", "INTERESTED"].includes(x.stage);
    const c = startsChase ? cadenceAt(now, 0) : null;
    await prisma.$transaction([
      prisma.providerSigning.update({
        where: { id: x.id },
        data: {
          lastContactAt: now,
          firstContactAt: x.firstContactAt ?? now,
          ownerId: x.ownerId ?? session.user.id,
          ...(startsChase && { stage: "SLA_SENT", slaSentAt: now, cadenceStep: 0, chaseCount: 0, nextAction: c?.nextAction, nextActionAt: c?.nextActionAt }),
        },
      }),
      prisma.providerSigningEvent.create({
        data: { signingId: x.id, kind: "BULK_EMAIL", note: render(b.subject, f), actorId: session.user.id },
      }),
      ...(startsChase ? [prisma.providerSigningEvent.create({ data: { signingId: x.id, kind: "STAGE", stage: "SLA_SENT", actorId: session.user.id } })] : []),
    ]);
  }
  return Response.json({ ok: true, sent, skipped });
});
