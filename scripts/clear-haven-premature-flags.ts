/**
 * Clear the flags raised against people who had never signed in.
 *
 * Eighty-eight were raised in the first two days, almost all against staff who
 * had never seen the page. They are not evidence of anything except our own
 * sequencing, and leaving them would mean the first thing sixteen people see
 * on signing in is a list of things they have already failed at.
 *
 * Deleted rather than resolved. A resolved flag is a record that something was
 * chased and settled; these were never legitimate, and dressing them up as
 * history would be a lie told by the system about itself.
 *
 *   npx tsx --env-file=.env.local scripts/clear-haven-premature-flags.ts --apply
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

async function main() {
  const c = await prisma.$queryRaw<{ id: string }[]>`
    SELECT "id" FROM "Client" WHERE "name" = 'Haven Paediatric Centre' LIMIT 1`;
  const clientId = c[0].id;

  const before = await prisma.$queryRaw<{ n: bigint }[]>`
    SELECT COUNT(*)::bigint AS n FROM "StaffTaskFlag" f
    JOIN "StaffMember" s ON s."id" = f."staffId" WHERE s."clientId" = ${clientId}`;

  const premature = await prisma.$queryRaw<{ n: bigint }[]>`
    SELECT COUNT(*)::bigint AS n FROM "StaffTaskFlag" f
    JOIN "StaffMember" s ON s."id" = f."staffId"
    WHERE s."clientId" = ${clientId} AND s."lastLoginAt" IS NULL`;

  console.log(`  flags total       : ${before[0].n}`);
  console.log(`  against never-in  : ${premature[0].n}`);

  if (!APPLY) { console.log("\n  DRY RUN. Re-run with --apply.\n"); return; }

  const del = await prisma.$executeRaw`
    DELETE FROM "StaffTaskFlag" f
    USING "StaffMember" s
    WHERE s."id" = f."staffId" AND s."clientId" = ${clientId} AND s."lastLoginAt" IS NULL`;

  const after = await prisma.$queryRaw<{ n: bigint }[]>`
    SELECT COUNT(*)::bigint AS n FROM "StaffTaskFlag" f
    JOIN "StaffMember" s ON s."id" = f."staffId" WHERE s."clientId" = ${clientId}`;
  console.log(`\n  deleted ${del}. Flags remaining: ${after[0].n} (against people who have signed in).`);
}

main().catch((e) => { console.error(String(e)); process.exitCode = 1; }).finally(() => prisma.$disconnect());
