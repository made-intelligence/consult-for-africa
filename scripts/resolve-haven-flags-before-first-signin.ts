/**
 * One-off, 16 Oct 2026, Debo approved. Marks resolved (does not delete) every
 * open Haven task flag raised for a period that began before the person first
 * signed in. The flag job now skips those periods (PR #69); these 49 were
 * raised before that fix. History is kept: resolvedAt + a resolution note.
 *
 *   npx tsx --env-file=.env.local scripts/resolve-haven-flags-before-first-signin.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
(async () => {
  const n = await prisma.$executeRaw`
    update "StaffTaskFlag" f set "resolvedAt" = now(), resolution = 'Raised before first sign-in'
    from (select "staffId", min("usedAt") first_in from "StaffLoginToken" where "usedAt" is not null group by 1) t
    where f."staffId" = t."staffId" and f."resolvedAt" is null and f."forDate" < t.first_in`;
  console.log(`resolved ${n}`);
  await prisma.$disconnect();
})();
