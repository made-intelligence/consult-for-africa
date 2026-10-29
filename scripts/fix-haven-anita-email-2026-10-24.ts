/**
 * Anita Musa's address was osedabamhenanita76@gmail.com, which bounced on 6 Oct.
 * Debo confirmed the real one on 24 Oct: osedebamhenanita76@gmail.com (e, not a).
 *
 *   npx tsx --env-file=.env.local scripts/fix-haven-anita-email-2026-10-24.ts --apply
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const OLD = "osedabamhenanita76@gmail.com";
const NEW = "osedebamhenanita76@gmail.com";

(async () => {
  const sup: any[] = await prisma.$queryRaw`select email, reason from "CommunicationSuppression" where lower(email) = ${NEW}`;
  if (sup.length) throw new Error(`${NEW} is suppressed: ${sup[0].reason}`);
  const n = process.argv.includes("--apply")
    ? await prisma.$executeRaw`update "StaffMember" set email = ${NEW}, "updatedAt" = now() where lower(email) = ${OLD}`
    : 0;
  const row: any[] = await prisma.$queryRaw`select name, email, "isActive" from "StaffMember" where lower(email) in (${OLD}, ${NEW})`;
  console.log({ updated: n, row });
  await prisma.$disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
