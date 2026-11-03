/**
 * Haven's four teams, who is in each, and a first draft of the board's
 * objectives for the quarter. Everything here is a starting point that
 * leadership changes on /HavenStaff/teams and the board on /HavenStaff/objectives.
 *
 *   - Teams are created if missing. A person is placed only if they have no
 *     team yet, so a manual move is never undone by a re-run.
 *   - A lead is set only where the team has none.
 *   - Board objectives are drafted only if the quarter has none. They land as
 *     DRAFT for the board to change, send up and agree. Team objectives are
 *     not seeded: each team proposes its own, which is the point.
 *
 *   npx tsx --env-file=.env scripts/seed-haven-teams.ts            dry run
 *   npx tsx --env-file=.env scripts/seed-haven-teams.ts --apply
 */
import { PrismaClient } from "@prisma/client";
import { TARIFF_FIXES } from "../lib/haven-tariff";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

type TeamDef = { key: string; name: string; purpose: string; sortOrder: number; departments: string[]; leadPosition?: RegExp };

// MECE by construction: every department maps to exactly one team.
const TEAMS: TeamDef[] = [
  { key: "nursing", name: "Nursing: wards and NICU", sortOrder: 1, departments: ["NURSING", "DOMESTIC"], leadPosition: /^senior registered nurse$/i,
    purpose: "Every child on the ward and in the NICU safe, seen and recorded, shift to shift." },
  { key: "medical", name: "Medical", sortOrder: 2, departments: ["MEDICAL"], leadPosition: /^head of clinical services$/i,
    purpose: "Clinical decisions, reviews and referrals, and the NICU growth drive with the neonatologist." },
  { key: "diagnostics", name: "Diagnostics and pharmacy", sortOrder: 3, departments: ["LAB", "PHARMACY"],
    purpose: "Results on time and medicines never out of stock." },
  { key: "front", name: "Front of house and revenue", sortOrder: 4, departments: ["ADMIN"], leadPosition: /^head of admin/i,
    purpose: "Every family welcomed, every service billed, every HMO claim paid." },
];

const QUARTER = (() => {
  const d = new Date(Date.now() + 3600 * 1000);
  return `${d.getUTCFullYear()}-Q${Math.floor(d.getUTCMonth() / 3) + 1}`;
})();

type KR = { kind: "RESULT" | "GUARD"; title: string; baseline?: string; target?: string };
const BOARD: { title: string; why: string; krs: KR[] }[] = [
  {
    title: "Make Haven the NICU that maternity units near GRA Ikeja refer to",
    why: "The growth plan is NICU-led, and the paediatric high season starts in November.",
    krs: [
      { kind: "RESULT", title: "NICU admissions a month", baseline: "to confirm", target: "to agree" },
      { kind: "RESULT", title: "Maternity units and obstetricians actively referring", baseline: "to confirm", target: "10" },
      { kind: "GUARD", title: "Every NICU safety report taken within two days", target: "100%" },
      { kind: "GUARD", title: "Neonatal resuscitation drill run on the unit every month", target: "3 of 3 months" },
    ],
  },
  {
    title: "Bill for every service we deliver, and get paid for it",
    why: "Most of the tariff is priced at zero and receivables are outstanding with two HMOs.",
    krs: [
      { kind: "RESULT", title: "Tariff lines priced at zero that now have a price", baseline: "80.9% at zero", target: "0% at zero" },
      { kind: "RESULT", title: "Services billed the same day they are delivered", baseline: "to measure", target: "95%" },
      { kind: "RESULT", title: "Leadway and NEM receivables recovered", baseline: "N4.2M outstanding", target: "to agree" },
      { kind: "GUARD", title: "Billing complaints from families a month do not rise", baseline: "to measure" },
    ],
  },
  {
    title: "Build a team that runs the plan without being chased",
    why: "The plan is delivered by twenty people, not by the documents.",
    krs: [
      { kind: "RESULT", title: "Staff using the staff page each week", target: "90%" },
      { kind: "RESULT", title: "Tasks done on working days", target: "85%" },
      { kind: "RESULT", title: "Core training passed by everyone", target: "100% by 31 December" },
      { kind: "GUARD", title: "Weekly pulse does not fall below its first-month level" },
    ],
  },
];

async function main() {
  const client = await prisma.client.findFirst({ where: { name: "Haven Paediatric Centre" }, select: { id: true } });
  if (!client) throw new Error("No Haven client");
  const staff = await prisma.staffMember.findMany({
    where: { clientId: client.id, isActive: true, kind: "EMPLOYEE" },
    select: { id: true, name: true, position: true, department: true, teamId: true },
  });

  for (const def of TEAMS) {
    const existing = await prisma.staffTeam.findUnique({ where: { clientId_key: { clientId: client.id, key: def.key } } });
    const members = staff.filter((s) => def.departments.includes(s.department));
    const lead = def.leadPosition ? members.find((m) => def.leadPosition!.test(m.position)) : undefined;
    console.log(`\n${def.name}${existing ? "" : " (new)"}: ${members.length} people${lead ? `, lead ${lead.name}` : ", no lead"}`);
    for (const m of members) console.log(`   ${m.teamId ? "keeps current team" : "placed"}  ${m.name} (${m.position})`);
    if (!APPLY) continue;
    const team = existing ?? (await prisma.staffTeam.create({ data: { clientId: client.id, key: def.key, name: def.name, purpose: def.purpose, sortOrder: def.sortOrder } }));
    await prisma.staffMember.updateMany({ where: { id: { in: members.filter((m) => !m.teamId).map((m) => m.id) } }, data: { teamId: team.id } });
    if (lead && !team.leadId) await prisma.staffTeam.update({ where: { id: team.id }, data: { leadId: lead.id } });
  }
  const unplaced = staff.filter((s) => !TEAMS.some((t) => t.departments.includes(s.department)));
  if (unplaced.length) console.log(`\nNot placed (no team for their department): ${unplaced.map((u) => `${u.name} (${u.department})`).join(", ")}`);

  const have = await prisma.objective.count({ where: { clientId: client.id, quarter: QUARTER, level: "BOARD" } });
  console.log(`\nBoard objectives for ${QUARTER}: ${have} already. ${have ? "Leaving them alone." : `Drafting ${BOARD.length}.`}`);
  if (APPLY && have === 0) {
    for (const [i, o] of BOARD.entries()) {
      await prisma.objective.create({
        data: {
          clientId: client.id, level: "BOARD", quarter: QUARTER, title: o.title, why: o.why, sortOrder: i,
          keyResults: { create: o.krs.map((k, j) => ({ ...k, sortOrder: j })) },
        },
      });
    }
  }
  // Tariff fixes: created if missing, never reopened by a re-run.
  const haveFixes = await prisma.tariffFix.findMany({ where: { clientId: client.id }, select: { code: true } });
  const newFixes = TARIFF_FIXES.filter((f) => !haveFixes.some((h) => h.code === f.code));
  console.log(`\nTariff fixes: ${haveFixes.length} already, ${newFixes.length} to add.`);
  if (APPLY) for (const f of newFixes) await prisma.tariffFix.create({ data: { clientId: client.id, ...f } });

  console.log(APPLY ? "\nApplied." : "\nDRY RUN. Re-run with --apply.");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
