/**
 * Raise the Haven Paediatric Centre Maarova cap so the whole hospital can be
 * assessed, not just the board.
 *
 * The arithmetic: five founders are already in the org, one of whom
 * (Dr Odedina) also appears on the staff roster as Chief Medical Director and
 * must not be duplicated. That leaves 18 new staff, for 23 people in total
 * against a cap of 20.
 *
 * Set to 30 rather than 23. The establishment work in the people workstream
 * says Haven is short of nursing and medical posts against the beds it already
 * runs, so hires are coming before the season. A cap that has to be raised
 * again in six weeks is a cap set wrong.
 *
 * Note for the record: these are assessments consumed under the engagement, not
 * sold to the client.
 *
 *   npx tsx --env-file=.env.local scripts/raise-haven-maarova-cap.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const NEW_CAP = 30;

async function main() {
  const org = await prisma.maarovaOrganisation.findFirst({
    where: { name: { contains: "Haven", mode: "insensitive" } },
    select: { id: true, name: true, maxAssessments: true, usedAssessments: true,
              _count: { select: { users: true } } },
  });
  if (!org) throw new Error("Haven Maarova organisation not found.");

  console.log(`before: "${org.name}" cap=${org.maxAssessments} used=${org.usedAssessments} users=${org._count.users}`);

  if (org.maxAssessments >= NEW_CAP) {
    console.log(`• already at or above ${NEW_CAP}, nothing to do.`);
    return;
  }

  const after = await prisma.maarovaOrganisation.update({
    where: { id: org.id },
    data: { maxAssessments: NEW_CAP },
    select: { maxAssessments: true, usedAssessments: true, _count: { select: { users: true } } },
  });

  console.log(`after : cap=${after.maxAssessments} used=${after.usedAssessments} users=${after._count.users}`);
  console.log(`\nroom for ${after.maxAssessments - after._count.users} more people beyond those already in the org.`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => prisma.$disconnect());
