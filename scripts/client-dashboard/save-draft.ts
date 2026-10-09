// Store a dashboard JSON as a DRAFT on an engagement. A partner then reads it
// at /admin/client-dashboards/<id> and publishes it to the client portal.
// Nothing reaches the client from here.
//
//   npx tsx --env-file=.env.local scripts/client-dashboard/save-draft.ts \
//     <engagementId> <dashboard.json> "<title>" <asOf YYYY-MM-DD> "<source>"

import { readFileSync } from "node:fs";
import { prisma } from "@/lib/prisma";
import type { DashboardData } from "@/lib/client-dashboard/types";

async function main() {
  const [engagementId, file, title, asOf, source] = process.argv.slice(2);
  if (!engagementId || !file || !title || !asOf) {
    throw new Error('usage: save-draft.ts <engagementId> <dashboard.json> "<title>" <asOf> "<source>"');
  }
  const data = JSON.parse(readFileSync(file, "utf8")) as DashboardData;
  if (!data.headline || !Array.isArray(data.sections) || !Array.isArray(data.sources)) {
    throw new Error("Not a DashboardData: needs headline, sections and sources");
  }
  const engagement = await prisma.engagement.findUnique({ where: { id: engagementId }, select: { name: true, client: { select: { name: true } } } });
  if (!engagement) throw new Error(`No engagement ${engagementId}`);

  const row = await prisma.engagementDashboard.create({
    data: { engagementId, title, asOf: new Date(asOf), data: data as object, source: source || null },
    select: { id: true },
  });
  console.log(`Draft saved for ${engagement.client.name} (${engagement.name})`);
  console.log(`Review: https://www.consultforafrica.com/admin/client-dashboards/${row.id}`);
}

main().finally(() => prisma.$disconnect());
