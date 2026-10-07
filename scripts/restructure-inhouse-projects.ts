/**
 * Resets the three Consult For Africa in-house engagements.
 *
 * They had drifted into a state the dashboard could only report as failure:
 * CadreHealth carried every milestone twice and its growth strategy three
 * times, Consult For Africa Setup had five milestones all called "30 Day
 * Sprint", no deliverable anywhere was attached to a milestone or carried a
 * due date, and all three windows closed at the end of September while the
 * work carried on. Twenty-eight of the portfolio's twenty-nine overdue
 * milestones sat in these three records.
 *
 * What this script does is structural only. It removes duplicates, attaches
 * each deliverable to the milestone it belongs to, gives every deliverable a
 * due date, renumbers the sequence and moves the unmet milestones into a live
 * window. It does not decide what has been achieved. Every milestone stays
 * PENDING, because the engagement manager is the only person who can say which
 * of these are done and which are dead, and a script that guessed would be
 * worse than the mess it replaced.
 *
 *   npx tsx --env-file=.env.local scripts/restructure-inhouse-projects.ts
 *   npx tsx --env-file=.env.local scripts/restructure-inhouse-projects.ts --apply
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

/** The live window the reset moves unmet work into. */
const WINDOW_START = new Date("2026-10-06T00:00:00Z");
const WINDOW_END = new Date("2026-12-15T00:00:00Z");

/** Deliverable name to milestone name, per engagement. */
const MAPPING: Record<string, Record<string, string>> = {
  "Maarova Go-to-Market and Growth": {
    "Maarova Sales Pitch Deck": "Sales collateral finalized (pitch deck, pricing sheet, case study)",
    "Pricing and Packaging Sheet": "Sales collateral finalized (pitch deck, pricing sheet, case study)",
    "Hospital Prospect List (30 targets)": "Prospect list of 30 hospitals with decision-maker contacts",
    "Discovery Call Script and Qualification Framework": "First 10 discovery calls booked",
    "Assessment Demo Environment": "First paying assessment client signed",
    "Case Study: First Assessment Client": "First paying assessment client signed",
    "Coaching Programme Curriculum (12-week pilot)": "Coaching programme pilot launched (1 hospital)",
    "Executive Retreat Package": "Coaching programme pilot launched (1 hospital)",
    "Partner Firm Portal MVP Brief": "Partner firm portal demo with Verrakki",
    "Monthly Sales Pipeline Report": "3 paying clients, 2 coaching programmes sold",
  },
  "CadreHealth Go-to-Market and Growth": {
    "Hospital Reviews Content Seed (30+ reviews)": "Seed 50 authentic hospital reviews",
    "Twitter/X Content Calendar (12 weeks)": "CadreHealth Twitter account launch + daily posting",
    "LinkedIn Content Calendar (12 weeks)": "CadreHealth Twitter account launch + daily posting",
    "WhatsApp Group Distribution Plan": "WhatsApp Business API setup and first batch",
    "Blog: What Healthcare Workers Think About Nigerian Hospitals": "First CadreHealth data report published",
    "Blog: Best and Worst Hospitals to Work at in Lagos": "100 reviews across 50 hospitals",
    "First CadreHealth Data Report": "First CadreHealth data report published",
    "Email Engagement Sequence (5-email series)": "500 registered professionals",
    "Partnership Pitch Deck for NMA/NARD": "NMA state chapter partnership (first 3)",
    // Growth Strategy Document is deliberately absent: it underpins the whole
    // engagement rather than any one milestone.
  },
  // Consult For Africa Setup is deliberately absent. Its five milestones share
  // one name and four dates, so there is no honest way to distribute twenty
  // deliverables across them. It needs a re-scope, not a mapping.
};

const log: string[] = [];
const say = (s: string) => { log.push(s); console.log(s); };

