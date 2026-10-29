/**
 * Load the nineteen Haven staff into StaffMember so they can sign in.
 *
 * Tiers follow lib/haven-playbook.ts. The Chief Medical Director is LEADERSHIP;
 * the Senior Registered Nurse and the three heads are SUPERVISOR; everybody
 * else is ALL_STAFF. Nobody is given a tier because of seniority alone: the
 * tier is about what you need to run your own area.
 *
 * Idempotent, and deliberately conservative on re-run. It will correct a name,
 * department, position or tier, but it will never deactivate anybody or delete
 * a row, because getting that wrong locks a nurse out mid-shift.
 *
 *   npx tsx --env-file=.env.local scripts/seed-haven-staff.ts
 *   npx tsx --env-file=.env.local scripts/seed-haven-staff.ts --apply
 */
import fs from "fs";
import path from "path";
import { PrismaClient, type StaffTier } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const CLIENT_NAME = "Haven Paediatric Centre";

interface Row {
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  department: string;
  position: string;
  dataIssue?: string;
}

function tierFor(position: string): StaffTier {
  const p = position.toLowerCase();
  if (p.includes("chief medical director")) return "LEADERSHIP";
  if (p.startsWith("head of") || p.includes("senior registered nurse")) return "SUPERVISOR";
  return "ALL_STAFF";
}

async function main() {
  const roster: Row[] = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), "docs/data/haven-staff-roster.json"), "utf8")
  ).staff;

  const bouncing = roster.filter((r) => r.dataIssue?.toLowerCase().includes("bounce"));
  if (bouncing.length) {
    throw new Error(
      `Refusing to seed: ${bouncing.map((r) => r.email).join(", ")} still flagged as bouncing. ` +
      `A staff member who cannot receive the sign-in link cannot sign in.`
    );
  }

  const client = await prisma.client.findFirst({ where: { name: CLIENT_NAME }, select: { id: true } });
  if (!client) throw new Error(`No client "${CLIENT_NAME}".`);

  const counts: Record<string, number> = {};
  for (const r of roster) {
    const tier = tierFor(r.position);
    counts[tier] = (counts[tier] ?? 0) + 1;
    const name = `${r.firstName} ${r.lastName}`;
    const email = r.email.trim().toLowerCase();

    if (APPLY) {
      await prisma.staffMember.upsert({
        where: { clientId_email: { clientId: client.id, email } },
        // isActive is untouched on update, on purpose: a re-run must never
        // reactivate somebody who has left.
        update: { name, department: r.department, position: r.position, tier, phone: r.mobile ?? null },
        create: {
          clientId: client.id,
          name,
          email,
          phone: r.mobile ?? null,
          department: r.department,
          position: r.position,
          tier,
        },
      });
    }
    console.log(`  ${tier.padEnd(11)} ${name.padEnd(26)} ${email.padEnd(32)} ${r.position}`);
  }

  console.log(`\n  ${roster.length} staff. ` + Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(", "));
  if (!APPLY) {
    console.log("\n  DRY RUN. Nothing written. Re-run with --apply.\n");
    return;
  }
  const total = await prisma.staffMember.count({ where: { clientId: client.id } });
  console.log(`  StaffMember rows for ${CLIENT_NAME}: ${total}\n`);
}

main().catch((e) => { console.error(String(e)); process.exitCode = 1; }).finally(() => prisma.$disconnect());
