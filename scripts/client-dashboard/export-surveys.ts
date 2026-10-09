// Dump the survey responses for one client to a local JSON file, for an
// analysis script to aggregate. The output holds respondent payloads, so it
// goes to a scratch directory and never into the repo.
//
//   npx tsx --env-file=.env.local scripts/client-dashboard/export-surveys.ts <slug-prefix> <out.json>

import { writeFileSync } from "node:fs";
import { prisma } from "@/lib/prisma";

async function main() {
  const [prefix, out] = process.argv.slice(2);
  if (!prefix || !out) throw new Error("usage: export-surveys.ts <slug-prefix> <out.json>");
  const rows = await prisma.auditSurveyResponse.findMany({
    where: { survey: { startsWith: prefix } },
    select: { survey: true, payload: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  writeFileSync(out, JSON.stringify(rows));
  console.log(`${rows.length} responses -> ${out}`);
}

main().finally(() => prisma.$disconnect());
