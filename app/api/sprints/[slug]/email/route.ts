import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { addWorkingDays, applyTouch, forward } from "@/lib/outreach";
import {
  EMAIL_LABELS,
  agreementAttachment,
  emailsFor,
  ensureToken,
  firstName,
  hospitalLink,
  isSuppressed,
  isTested,
  recipientFor,
  render,
  sendHospitalEmail,
  wordingHash,
  type EmailKind,
} from "@/lib/outreach-hospital";
import { canWork, sprintAccess } from "@/lib/outreach-server";

// Email hospitals their own link: the introduction, the agreement, or a
// reminder. Nothing goes to a hospital in wording the sender has not first
// sent to themselves (test: true), and every send is a touch on the desk.

const body = z.object({
  kind: z.enum(["intro", "sla", "chase"]),
  targetIds: z.array(z.string().min(1)).min(1).max(50),
  test: z.boolean().optional().default(false),
});

export const POST = handler(async (req: NextRequest, ctx: { params: Promise<{ slug: string }> }) => {
  const session = await auth();
  if (!session) return Response.json({ error: "Please sign in" }, { status: 401 });
  const { slug } = await ctx.params;
  const a = await sprintAccess(slug, session.user);
  if (!a) return Response.json({ error: "You are not on this sprint" }, { status: 403 });
  const parsed = body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
  const { kind, targetIds, test } = parsed.data;
  if (targetIds.length > 1 && !a.steer) return Response.json({ error: "Only the lead or the runner can email several at once" }, { status: 403 });

  const sprint = a.sprint;
  const wording = emailsFor(sprint)[kind as EmailKind];
  const client = sprint.clientName ?? sprint.name;
  const me = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id }, select: { name: true, email: true } });
  const sender = firstName(me.name) ? me.name.replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, "") : "The provider network team";

  const targets = await prisma.sprintTarget.findMany({
    where: { id: { in: targetIds }, sprintId: sprint.id },
    include: { hospital: { select: { name: true, contacts: { select: { email: true, name: true }, orderBy: { isPrimary: "desc" } } } } },
  });
  if (!targets.length) return Response.json({ error: "Not found" }, { status: 404 });
  const attachment = kind === "sla" ? await agreementAttachment(sprint) : null;

  if (test) {
    // The test is the first target, rendered exactly, sent to the sender alone.
    const t = targets[0];
    const token = await ensureToken(t.id);
    const r = recipientFor(t);
    const m = { contact: firstName(t.signatoryName) ? t.signatoryName! : r?.name || "Sir or Madam", facility: t.hospital.name, client, sender, link: hospitalLink(token) };
    const res = await sendHospitalEmail({ to: { email: me.email, name: me.name }, subject: `TEST: ${render(wording.subject, m)}`, text: render(wording.body, m), senderName: `${sender} for ${client}`, replyTo: { email: me.email, name: me.name }, attachment, tag: `sprint-${slug}-test` });
    if (!res.ok) return Response.json({ error: `The test did not send: ${res.error ?? "unknown"}` }, { status: 502 });
    const h = wordingHash(wording);
    if (!sprint.testedHashes.includes(h)) await prisma.outreachSprint.update({ where: { id: sprint.id }, data: { testedHashes: { push: h } } });
    return Response.json({ ok: true, to: me.email });
  }

  if (!isTested(sprint, wording)) return Response.json({ error: `Send the ${EMAIL_LABELS[kind as EmailKind].toLowerCase()} email to yourself first. Any change to the wording needs a new test.` }, { status: 409 });

  const results: { targetId: string; status: "sent" | "skipped"; why?: string }[] = [];
  for (const t of targets) {
    if (!canWork(a, t, session.user.id)) {
      results.push({ targetId: t.id, status: "skipped", why: "on someone else's list" });
      continue;
    }
    if (["HANDED_OVER", "PARKED", "DECLINED", "ALREADY_SIGNED"].includes(t.stage)) {
      results.push({ targetId: t.id, status: "skipped", why: "closed" });
      continue;
    }
    const r = recipientFor(t);
    if (!r) {
      results.push({ targetId: t.id, status: "skipped", why: "no email" });
      continue;
    }
    if (await isSuppressed(r.email)) {
      results.push({ targetId: t.id, status: "skipped", why: "opted out" });
      continue;
    }
    const token = await ensureToken(t.id);
    const m = { contact: t.signatoryName || r.name || "Sir or Madam", facility: t.hospital.name, client, sender, link: hospitalLink(token) };
    const res = await sendHospitalEmail({ to: r, subject: render(wording.subject, m), text: render(wording.body, m), senderName: `${sender} for ${client}`, replyTo: { email: me.email, name: me.name }, attachment, tag: `sprint-${slug}-${kind}` });
    if (!res.ok) {
      results.push({ targetId: t.id, status: "skipped", why: res.error ?? "send failed" });
      continue;
    }

    const now = new Date();
    const eff =
      kind === "sla"
        ? applyTouch(t, "SENT", now)
        : kind === "chase"
          ? applyTouch(t, "CHASED", now)
          : { stage: forward(t.stage, "CONTACTED"), nextAction: t.nextActionAt && t.nextActionAt > now ? t.nextAction : "Call to follow up the introduction email", nextActionAt: t.nextActionAt && t.nextActionAt > now ? t.nextActionAt : addWorkingDays(now, 2), chaseStep: t.chaseStep };
    await prisma.$transaction([
      prisma.sprintTouch.create({ data: { targetId: t.id, userId: session.user.id, channel: "EMAIL", outcome: kind === "intro" ? "LINK_SENT" : kind === "sla" ? "SENT" : "CHASED", spokeTo: r.email, note: `Emailed: ${render(wording.subject, m)}`, stageFrom: t.stage, stageTo: eff.stage } }),
      prisma.sprintTarget.update({
        where: { id: t.id },
        data: {
          stage: eff.stage,
          nextAction: eff.nextAction,
          nextActionAt: eff.nextActionAt,
          chaseStep: eff.chaseStep,
          linkSentAt: now,
          ...("sentAt" in eff && eff.sentAt ? { sentAt: eff.sentAt, escalatedAt: null } : {}),
          ...("escalatedAt" in eff && eff.escalatedAt ? { escalatedAt: eff.escalatedAt, escalationNote: eff.escalationNote } : {}),
          lastTouchAt: now,
          touchCount: { increment: 1 },
        },
      }),
    ]);
    results.push({ targetId: t.id, status: "sent" });
  }
  return Response.json({ ok: true, sent: results.filter((r) => r.status === "sent").length, skipped: results.filter((r) => r.status === "skipped"), results });
});
