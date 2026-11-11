/**
 * Put the Aman HMO signing sprint on the signing desk (/sprints/aman).
 *
 * Creates the sprint (150 signed before it, 150 to add, closing Monday 30
 * November), the team (Matthew leads, Gidado runs the day and calls Mainland
 * west, Ruth calls Island and Lekki, Favour calls Mainland north), and one
 * target per provider on the warm list Favour confirmed on 11 Nov 2026: 366
 * from Aman's list less the 8 already signed. Each target is the CFA directory
 * hospital, found by the same name + LGA key the directory import used.
 *
 * The assignments come from scripts/load-aman-providers.py:
 *   python3 scripts/load-aman-providers.py ~/Downloads/400_providers_with_contact_and_email.xlsx <assignments.json>
 *
 * Idempotent: the sprint and members are upserted, a target already on the
 * sprint keeps its owner, stage and history.
 *
 *   npx tsx --env-file=.env.local scripts/seed-aman-sprint.ts <assignments.json>          # dry run
 *   npx tsx --env-file=.env.local scripts/seed-aman-sprint.ts <assignments.json> --apply  # write
 */

import { readFileSync } from "node:fs";
import { prisma } from "@/lib/prisma";
import { importKey } from "@/lib/hospital-sales";

const APPLY = process.argv.includes("--apply");
const FILE = process.argv.slice(2).find((a) => !a.startsWith("--"));

const AMAN_ENGAGEMENT = "cmtqblmd00005vbhvb5r3i75a";
const TEAM = [
  { name: "Matthew", id: "cmmrqc6uf0001e2u69j8ejht6", email: "matthew.aloba@consultforafrica.com", role: "LEAD", area: "Groups and chains" },
  { name: "Gidado", id: "cmmuyd8nz000a5av986ac7my3", email: "gidadosulaiman2@gmail.com", role: "RUNNER", area: "Mainland west" },
  { name: "Ruth", id: "cmvtv7zyp0000q49re8gtrxfo", email: "ruthpelumi04@gmail.com", role: "CALLER", area: "Island and Lekki" },
  { name: "Favour", id: "cmvtv7u0w0000grgh0n7ov1dc", email: "soromidayo101@gmail.com", role: "CALLER", area: "Mainland north" },
] as const;

const SPRINT = {
  slug: "aman",
  name: "Aman HMO signing sprint",
  kind: "CLIENT_SIGNING",
  clientName: "Aman HMO",
  engagementId: AMAN_ENGAGEMENT,
  goal: 150,
  baseline: 150,
  startsAt: new Date("2026-11-02T00:00:00+01:00"),
  endsAt: new Date("2026-11-30T17:00:00+01:00"),
  weeklyTargets: [
    { from: "2026-11-02", label: "Wk 1", target: 20 },
    { from: "2026-11-09", label: "Wk 2", target: 40 },
    { from: "2026-11-16", label: "Wk 3", target: 40 },
    { from: "2026-11-23", label: "Wk 4", target: 40 },
    { from: "2026-11-30", label: "Close-out", target: 10 },
  ],
};

/** Hospitals and clinics first, as the brief says. */
const PRIORITY: Record<string, number> = { Hospital: 30, Clinic: 25, "Specialist clinic": 20, Dental: 15, Optical: 12, "Diagnostic centre": 10, Laboratory: 8, Pharmacy: 5, Other: 0 };

type Row = { no: number; raw_name: string; raw_lga: string | null; type: string; cluster: string; owner: string; notes: string };

async function main() {
  if (!FILE) throw new Error("Pass the assignments JSON from load-aman-providers.py");
  const rows = JSON.parse(readFileSync(FILE, "utf8")) as Row[];

  const users = await prisma.user.findMany({ where: { id: { in: TEAM.map((t) => t.id) } }, select: { id: true, email: true } });
  for (const t of TEAM) if (users.find((u) => u.id === t.id)?.email !== t.email) throw new Error(`${t.name}: user ${t.id} is not ${t.email}`);
  const owner = Object.fromEntries(TEAM.map((t) => [t.name, t.id]));

  const keys = rows.map((r) => importKey(r.raw_name.replace(/\s+/g, " "), r.raw_lga));
  const hospitals = await prisma.hospital.findMany({ where: { importKey: { in: keys } }, select: { id: true, importKey: true } });
  const byKey = new Map(hospitals.map((h) => [h.importKey!, h.id]));
  const missing = rows.filter((_, i) => !byKey.has(keys[i]));
  if (missing.length) throw new Error(`${missing.length} providers are not in the directory, e.g. ${missing.slice(0, 3).map((m) => m.raw_name).join(", ")}. Run the directory import first.`);
  const unowned = rows.filter((r) => !owner[r.owner]);
  if (unowned.length) throw new Error(`Unknown owner ${unowned[0].owner}`);

  // Before the migration has run the table does not exist; a dry run still checks the directory.
  const sprint = await prisma.outreachSprint.findUnique({ where: { slug: SPRINT.slug } }).catch((e) => {
    if (!APPLY && String(e).includes("does not exist")) return null;
    throw e;
  });
  const already = sprint ? new Set((await prisma.sprintTarget.findMany({ where: { sprintId: sprint.id }, select: { hospitalId: true } })).map((t) => t.hospitalId)) : new Set<string>();
  const fresh = rows.map((r, i) => ({ r, hospitalId: byKey.get(keys[i])! })).filter((x) => !already.has(x.hospitalId));

  const per = Object.fromEntries(TEAM.map((t) => [t.name, fresh.filter((x) => x.r.owner === t.name).length]));
  console.log({ sprint: sprint ? "exists" : "create", providers: rows.length, alreadyOnSprint: already.size, toAdd: fresh.length, per });
  if (!APPLY) return console.log("DRY RUN. Pass --apply to write.");

  const s = await prisma.outreachSprint.upsert({ where: { slug: SPRINT.slug }, create: SPRINT, update: { name: SPRINT.name, goal: SPRINT.goal, baseline: SPRINT.baseline, endsAt: SPRINT.endsAt, weeklyTargets: SPRINT.weeklyTargets } });
  for (const t of TEAM) {
    await prisma.sprintMember.upsert({ where: { sprintId_userId: { sprintId: s.id, userId: t.id } }, create: { sprintId: s.id, userId: t.id, role: t.role, area: t.area }, update: { role: t.role, area: t.area } });
  }
  const res = await prisma.sprintTarget.createMany({
    data: fresh.map(({ r, hospitalId }) => ({
      sprintId: s.id,
      hospitalId,
      ownerId: owner[r.owner],
      area: r.cluster || null,
      source: "Aman provider list",
      notes: r.notes,
      priority: PRIORITY[r.type] ?? 0,
    })),
    skipDuplicates: true,
  });
  console.log(`APPLIED: sprint ${s.slug}, ${TEAM.length} members, ${res.count} targets added`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