async function main() {
  const engagements = await prisma.engagement.findMany({
    where: { client: { name: "Consult For Africa" } },
    include: { milestones: true, deliverables: true, engagementManager: { select: { name: true } } },
  });

  for (const e of engagements) {
    say(`\n=== ${e.name}`);

    // ── Duplicate milestones ────────────────────────────────────────────────
    const mSeen = new Map<string, string>();
    const mDupes: string[] = [];
    for (const m of [...e.milestones].sort((a, b) => a.id.localeCompare(b.id))) {
      const key = `${m.name.trim().toLowerCase()}|${m.dueDate.toISOString()}`;
      const keeper = mSeen.get(key);
      if (keeper) {
        mDupes.push(m.id);
        if (APPLY) {
          await prisma.deliverable.updateMany({ where: { milestoneId: m.id }, data: { milestoneId: keeper } });
          await prisma.milestone.delete({ where: { id: m.id } });
        }
      } else {
        mSeen.set(key, m.id);
      }
    }
    say(`  duplicate milestones removed: ${mDupes.length}`);

    // ── Duplicate deliverables ──────────────────────────────────────────────
    const dSeen = new Map<string, string>();
    const dDupes: string[] = [];
    for (const d of [...e.deliverables].sort((a, b) => a.id.localeCompare(b.id))) {
      const dKey = d.name.trim().toLowerCase();
      if (dSeen.has(dKey)) {
        dDupes.push(d.id);
        if (APPLY) await prisma.deliverable.delete({ where: { id: d.id } });
      } else {
        dSeen.set(dKey, d.id);
      }
    }
    say(`  duplicate deliverables removed: ${dDupes.length}`);

    // ── Re-date and renumber the unmet milestones ───────────────────────────
    const live = e.milestones
      .filter((m) => !mDupes.includes(m.id) && m.status !== "COMPLETED" && m.status !== "SKIPPED")
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime() || a.order - b.order);

    const span = WINDOW_END.getTime() - WINDOW_START.getTime();
    const newDates = new Map<string, Date>();
    live.forEach((m, i) => {
      const at = new Date(WINDOW_START.getTime() + (span * (i + 1)) / live.length);
      newDates.set(m.id, at);
    });
    if (APPLY) {
      for (const [id, at] of newDates) {
        await prisma.milestone.update({ where: { id }, data: { dueDate: at, order: live.findIndex((m) => m.id === id) + 1 } });
      }
    }
    say(`  milestones re-dated into ${WINDOW_START.toISOString().slice(0, 10)}..${WINDOW_END.toISOString().slice(0, 10)}: ${live.length}`);

    // ── Attach deliverables to milestones, and date them ────────────────────
    const map = MAPPING[e.name] ?? {};
    const byName = new Map(live.map((m) => [m.name, m.id]));
    let attached = 0;
    let orphaned = 0;
    for (const d of e.deliverables) {
      if (dDupes.includes(d.id)) continue;
      const milestoneName = map[d.name];
      const milestoneId = milestoneName ? byName.get(milestoneName) : undefined;
      const dueDate = milestoneId ? newDates.get(milestoneId) ?? WINDOW_END : WINDOW_END;
      if (milestoneId) attached++; else orphaned++;
      if (APPLY) {
        await prisma.deliverable.update({ where: { id: d.id }, data: { milestoneId: milestoneId ?? null, dueDate } });
      }
    }
    say(`  deliverables attached to a milestone: ${attached}, left unattached: ${orphaned}`);

    // ── The engagement window itself ────────────────────────────────────────
    if (APPLY) {
      await prisma.engagement.update({
        where: { id: e.id },
        data: { endDate: WINDOW_END, status: "ACTIVE" },
      });
    }
    say(`  window moved to ${WINDOW_END.toISOString().slice(0, 10)}, status ACTIVE (was ${e.status})`);
  }

  say(APPLY ? "\nAPPLIED" : "\nDRY RUN, nothing written. Re-run with --apply");
}

main().finally(() => prisma.$disconnect());
