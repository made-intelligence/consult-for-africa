/**
 * Seed the nineteen Haven staff via raw SQL.
 *
 * scripts/seed-haven-staff.ts is the real one and uses the Prisma client. It
 * cannot run from this checkout: the working tree sits on another session's
 * branch, so prisma/schema.prisma here has no StaffMember and the generated
 * client has no model for it. Regenerating against main's schema would change
 * what that other session's code sees, and overwriting their schema file to fix
 * my problem is worse.
 *
 * The tables exist in the database, so raw SQL needs neither. Parameterised
 * throughout. Idempotent on (clientId, email), and it will not deactivate or
 * delete anybody on a re-run.
 *
 *   npx tsx --env-file=.env.local scripts/seed-haven-staff-raw.ts --apply
 */
import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const CLIENT_NAME = "Haven Paediatric Centre";

interface Row {
  firstName: string; lastName: string; email: string; mobile?: string;
  department: string; position: string; dataIssue?: string;
}

function tierFor(position: string) {
  const p = position.toLowerCase();
  if (p.includes("chief medical director")) return "LEADERSHIP";
  if (p.startsWith("head of") || p.includes("senior registered nurse")) return "SUPERVISOR";
  return "ALL_STAFF";
}

const cuidish = () => "c" + randomBytes(12).toString("hex");

async function main() {
  const roster: Row[] = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), "docs/data/haven-staff-roster.json"), "utf8")
  ).staff;

  const bouncing = roster.filter((r) => r.dataIssue?.toLowerCase().includes("bounce"));
  if (bouncing.length) throw new Error(`Refusing to seed, bouncing: ${bouncing.map((r) => r.email)}`);

  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT "id" FROM "Client" WHERE "name" = ${CLIENT_NAME} LIMIT 1`;
  if (!rows.length) throw new Error(`No client "${CLIENT_NAME}".`);
  const clientId = rows[0].id;

  let written = 0;
  for (const r of roster) {
    const tier = tierFor(r.position);
    const name = `${r.firstName} ${r.lastName}`;
    const email = r.email.trim().toLowerCase();
    if (APPLY) {
      await prisma.$executeRaw`
        INSERT INTO "StaffMember"
          ("id","clientId","name","email","phone","department","position","tier","isActive","createdAt","updatedAt")
        VALUES
          (${cuidish()}, ${clientId}, ${name}, ${email}, ${r.mobile ?? null},
           ${r.department}, ${r.position}, ${Prisma.raw(`'${tier}'::"StaffTier"`)}, true, NOW(), NOW())
        ON CONFLICT ("clientId","email") DO UPDATE SET
          "name" = EXCLUDED."name",
          "phone" = EXCLUDED."phone",
          "department" = EXCLUDED."department",
          "position" = EXCLUDED."position",
          "tier" = EXCLUDED."tier",
          "updatedAt" = NOW()`;
      written++;
    }
    console.log(`  ${tier.padEnd(11)} ${name.padEnd(26)} ${email}`);
  }

  if (!APPLY) { console.log("\n  DRY RUN. Re-run with --apply.\n"); return; }

  const count = await prisma.$queryRaw<{ n: bigint }[]>`
    SELECT COUNT(*)::bigint AS n FROM "StaffMember" WHERE "clientId" = ${clientId}`;
  const byTier = await prisma.$queryRaw<{ tier: string; n: bigint }[]>`
    SELECT "tier"::text AS tier, COUNT(*)::bigint AS n FROM "StaffMember"
    WHERE "clientId" = ${clientId} GROUP BY "tier"`;
  console.log(`\n  ${written} upserted. StaffMember rows for Haven: ${count[0].n}`);
  for (const t of byTier) console.log(`    ${t.tier}: ${t.n}`);
}

main().catch((e) => { console.error(String(e)); process.exitCode = 1; }).finally(() => prisma.$disconnect());
