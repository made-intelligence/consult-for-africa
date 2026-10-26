/**
 * Seed the NMCN-approved internship centres in Lagos into CadreInternshipCentre.
 * Idempotent: an existing centre (by slug) is left alone, so BD progress
 * recorded on the platform is never overwritten.
 *
 *   npx tsx --env-file=.env.local scripts/seed-internship-centres.ts          # dry run
 *   npx tsx --env-file=.env.local scripts/seed-internship-centres.ts --apply
 */
import { PrismaClient } from "@prisma/client";
import { LAGOS_CENTRES, slugify } from "../lib/cadreHealth/internship/programme";

const prisma = new PrismaClient();

async function main() {
  const apply = process.argv.includes("--apply");
  const existing = new Set((await prisma.cadreInternshipCentre.findMany({ select: { slug: true } })).map((c) => c.slug));
  const toCreate = LAGOS_CENTRES.filter((c) => !existing.has(slugify(c.name)));
  console.log(`${LAGOS_CENTRES.length} centres on the list, ${existing.size} already seeded, ${toCreate.length} to create.`);
  if (!apply) return console.log("DRY RUN. Re-run with --apply.");
  for (const c of toCreate) {
    await prisma.cadreInternshipCentre.create({ data: { name: c.name, slug: slugify(c.name), area: c.area ?? null, ownership: c.ownership } });
  }
  console.log(`Created ${toCreate.length}.`);
}

main().finally(() => prisma.$disconnect());
