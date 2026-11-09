import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { sendSMS } from "@/lib/cadreHealth/sms";
import { sendTransactionalEmail } from "@/lib/zeptomail";
import { released } from "@/lib/staffTaskRelease";
import { appliesTo } from "@/lib/havenLearn";
import { periodKey, ON_TODAY, type Cadence } from "@/lib/havenTaskPeriod";
import { dutyBook, EXCUSED } from "@/lib/havenDuty";
import { arabellaLearn } from "@/lib/arabellaLearn";
import { ARABELLA_DAILY } from "@/lib/arabella-daily";
import { ownersFor, practiceDay, sectionStatus } from "@/lib/dailyReturn";
import { greetingName } from "@/lib/staffAuth";
import { ARABELLA } from "@/lib/staffSites";
import { weekStart } from "@/lib/arabella-plan";

/**
 * Arabella's morning message, 07:00 Lagos, before the 7:45 huddle.
 *
 * Most of the team is held by mobile number only, so this is an SMS first and
 * an email only where there is no phone or the SMS fails. One message, one
 * person, only what is theirs today, with the link that opens it.
 *
 * Rules, each borrowed from what Haven learned the hard way:
 *  - Nothing waiting, nothing sent. A daily message that arrives regardless is
 *    trained away inside a fortnight.
 *  - Off or on leave on the rota: nothing. A rest day is not chased.
 *  - Never signed in: no list at all, only the invitation, Mondays and
 *    Thursdays. A list of things waiting on somebody who has never seen the
 *    page reads as a debt.
 *  - Before the team's first week: silent.
 *
 * ?dryRun=1 returns what would be sent without sending.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SITE = (process.env.NEXTAUTH_URL ?? "https://www.consultforafrica.com").replace(/\/$/, "");

function smsList(first: string, items: string[]) {
  const head = `Good morning ${first}. ${items.length === 1 ? "1 thing" : `${items.length} things`} for you today at Arabella: `;
  const link = ` ${SITE}${ARABELLA.pathPrefix}`;
  // Keep it to two SMS pages at most: name what fits, count the rest.
  const budget = 300 - head.length - link.length;
  const shown: string[] = [];
  let used = 0;
  for (const it of items) {
    const add = (shown.length ? "; " : "") + it;
    if (used + add.length > budget - 12) break;
    shown.push(it);
    used += add.length;
  }
  const more = items.length - shown.length;
  return `${head}${shown.join("; ")}${more ? `; +${more} more` : ""}.${link}`;
}

function smsInvite(first: string) {
  return `Hello ${first}, your Arabella staff page is ready. Sign in with this mobile number and a code comes to you. No password. ${SITE}${ARABELLA.pathPrefix}`;
}

async function deliver(to: { phone: string | null; email: string | null }, text: string, subject: string) {
  if (to.phone) {
    const ok = await sendSMS(to.phone, text, process.env.TERMII_SENDER_ID_CFA);
    if (ok) return "SMS";
  }
  if (to.email) {
    await sendTransactionalEmail({
      from: process.env.SMTP_FROM ?? "Consult for Africa <hello@consultforafrica.com>",
      replyTo: process.env.REPLY_TO_EMAIL ?? "hello@consultforafrica.com",
      to: to.email,
      subject,
      text: `${text}\n\nConsult for Africa`,
      html: `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15.5px;line-height:1.6;color:#1F2937;max-width:520px"><p>${text.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p><p style="color:#64748b;font-size:14px">Consult for Africa</p></div>`,
    });
    return "EMAIL";
  }
  return "NONE";
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  const now = new Date();
  if (now < weekStart(1)) return NextResponse.json({ ok: true, skipped: "before the team's first week" });

  const clientId = ARABELLA.clientId!;
  const today = practiceDay(ARABELLA_DAILY, now);

  const staff = await prisma.staffMember.findMany({
    where: { clientId, isActive: true, kind: { not: "TEST" }, OR: [{ phone: { not: null } }, { email: { not: null } }] },
    select: { id: true, name: true, phone: true, email: true, position: true, department: true, tiers: true, lastLoginAt: true },
  });
  const [tasks, book, flagsYesterday] = await Promise.all([
    prisma.staffTask.findMany({
      where: { ...released(now), clientId, isActive: true, cadence: { in: ON_TODAY } },
      select: { id: true, title: true, roles: true, cadence: true },
      orderBy: { sortOrder: "asc" },
    }),
    dutyBook(clientId, staff, today, today),
    prisma.staffTaskFlag.findMany({
      where: { resolvedAt: null, staff: { clientId }, createdAt: { gte: new Date(now.getTime() - 864e5) } },
      select: { staff: { select: { department: true } } },
    }),
  ]);

  const day = now.getUTCDay();
  const report: { name: string; via: string; text: string }[] = [];
  let skipped = 0;

  for (const s of staff) {
    const first = greetingName(s.name);
    try {
      if (!s.lastLoginAt) {
        if (day !== 1 && day !== 4) { skipped++; continue; }
        const text = smsInvite(first);
        const via = dryRun ? "DRY" : await deliver(s, text, "Your Arabella staff page is ready");
        report.push({ name: s.name, via, text });
        continue;
      }
      if (EXCUSED.includes(book.duty(s.id, today))) { skipped++; continue; }

      const items: string[] = [];

      // Tasks released, mine by job title, not yet ticked for this period.
      const mine = tasks.filter((t) => appliesTo(t.roles, [], s.position, s.department));
      if (mine.length) {
        const done = await prisma.staffTaskCompletion.findMany({
          where: { staffId: s.id, taskId: { in: mine.map((t) => t.id) } },
          select: { taskId: true, forDate: true },
        });
        for (const t of mine) {
          const period = periodKey(t.cadence as Cadence, now).getTime();
          if (!done.some((d) => d.taskId === t.id && d.forDate.getTime() === period)) items.push(t.title);
        }
      }

      // Daily numbers this person owns, once that area has started.
      for (const sec of ARABELLA_DAILY.sections) {
        if (ownersFor(sec, [s]).length === 0) continue;
        if (sectionStatus(ARABELLA_DAILY, sec, today, false, now) === "NOT_STARTED") continue;
        items.push(`${sec.title} numbers before close`);
      }

      // This week's training, open and not yet passed.
      const learn = await arabellaLearn(clientId, s.id, now);
      const toLearn = learn.thisWeek.filter((m) => m.status !== "PASSED");
      if (toLearn.length) items.push(toLearn.length === 1 ? `training: ${toLearn[0].title}` : `${toLearn.length} training modules`);

      // Supervisors and leadership hear about yesterday's misses in their area.
      const leader = s.tiers.includes("LEADERSHIP") || s.tiers.includes("BOARD");
      const supervisor = s.tiers.includes("SUPERVISOR");
      if (leader || supervisor) {
        const misses = flagsYesterday.filter((f) => leader || f.staff.department === s.department).length;
        if (misses) items.push(`${misses} task${misses === 1 ? "" : "s"} missed yesterday in your team`);
      }

      if (items.length === 0) { skipped++; continue; }
      const text = smsList(first, items);
      const via = dryRun ? "DRY" : await deliver(s, text, `${items.length} things for you today at Arabella`);
      report.push({ name: s.name, via, text });
    } catch (err) {
      console.error("[arabella-today]", s.name, err);
      report.push({ name: s.name, via: "FAILED", text: "" });
    }
  }

  console.log(`[arabella-today] sent=${report.length} skipped=${skipped} dryRun=${dryRun}`);
  return NextResponse.json({ ok: true, dryRun, sent: report.length, skipped, report: dryRun ? report : report.map((r) => ({ name: r.name, via: r.via })) });
}
