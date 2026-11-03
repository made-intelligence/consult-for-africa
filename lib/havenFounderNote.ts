import { prisma } from "@/lib/prisma";
import { PLAN } from "@/lib/haven-plan";
import { HAVEN_START } from "@/lib/haven-delivery";
import { composeUpdate, havenFounders } from "@/lib/havenFounderUpdate";
import { ONBOARDED, staffWhere } from "@/lib/havenAudience";
import { dutyBook, dayKey, deptLabel } from "@/lib/havenDuty";

/**
 * The two WhatsApp notes a week for the Haven founders' group.
 *
 * Monday: what CFA will work on this week. The founders asked for exactly
 * that ("they want to know what we will work on"), so it leads with our items
 * from the plan, not with the hospital's.
 * Friday: what got done, from the platform's own record.
 *
 * WhatsApp formatting: *bold*, short lines, numbered items. No links to
 * internal pages, because the group is not signed in to anything.
 */

const DAY = 864e5;

function planPosition(now: Date) {
  const day = Math.max(0, Math.floor((dayKey(now).getTime() - new Date(`${HAVEN_START}T00:00:00Z`).getTime()) / DAY));
  const mi = Math.min(PLAN.length - 1, Math.floor(day / 30));
  return { day, mi, daysLeft: (mi + 1) * 30 - day };
}

const ours = (owner: string) => /c4a|cfa/i.test(owner);

// Never in a note to the founders' group: anything about the senior
// operations seat. See feedback rule "Benedict never at risk".
const SAY_IN_GROUP = (what: string) => !/operations leader|head of operations|ops leader/i.test(what);

const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Africa/Lagos" });

/** Live facts the plan cannot know: rotas missing, modules awaiting approval. */
async function liveAsks(clientId: string, now: Date) {
  const people = await prisma.staffMember.findMany({ where: staffWhere(clientId, ONBOARDED), select: { id: true, department: true } });
  const book = await dutyBook(clientId, people, now, now);
  const missing = book.missingRota(now);
  const awaiting = await prisma.protocol.count({ where: { clientId, isActive: true, approvedAt: null } });
  return { missing, awaiting };
}

export async function mondayNote(now = new Date()): Promise<string> {
  const { clientId } = await havenFounders();
  const { day, mi, daysLeft } = planPosition(now);
  const month = PLAN[mi];
  const sunday = new Date(now.getTime() + 6 * DAY);

  const items = month.tasks.filter((t) => ours(t.owner) && SAY_IN_GROUP(t.what)).map((t) => t.what);
  const nextMonth = daysLeft <= 7 && mi + 1 < PLAN.length ? PLAN[mi + 1] : null;
  const starting = nextMonth ? nextMonth.tasks.filter((t) => ours(t.owner) && SAY_IN_GROUP(t.what)).map((t) => t.what) : [];

  const { missing, awaiting } = await liveAsks(clientId, now);

  const lines: string[] = [
    `*Haven: what we are working on this week (${fmt(now)} to ${fmt(sunday)})*`,
    `Day ${day + 1} of 180. ${month.title.replace(/ - .*/, "")}: ${month.theme.charAt(0).toLowerCase() + month.theme.slice(1)}.`,
    "",
    "*Our work this week*",
    ...items.slice(0, 6).map((t, i) => `${i + 1}. ${t}`),
  ];
  if (starting.length) {
    lines.push("", `*Starting for ${nextMonth!.title.replace(/ - .*/, "")}*`, ...starting.slice(0, 4).map((t, i) => `${i + 1}. ${t}`));
  }
  const asks: string[] = [];
  if (awaiting > 0) asks.push(`Dr Odedina: ${awaiting} training modules are ready for clinical approval on the staff page.`);
  if (missing.length > 0) asks.push(`Rotas for ${missing.map(deptLabel).join(", ")} are not in yet. Until they are, staff there are chased on days off.`);
  if (asks.length) lines.push("", "*From you*", ...asks.map((a) => `- ${a}`));
  lines.push("", "On Friday you get what got done.");
  return lines.join("\n");
}

export async function fridayNote(now = new Date()): Promise<string> {
  const { clientId } = await havenFounders();
  const weekAgo = new Date(now.getTime() - 7 * DAY);
  const u = await composeUpdate(now);
  const [passed, rotasIn] = await Promise.all([
    prisma.protocolProgress.count({ where: { passed: true, testedAt: { gte: weekAgo }, protocol: { clientId } } }),
    prisma.staffRota.count({ where: { clientId, updatedAt: { gte: weekAgo } } }),
  ]);
  const { missing, awaiting } = await liveAsks(clientId, now);

  const lines: string[] = [
    `*Haven: what got done this week (to ${fmt(now)})*`,
    "",
    ...u.auto.map((a) => `- ${a}`),
    `- Training: ${passed} module ${passed === 1 ? "pass" : "passes"} this week. ${awaiting} modules awaiting clinical approval.`,
    `- Rotas: ${rotasIn} saved this week.${missing.length ? ` Still missing: ${missing.map(deptLabel).join(", ")}.` : " Every department is in."}`,
  ];
  if (u.asks.length) lines.push("", "*From you*", ...u.asks.map((a) => `- ${a}`));
  lines.push("", "On Monday you get next week's plan.");
  return lines.join("\n");
}
