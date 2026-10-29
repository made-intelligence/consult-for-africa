/**
 * The Haven daily push.
 *
 * Every weekday morning each registered seat gets its own short list: what that
 * seat owns this month, what is still outstanding, and what has already been
 * evidenced. Then one digest goes to CFA showing the same picture whole.
 *
 * A six-month plan with ten levers does not fail because people disagree with
 * it. It fails because by week three nobody can remember what they are on, and
 * the strategy becomes a PDF nobody opens. This is the thing that remembers.
 *
 * Deliberately per seat rather than a group broadcast: a list addressed to
 * everybody is a list nobody reads.
 *
 *   GET /api/cron/haven-daily?dry=1   authorised, sends nothing, returns the plan
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyInternal } from "@/lib/email";
import { HAVEN_ENGAGEMENT_ID, HAVEN_START, WORKSTREAMS, workstreamLabel } from "@/lib/haven-delivery";
import { PLAN, type PlanTask } from "@/lib/haven-plan";

export const maxDuration = 120;

const SURVEY = "haven-contact-register";
const DIGEST_TO = "debo.odulana@consultforafrica.com";
const PAGE = "https://www.consultforafrica.com/HavenProject";

const NAVY = "#0B3C5D";
const GOLD = "#D4AF37";
const MUTED = "#64748b";

/** Evidence sections in lib/haven-delivery.ts that speak to a given seat. */
const SEAT_SECTIONS: Record<string, string[]> = {
  finance: ["billing", "tariff", "receivables"],
  pharmacy: ["stock"],
  nicu: ["nicu"],
  hr: ["people"],
  culture: ["people"],
  board: ["people"],
};

function authorise(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  return req.headers.get("authorization") === `Bearer ${expected}`;
}

function dayIndex(now: Date): number {
  const start = new Date(`${HAVEN_START}T00:00:00.000Z`);
  return Math.floor((now.getTime() - start.getTime()) / 86_400_000);
}

/** Six 30-day windows. Before the start it is month one; after, it stays at six. */
function monthIndex(day: number): number {
  return Math.min(PLAN.length - 1, Math.max(0, Math.floor(day / 30)));
}

type Person = { name: string; email: string; seat: string };

/**
 * A line tied to what actually moved. Generic encouragement gets tuned out
 * inside a week by exactly the people the plan depends on, so this says
 * something true or it says nothing.
 */
function motivation(opts: { evidenced: number; total: number; daysLeftInMonth: number; theme: string; target: string }): string {
  const { evidenced, total, daysLeftInMonth, theme, target } = opts;
  if (total === 0) return `Nothing sits with you this month. The month's job is ${theme.toLowerCase()}, and the target is ${target}.`;
  if (evidenced === 0 && daysLeftInMonth > 20) return `Nothing up yet, which is normal this early. Pick the one above that unblocks the others and start there.`;
  if (evidenced === 0) return `Nothing has come up from your side yet and there are ${daysLeftInMonth} days left in the month. If something is stuck, say so rather than carrying it quietly.`;
  if (evidenced >= total) return `That is everything on your list evidenced. The month's target is ${target}, and your part of it is done.`;
  return `${evidenced} of ${total} evidenced, ${daysLeftInMonth} days left. The month's target is ${target}.`;
}

function taskRows(tasks: PlanTask[]): string {
  return tasks
    .map(
      (t) => `<tr><td style="padding:13px 0;border-bottom:1px solid #e9eef3">
<div style="color:${NAVY};font-weight:700;font-size:15px">${t.what}</div>
<div style="color:${MUTED};font-size:13.5px;line-height:1.55;margin-top:4px">Done means: ${t.done}</div>
</td></tr>`,
    )
    .join("");
}

