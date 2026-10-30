import { prisma } from "@/lib/prisma";
import { greetingName } from "@/lib/staffAuth";
import { isoWeek, previousWeek, MEASURE_BY_KEY } from "@/lib/havenScoreboard";
import { lateness, HAVEN_CLIENT_NAME } from "@/lib/havenSafety";
import { COUNTED, staffWhere } from "@/lib/havenAudience";

/**
 * The weekly founders' update: simple bullets, every Friday.
 *
 * The founders said they were not being carried along. The fortnightly
 * snapshot was a document; this is five short sections they can read on a
 * phone, built from what the platform already records so it costs nobody an
 * afternoon, plus whatever Debo or Dr Tanwa add by hand.
 *
 * What it never carries: what a report said or who filed it (the board sees
 * that reports are handled, not their content), anyone's role, and CFA's
 * fees. Counts and the hospital's own weekly numbers only.
 */

export interface UpdateSections {
  week: string;
  /** e.g. "Week to 30 October" */
  label: string;
  auto: string[];
  asks: string[];
}

export interface Founder {
  name: string;
  email: string;
  salutation: string;
}

/** Where the staff app's greeting is not how Debo addresses them. */
const SALUTATION_BY_EMAIL: Record<string, string> = {
  "gbajoodedina@gmail.com": "Dr Odedina",
};

export async function havenFounders(): Promise<{ clientId: string; founders: Founder[] }> {
  const client = await prisma.client.findFirst({ where: { name: HAVEN_CLIENT_NAME }, select: { id: true } });
  if (!client) throw new Error("No Haven client");
  const rows = await prisma.staffMember.findMany({
    where: { clientId: client.id, isActive: true, tiers: { has: "BOARD" }, NOT: { email: null } },
    select: { name: true, email: true },
    orderBy: { name: "asc" },
  });
  return {
    clientId: client.id,
    founders: rows.map((r) => ({
      name: r.name,
      email: r.email!,
      salutation: SALUTATION_BY_EMAIL[r.email!.toLowerCase()] ?? greetingName(r.name),
    })),
  };
}

const DAY = 864e5;
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export async function composeUpdate(now = new Date()): Promise<UpdateSections> {
  const { clientId } = await havenFounders();
  const weekAgo = new Date(now.getTime() - 7 * DAY);
  const twoWeeksAgo = new Date(now.getTime() - 14 * DAY);

  const staffIds = (await prisma.staffMember.findMany({
    where: staffWhere(clientId, COUNTED),
    select: { id: true, lastLoginAt: true },
  }));
  const ids = staffIds.map((s) => s.id);

  const [doneThis, doneLast, reportsNew, reports, approved, protocols] = await Promise.all([
    prisma.staffTaskCompletion.findMany({ where: { staffId: { in: ids }, completedAt: { gte: weekAgo } }, select: { staffId: true } }),
    prisma.staffTaskCompletion.count({ where: { staffId: { in: ids }, completedAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
    prisma.safetyReport.findMany({ where: { clientId, reportedAt: { gte: weekAgo } }, select: { kind: true } }),
    prisma.safetyReport.findMany({ where: { clientId }, select: { status: true, reportedAt: true, takenAt: true, actionDueAt: true, closedAt: true } }),
    prisma.protocol.count({ where: { clientId, isActive: true, NOT: { approvedAt: null } } }),
    prisma.protocol.count({ where: { clientId, isActive: true } }),
  ]);

  const activeWeek = staffIds.filter((s) => s.lastLoginAt && s.lastLoginAt >= weekAgo).length;
  const signedIn = staffIds.filter((s) => s.lastLoginAt).length;
  const people = new Set(doneThis.map((d) => d.staffId)).size;

  const open = reports.filter((r) => r.status !== "CLOSED");
  const late = open.filter((r) => lateness(r, now.getTime())).length;
  const closedThisWeek = reports.filter((r) => r.closedAt && r.closedAt >= weekAgo).length;
  const nearMisses = reportsNew.filter((r) => r.kind === "NEAR_MISS").length;

  const auto: string[] = [
    `Staff using the staff page: ${activeWeek} of ${staffIds.length} this week (${signedIn} have signed in at least once).`,
    `Daily and weekly tasks completed: ${doneThis.length} this week by ${plural(people, "person", "people")}, against ${doneLast} the week before.`,
    `Speaking up: ${plural(reportsNew.length, "new report")} this week (${plural(nearMisses, "near miss", "near misses")}). ` +
      `${open.length} open, ${closedThisWeek} closed this week${late > 0 ? `, ${late} overdue` : ""}.`,
    `Clinical standards approved: ${approved} of ${protocols}.`,
  ];

  // The hospital's own weekly numbers, this week if entered, else last week's.
  const week = isoWeek(now);
  const scores = await prisma.scoreboardEntry.findMany({
    where: { clientId, period: { in: [week, previousWeek(week)] } },
    select: { measure: true, value: true, period: true },
  });
  const latest = new Map<string, string>();
  for (const s of scores.sort((a, b) => a.period.localeCompare(b.period))) latest.set(s.measure, s.value);
  if (latest.size > 0) {
    const bits = [...latest].map(([k, v]) => `${MEASURE_BY_KEY[k]?.label ?? k}: ${v}`);
    auto.push(`This week's numbers: ${bits.join("; ")}.`);
  } else {
    auto.push("This week's numbers have not been entered yet.");
  }

  const asks: string[] = [];
  if (protocols > 0 && approved < protocols) {
    asks.push(`Dr Odedina and Dr Shakirah: ${protocols - approved} clinical standards are waiting for approval. Staff cannot study or be tested on a standard until it is approved.`);
  }

  const label = `Week to ${now.toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "Africa/Lagos" })}`;
  return { week, label, auto, asks };
}

export function subjectFor(label: string) {
  return `Haven weekly update: ${label.replace(/^Week to /, "week to ")}`;
}

const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]!);

export interface ExtraLines {
  done: string[];
  next: string[];
  asks: string[];
}

/** The email, as text and HTML. Five short sections, bullets only. */
export function renderUpdate(salutation: string, u: UpdateSections, extra: ExtraLines) {
  const sections: [string, string[]][] = [
    ["Where things stand", u.auto],
    ["Done this week", extra.done],
    ["Needs a decision from you", [...extra.asks, ...u.asks]],
    ["Next week", extra.next],
  ];
  const shown = sections.filter(([, items]) => items.length > 0);

  const text = [
    `Dear ${salutation},`,
    "",
    `Haven, ${u.label.replace(/^Week/, "week")}.`,
    ...shown.flatMap(([h, items]) => ["", h, ...items.map((i) => `- ${i}`)]),
    "",
    "Reply to this email with any question and I will pick it up.",
    "",
    "Debo",
    "Dr Debo Odulana, Founding Partner, Consult for Africa",
  ].join("\n");

  const html = `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1F2937;max-width:620px">
<p>Dear ${esc(salutation)},</p>
<p>Haven, ${esc(u.label.replace(/^Week/, "week"))}.</p>
${shown.map(([h, items]) => `<p style="margin:18px 0 6px;color:#0B3C5D;font-weight:700">${esc(h)}</p>
<ul style="margin:0;padding-left:20px">${items.map((i) => `<li style="margin:4px 0">${esc(i)}</li>`).join("")}</ul>`).join("\n")}
<p style="margin-top:22px">Reply to this email with any question and I will pick it up.</p>
<p>Debo<br><span style="color:#64748b">Dr Debo Odulana, Founding Partner, Consult for Africa</span></p>
</div>`;
  return { text, html };
}
