/**
 * Apply Haven's updated staff sheet ("Staff Details for CFA-3.xlsx", 21 Oct
 * 2026) to StaffMember.
 *
 *   - adds the four new names: two customer service, a second lab scientist,
 *     a fourth medical officer
 *   - corrects Dr Shakirah's title and adds her mobile, and Margaret's mobile
 *
 * Deliberately does NOT:
 *   - deactivate Blessed Rahmat, who is missing from the sheet. Absent from a
 *     list is not the same as gone, and deactivating locks a person out
 *   - take Anita's address from the sheet, which says gamil.com. The record's
 *     gmail.com was corrected on Debo's instruction on 6 Oct
 *
 * Raw SQL so it runs from a checkout whose generated client predates the staff
 * tables. Idempotent: adds by email, so a re-run adds nobody twice.
 *
 *   npx tsx --env-file=.env.local scripts/sync-haven-staff-2026-10-21.ts
 *   npx tsx --env-file=.env.local scripts/sync-haven-staff-2026-10-21.ts --apply
 */
import { randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const NEW = [
  { name: "Linda Bolusemihi", email: "lyndabolus@gmail.com", phone: "07065951211", department: "ADMIN", position: "Customer Service" },
  { name: "Dumebi Arinze", email: "arinzedumebi40@gmail.com", phone: "08064893874", department: "ADMIN", position: "Customer Service" },
  { name: "Etietop Edet", email: "etietopedet26@gmail.com", phone: "09057374039", department: "LAB", position: "Medical Lab Scientist" },
  { name: "Boluwatife Oyedele", email: "boluwatifeadeola44@gmail.com", phone: "08109955597", department: "MEDICAL", position: "Medical Officer" },
];

const UPDATES = [
  { email: "shakirahsaliu@gmail.com", phone: "08073530280", position: "Head of Clinical Services" },
  { email: "maggiebitem@gmail.com", phone: "09042545815", position: null },
];

async function main() {
  const [client]: { id: string }[] = await prisma.$queryRaw`select id from "Client" where name = 'Haven Paediatric Centre'`;
  if (!client) throw new Error("No Haven client.");

  for (const n of NEW) {
    const [hit]: { id: string }[] = await prisma.$queryRaw`
      select id from "StaffMember" where "clientId" = ${client.id} and lower(email) = ${n.email}`;
    if (hit) { console.log(`  exists  ${n.name}`); continue; }
    console.log(`  add     ${n.name.padEnd(20)} ${n.position}, ${n.department}  ${n.email}`);
    if (APPLY) {
      const id = "c" + randomBytes(12).toString("hex");
      await prisma.$executeRaw`
        insert into "StaffMember" (id, "clientId", name, email, phone, department, position, "updatedAt")
        values (${id}, ${client.id}, ${n.name}, ${n.email}, ${n.phone}, ${n.department}, ${n.position}, now())`;
    }
  }

  for (const u of UPDATES) {
    console.log(`  update  ${u.email}  phone ${u.phone}${u.position ? `, position "${u.position}"` : ""}`);
    if (APPLY) {
      await prisma.$executeRaw`
        update "StaffMember" set phone = ${u.phone}, position = coalesce(${u.position}, position), "updatedAt" = now()
        where "clientId" = ${client.id} and lower(email) = ${u.email}`;
    }
  }

  console.log("\n  Not on the sheet, left active: Blessed Rahmat (business@havenpractice.com)");
  if (!APPLY) console.log("\n  DRY RUN. Re-run with --apply.");
}

main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => prisma.$disconnect());