function teamEmail(p: Person, tasks: PlanTask[], month: (typeof PLAN)[number], line: string, day: number): string {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;max-width:580px;color:#1F2937">
<div style="background:linear-gradient(160deg,#0d456a,#081726);border-bottom:3px solid ${GOLD};padding:22px 24px;border-radius:10px 10px 0 0">
  <div style="font-size:10.5px;letter-spacing:.22em;font-weight:800;color:#eaf1f6">CONSULT FOR <span style="color:${GOLD}">AFRICA</span></div>
  <div style="color:#fff;font-size:19px;margin-top:10px;font-family:Georgia,serif">${month.title.replace(/Month (\d+).*/, "Month $1")}, day ${day + 1} of 180</div>
  <div style="color:#c3d3de;font-size:13.5px;margin-top:4px">${month.theme}</div>
</div>
<div style="border:1px solid #e4e9ef;border-top:0;border-radius:0 0 10px 10px;padding:22px 24px;background:#fff">
  <p style="font-size:15px;line-height:1.6;margin:0 0 4px">Good morning ${p.name.split(" ")[0]},</p>
  <p style="font-size:14.5px;line-height:1.6;color:${MUTED};margin:0 0 16px">This is what sits with ${workstreamLabel(p.seat).toLowerCase()} this month.</p>
  <table width="100%" cellpadding="0" cellspacing="0">${taskRows(tasks)}</table>
  <p style="font-size:14.5px;line-height:1.65;margin:18px 0 0;color:#334155">${line}</p>
  <p style="margin:20px 0 0"><a href="${PAGE}" style="background:${NAVY};color:#fff;text-decoration:none;border-radius:8px;padding:12px 20px;font-size:14.5px;font-weight:700;display:inline-block">Put up what is done</a></p>
  <p style="font-size:12.5px;color:#94a3b8;margin:18px 0 0;line-height:1.6">If something here is not yours, reply and tell us whose it is. A list nobody owns is how a plan quietly stops.</p>
</div></div>`;
}

async function run(req: NextRequest): Promise<Response> {
  if (!authorise(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const dry = new URL(req.url).searchParams.get("dry") === "1";
  const now = new Date();
  // Hospitals run on Sunday; this plan does not.
  if (now.getUTCDay() === 0 && !dry) return Response.json({ ok: true, skipped: "Sunday" });

  // Before the start date dayIndex is negative; the plan still reads as day one.
  const day = Math.max(0, dayIndex(now));
  const mi = monthIndex(day);
  const month = PLAN[mi];
  const daysLeftInMonth = Math.max(0, (mi + 1) * 30 - day);

  const rows = await prisma.auditSurveyResponse.findMany({
    where: { survey: SURVEY, engagementId: HAVEN_ENGAGEMENT_ID },
    select: { payload: true },
  });
  const people: Person[] = rows
    .map((r) => r.payload as Record<string, unknown>)
    .map((p) => ({ name: String(p?.name ?? ""), email: String(p?.email ?? ""), seat: String(p?.workstream ?? "") }))
    .filter((p) => p.name && p.email && p.seat);

  const uploads = await prisma.auditUpload.findMany({
    where: { engagement: "haven" },
    select: { section: true, createdAt: true },
  });
  const uploadedSections = new Set(uploads.map((u) => u.section));

  const sent: { to: string; seat: string; tasks: number }[] = [];
  const failed: { to: string; error: string }[] = [];

  for (const p of people) {
    const tasks = month.tasks.filter((t) => t.seat === p.seat);
    // 'cfa' items are ours. Nobody at Haven should get a list of our homework.
    if (p.seat === "cfa") continue;
    const sections = SEAT_SECTIONS[p.seat] ?? [];
    const evidenced = sections.filter((s) => uploadedSections.has(s)).length;
    const line = motivation({
      evidenced,
      total: tasks.length,
      daysLeftInMonth,
      theme: month.theme,
      target: month.target,
    });
    if (dry) {
      sent.push({ to: p.email, seat: p.seat, tasks: tasks.length });
      continue;
    }
    try {
      await notifyInternal(
        p.email,
        `Haven, ${month.title.replace(/ .*/, "")} ${mi + 1}: what sits with ${workstreamLabel(p.seat).toLowerCase()}`,
        teamEmail(p, tasks, month, line, day),
      );
      sent.push({ to: p.email, seat: p.seat, tasks: tasks.length });
    } catch (e) {
      failed.push({ to: p.email, error: e instanceof Error ? e.message : "unknown" });
    }
  }

  // The digest. Seats with nobody in them are the finding, not the people who replied.
  const covered = new Set(people.map((p) => p.seat));
  const empty = WORKSTREAMS.filter(
    (w) => !["other", "cfa"].includes(w.key) && !covered.has(w.key) && month.tasks.some((t) => t.seat === w.key),
  ).map((w) => w.role);
  const uploadsToday = uploads.filter((u) => Date.now() - u.createdAt.getTime() < 86_400_000).length;

  const digest = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#1F2937;max-width:580px">
<p><b>Haven, day ${day + 1} of 180.</b> ${month.title}: ${month.theme}. Target ${month.target}.</p>
<p>Pushed to <b>${sent.length}</b> ${sent.length === 1 ? "person" : "people"} across ${new Set(sent.map((s) => s.seat)).size} seats. ${uploadsToday} upload${uploadsToday === 1 ? "" : "s"} in the last day, ${uploads.length} in total.</p>
${empty.length ? `<p style="color:#B91C1C"><b>Seats with work this month and nobody in them:</b> ${empty.join(", ")}.</p>` : `<p style="color:#15803D">Every seat with work this month has somebody in it.</p>`}
${failed.length ? `<p style="color:#B91C1C"><b>Failed to send:</b> ${failed.map((f) => `${f.to} (${f.error})`).join(", ")}</p>` : ""}
<p><a href="${PAGE}" style="color:${NAVY}">The project page</a></p>
</div>`;

  if (!dry) {
    try {
      await notifyInternal(DIGEST_TO, `Haven day ${day + 1}: ${sent.length} pushed, ${empty.length} seats empty`, digest);
    } catch {
      // the digest failing must not fail the push that already went out
    }
  }

  return Response.json({
    ok: true,
    dry,
    day: day + 1,
    month: month.title,
    registered: people.length,
    sent: sent.length,
    seatsEmpty: empty,
    failed,
    ...(dry ? { preview: sent } : {}),
  });
}

export const GET = run;
export const POST = run;
