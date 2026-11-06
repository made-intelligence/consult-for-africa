/**
 * Open Haven's first review cycle (November 2026 to February 2027), and give
 * every member of staff their role (job description) and line manager from
 * lib/haven-roles.ts. Never overwrites a role or manager already set, so a
 * change made by leadership on /HavenStaff/people survives a re-run.
 *
 * Objectives are not seeded: each line manager starts them from the role's
 * KPIs and agrees them with the person, which is the point.
 *
 *   npx tsx --env-file=.env scripts/seed-haven-performance.ts            dry run
 *   npx tsx --env-file=.env scripts/seed-haven-performance.ts --apply
 */
import { PrismaClient } from "@prisma/client";
import { HAVEN_ROLES, roleForPosition } from "../lib/haven-roles";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

async function main() {
  const client = await prisma.client.findFirst({ where: { name: "Haven Paediatric Centre" }, select: { id: true } });
  if (!client) throw new Error("No Haven client");

  const have = await prisma.reviewCycle.findFirst({ where: { clientId: client.id, closedAt: null } });
  console.log(have ? `Cycle open already: ${have.name}` : "Opening cycle: November 2026 to February 2027");
  if (APPLY && !have) {
    await prisma.reviewCycle.create({
      data: { clientId: client.id, name: "November 2026 to February 2027", startsOn: new Date("2026-11-01T00:00:00Z"), endsOn: new Date("2027-02-28T23:59:59Z") },
    });
  }

  const staff = await prisma.staffMember.findMany({
    where: { clientId: client.id, isActive: true, kind: "EMPLOYEE" },
    select: { id: true, name: true, position: true, roleCode: true, lineManagerId: true },
  });
  const roleOf = new Map(staff.map((s) => [s.id, s.roleCode ?? roleForPosition(s.position)?.code ?? null]));
  const holderOf = (code: string) => staff.find((s) => roleOf.get(s.id) === code);

  for (const s of staff) {
    const code = roleOf.get(s.id);
    const role = HAVEN_ROLES.find((r) => r.code === code);
    const mgr = role?.reportsTo ? holderOf(role.reportsTo) : undefined;
    const managerId = s.lineManagerId ?? (mgr && mgr.id !== s.id ? mgr.id : null);
    console.log(`  ${s.name.padEnd(28)} ${(role?.title ?? "NO ROLE").padEnd(46)} -> ${mgr && managerId === mgr.id ? mgr.name : s.lineManagerId ? "(kept)" : "no manager"}`);
    if (APPLY) await prisma.staffMember.update({ where: { id: s.id }, data: { roleCode: s.roleCode ?? code, lineManagerId: managerId } });
  }
  console.log(APPLY ? "\nApplied." : "\nDRY RUN. Re-run with --apply.");
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
