/**
 * Load Arabella's team and the plan's trickle of tasks.
 *
 * Staff come from the practice's own staff list (October 2026). It carries
 * names and roles but no phone numbers or emails, so everyone except Dr Chito
 * and Tolu is loaded without contact details. Leadership adds those on
 * /ArabellaStaff/people, and a person can sign in once they have one. Nobody
 * without a contact is emailed or chased.
 *
 * Left out on purpose: the visiting consultants (sessional, not on the
 * practice's daily system), the cafe (a separate company), the wellness
 * partner and the podcast agency.
 *
 * Tiers are the floor of what each role needs, never seniority:
 *   Dr Chito: LEADERSHIP + BOARD, approves clinical content.
 *   Head of Operations: LEADERSHIP (closes the day's money).
 *   Head of Nursing, Acting Head of Clinicals: SUPERVISOR.
 *   Everyone else: ALL_STAFF. No money, no decisions, no named team grid.
 *
 * Tasks: lib/arabella-plan.ts, each with startsOn = its week's Monday.
 *
 * Idempotent. Never deactivates or deletes anybody. Never overwrites a contact
 * detail leadership has already entered.
 *
 *   npx tsx --env-file=.env.local --env-file=.env scripts/seed-arabella-staff.ts
 *   npx tsx --env-file=.env.local --env-file=.env scripts/seed-arabella-staff.ts --apply
 */
import { PrismaClient, type StaffTier } from "@prisma/client";
import { ARABELLA } from "../lib/staffSites";
import { ARABELLA_PLAN, weekStart } from "../lib/arabella-plan";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

interface Row {
  name: string;
  position: string;
  department: string;
  tiers: StaffTier[];
  email?: string;
  phone?: string;
  canApproveClinical?: boolean;
}

const ROSTER: Row[] = [
  { name: "Dr Chito Nwana", position: "Principal and Medical Director", department: "Leadership", tiers: ["LEADERSHIP", "BOARD"], email: "fumenyi@hotmail.com", phone: "+2348078100310", canApproveClinical: true },
  { name: "Tolu Williams", position: "Head of Operations", department: "Operations", tiers: ["LEADERSHIP"], email: "tmc@arabellawomenshealth.com" },
  { name: "Matron Oni", position: "Head of Nursing", department: "Nursing", tiers: ["SUPERVISOR"] },
  { name: "Dr Abdu Daniel", position: "General Practitioner, Acting Head of Clinicals", department: "Clinical", tiers: ["SUPERVISOR"] },
  { name: "Dr Joy Adejubu", position: "General Practitioner", department: "Clinical", tiers: ["ALL_STAFF"] },
  { name: "Nurse Confort", position: "Nurse", department: "Nursing", tiers: ["ALL_STAFF"] },
  { name: "Nurse Marho", position: "Nurse", department: "Nursing", tiers: ["ALL_STAFF"] },
  { name: "Nurse Patricia", position: "Locum Nurse", department: "Nursing", tiers: ["ALL_STAFF"] },
  { name: "Nurse Aisha", position: "Locum Nurse", department: "Nursing", tiers: ["ALL_STAFF"] },
  { name: "Nurse Divine", position: "Locum Nurse", department: "Nursing", tiers: ["ALL_STAFF"] },
  { name: "Ms Emelda", position: "Laboratory Scientist", department: "Laboratory", tiers: ["ALL_STAFF"] },
  { name: "Ms Jessica", position: "Admin", department: "Front desk", tiers: ["ALL_STAFF"] },
  { name: "Ms Christabel", position: "PA and Admin Assistant", department: "Front desk", tiers: ["ALL_STAFF"] },
  { name: "Mr Yahaya", position: "Facility Manager and Security Supervisor", department: "Facility", tiers: ["ALL_STAFF"] },
  { name: "Ms Queen", position: "Housekeeping", department: "Facility", tiers: ["ALL_STAFF"] },
  { name: "Ms Felicia", position: "Housekeeping", department: "Facility", tiers: ["ALL_STAFF"] },
  { name: "Ms Justina", position: "Housekeeping", department: "Facility", tiers: ["ALL_STAFF"] },
  { name: "Mr Tony", position: "Security", department: "Facility", tiers: ["ALL_STAFF"] },
  { name: "Mr Samuel", position: "Security", department: "Facility", tiers: ["ALL_STAFF"] },
  { name: "Mr Peter", position: "Security", department: "Facility", tiers: ["ALL_STAFF"] },
  { name: "Ms Precious", position: "Social Media Manager", department: "Marketing", tiers: ["ALL_STAFF"] },
];

async function main() {
  const clientId = ARABELLA.clientId!;
  const client = await prisma.client.findUnique({ where: { id: clientId }, select: { name: true } });
  if (!client) throw new Error(`No client ${clientId}`);
  console.log(`${APPLY ? "APPLYING" : "DRY RUN"} for ${client.name}\n`);

  for (const r of ROSTER) {
    const existing = await prisma.staffMember.findFirst({
      where: { clientId, name: { equals: r.name, mode: "insensitive" } },
      select: { id: true, email: true, phone: true },
    });
    const contact = r.email || r.phone ? "with contact" : "no contact yet";
    if (existing) {
      console.log(`  keep    ${r.name} (${r.position})`);
      if (APPLY) {
        await prisma.staffMember.update({
          where: { id: existing.id },
          data: {
            position: r.position, department: r.department, tiers: r.tiers,
            canApproveClinical: r.canApproveClinical ?? false,
            // Leadership's own entries win over the seed.
            email: existing.email ?? r.email ?? null,
            phone: existing.phone ?? r.phone ?? null,
          },
        });
      }
    } else {
      console.log(`  add     ${r.name} (${r.position}, ${r.tiers.join("+")}, ${contact})`);
      if (APPLY) {
        await prisma.staffMember.create({
          data: {
            clientId, name: r.name, position: r.position, department: r.department, tiers: r.tiers,
            email: r.email ?? null, phone: r.phone ?? null, kind: "EMPLOYEE",
            canApproveClinical: r.canApproveClinical ?? false,
          },
        });
      }
    }
  }

  console.log("");
  for (const [i, t] of ARABELLA_PLAN.entries()) {
    const startsOn = weekStart(t.week);
    console.log(`  task    wk${t.week} ${startsOn.toISOString().slice(0, 10)} ${t.code} ${t.title}`);
    if (!APPLY) continue;
    const data = {
      title: t.title, roles: t.roles, departments: [] as string[], cadence: t.cadence,
      evidence: t.evidence, why: t.why, startsOn, isActive: true, sortOrder: i,
    };
    await prisma.staffTask.upsert({
      where: { clientId_code: { clientId, code: t.code } },
      create: { clientId, code: t.code, ...data },
      update: data,
    });
  }

  if (!APPLY) console.log("\nNothing written. Re-run with --apply.");
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
