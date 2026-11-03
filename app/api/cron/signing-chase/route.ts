/**
 * The automatic SLA reminder.
 *
 * Most of what stands between Aman and 300 signed agreements is hospitals
 * holding an SLA nobody has put in front of the MD. Every working morning this
 * sends each provider whose reminder is due one short email with a fresh copy
 * and its own return link, on the days the programme sets (2, 5, 9 and 14
 * after sending by default). It runs only for programmes whose lead has read
 * the wording and switched it on, never for a row someone has paused, and at
 * most once a day per provider.
 *
 * ?dryRun=1 reports what would go without sending anything.
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import {
  lagosDayStart,
  loadSlaAttachment,
  mergeFieldsFor,
  providerEmail,
  render,
  sendProviderEmail,
  suppressedEmails,
} from "@/lib/signings";

export const maxDuration = 300;

const DAY = 24 * 60 * 60 * 1000;
/** A ceiling per programme per morning, so a bad import cannot become a flood. */
const DAILY_CAP = 150;

function authorise(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  return req.headers.get("authorization") === `Bearer ${expected}`;
}

export const GET = handler(async function GET(req: NextRequest) {
  if (!authorise(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  const now = new Date();
  const today = lagosDayStart(now);

  const programmes = await prisma.signingProgramme.findMany({ where: { chaseEnabled: true } });
  const report: { programme: string; due: number; sent: number; skipped: number; facilities: string[] }[] = [];

  for (const p of programmes) {
    const rows = await prisma.providerSigning.findMany({
      where: { programmeId: p.id, stage: "SLA_SENT", chasePaused: false, slaSentAt: { not: null } },
      include: { owner: { select: { email: true, name: true } } },
      orderBy: { slaSentAt: "asc" },
    });
    const due = rows.filter((r) => {
      const step = p.chaseDays[r.chaseCount];
      if (step === undefined) return false;
      if (r.lastChasedAt && r.lastChasedAt >= today) return false;
      // Someone spoke to them today: let that conversation land first.
      if (r.lastContactAt && r.lastContactAt >= today) return false;
      return now.getTime() - r.slaSentAt!.getTime() >= step * DAY - 6 * 3600 * 1000;
    });
    const suppressed = await suppressedEmails(due.map(providerEmail).filter((e): e is string => !!e));
    const sendable = due.filter((r) => {
      const e = providerEmail(r);
      return e && !suppressed.has(e.toLowerCase());
    }).slice(0, DAILY_CAP);

    const entry = { programme: p.name, due: due.length, sent: 0, skipped: due.length - sendable.length, facilities: sendable.map((r) => r.facility) };
    report.push(entry);
    if (dryRun || !sendable.length) continue;

    const attachment = await loadSlaAttachment(p);
    for (const r of sendable) {
      const f = mergeFieldsFor(r, p.senderName);
      const res = await sendProviderEmail({
        to: providerEmail(r)!,
        toName: r.signatoryName || r.contactName,
        subject: render(p.chaseSubject, f),
        text: render(p.chaseBody, f),
        senderName: p.senderName,
        replyTo: r.owner?.email ? { email: r.owner.email, name: r.owner.name } : null,
        attachment,
        tag: "signing-chase",
      });
      if (!res.ok) {
        console.error(`[signing-chase] ${r.facility}: ${res.error}`);
        continue;
      }
      entry.sent++;
      await prisma.$transaction([
        prisma.providerSigning.update({ where: { id: r.id }, data: { chaseCount: { increment: 1 }, lastChasedAt: now } }),
        prisma.providerSigningEvent.create({
          data: { signingId: r.id, kind: "AUTO_CHASE", note: `Automatic reminder ${r.chaseCount + 1} of ${p.chaseDays.length}` },
        }),
      ]);
    }
  }
  return Response.json({ ok: true, dryRun, report });
});
