import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { ESCALATE_ON_DAY, isOverdueForEscalation, todayInLagos, workingDaysBetween } from "@/lib/outreach";
import { emailsFor, ensureToken, firstName, hospitalLink, isSuppressed, isTested, recipientFor, render, sendHospitalEmail } from "@/lib/outreach-hospital";

// Weekdays at 9am Lagos. Two jobs:
//   1. Reminder emails to hospitals holding an unsigned agreement, on days 2,
//      5, 9 and 14 after it went out, with their own link. Only on sprints the
//      lead switched on, and only in wording someone has test-sent.
//   2. Any chase still unsigned on working day 8 goes to the runner, even if
//      nobody logged the last call.
// ?dryRun=1 reports what it would do.

const DAYS = [2, 5, 9, 14];
const CAP = 200;
const DAY_MS = 86_400_000;

function authorise(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  return !!expected && req.headers.get("authorization") === `Bearer ${expected}`;
}

export const GET = handler(async (req: NextRequest) => {
  if (!authorise(req)) return Response.json({ error: "Unauthorised" }, { status: 401 });
  const dry = req.nextUrl.searchParams.get("dryRun") === "1";
  const now = new Date();
  const today = todayInLagos(now);
  const report: Record<string, unknown>[] = [];

  for (const s of await prisma.outreachSprint.findMany({ where: { active: true } })) {
    const out = await prisma.sprintTarget.findMany({
      where: { sprintId: s.id, stage: "SENT", sentAt: { not: null } },
      include: {
        owner: { select: { name: true, email: true } },
        hospital: { select: { name: true, contacts: { select: { email: true, name: true }, orderBy: { isPrimary: "desc" } } } },
      },
    });

    // 2. Escalation sweep.
    const late = out.filter((t) => isOverdueForEscalation(t, now));
    if (!dry && late.length) {
      for (const t of late) {
        await prisma.sprintTarget.update({
          where: { id: t.id },
          data: { escalatedAt: now, escalationNote: `Still unsigned ${workingDaysBetween(t.sentAt!, now)} working days after the SLA went out (day ${ESCALATE_ON_DAY} is the limit).`, nextAction: "With the runner: escalate or park", nextActionAt: now },
        });
      }
    }

    // 1. Reminders.
    const chase = emailsFor(s).chase;
    const on = s.autoChaseOn && isTested(s, chase) && !!s.agreementKey;
    const due = on
      ? out.filter((t) => {
          const step = DAYS[t.autoChases];
          if (step == null) return false;
          if (t.lastAutoChaseAt && todayInLagos(t.lastAutoChaseAt) === today) return false;
          return (now.getTime() - t.sentAt!.getTime()) / DAY_MS >= step;
        })
      : [];
    let sent = 0;
    const skipped: string[] = [];
    for (const t of due.slice(0, CAP)) {
      const r = recipientFor(t);
      if (!r) {
        skipped.push(`${t.hospital.name}: no email`);
        continue;
      }
      if (await isSuppressed(r.email)) {
        skipped.push(`${t.hospital.name}: opted out`);
        continue;
      }
      if (dry) {
        sent++;
        continue;
      }
      const client = s.clientName ?? s.name;
      const sender = (t.owner?.name ?? "The provider network team").replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, "");
      const m = { contact: t.signatoryName || r.name || "Sir or Madam", facility: t.hospital.name, client, sender, link: hospitalLink(await ensureToken(t.id)) };
      const res = await sendHospitalEmail({ to: r, subject: render(chase.subject, m), text: render(chase.body, m), senderName: `${firstName(sender) ? sender : "Provider network"} for ${client}`, replyTo: t.owner?.email ? { email: t.owner.email, name: t.owner.name } : null, tag: `sprint-${s.slug}-auto` });
      if (!res.ok) {
        skipped.push(`${t.hospital.name}: ${res.error ?? "failed"}`);
        continue;
      }
      await prisma.$transaction([
        prisma.sprintTouch.create({ data: { targetId: t.id, actor: "SYSTEM", channel: "EMAIL", outcome: "AUTO_CHASE", spokeTo: r.email, note: `Reminder ${t.autoChases + 1} of ${DAYS.length}`, stageFrom: t.stage, stageTo: t.stage } }),
        prisma.sprintTarget.update({ where: { id: t.id }, data: { autoChases: { increment: 1 }, lastAutoChaseAt: now, lastTouchAt: now } }),
      ]);
      sent++;
    }
    report.push({ sprint: s.slug, remindersOn: on, out: out.length, due: due.length, sent, skipped, escalated: late.length });
  }
  return Response.json({ ok: true, dryRun: dry, report });
});
