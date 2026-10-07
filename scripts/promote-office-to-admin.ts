/**
 * Debo, 7 Oct 2026: the Executive Assistant and the Administrative Assistant
 * get admin level privileges across the whole platform. Done as a role change
 * rather than a sweep of the inline role arrays, so every surface opens at once.
 *
 * Run: npx tsx --env-file=.env.local scripts/promote-office-to-admin.ts
 * They must sign out and back in: the role is read into the JWT at sign in.
 */
import { prisma } from "@/lib/prisma";

async function main() {
  const office = await prisma.user.findMany({
    where: { role: { in: ["EXECUTIVE_ASSISTANT", "ADMINISTRATIVE_ASSISTANT"] } },
    select: { id: true, name: true, email: true, role: true },
  });
  for (const u of office) {
    await prisma.user.update({ where: { id: u.id }, data: { role: "ADMIN" } });
    console.log(`${u.name} <${u.email}>: ${u.role} -> ADMIN`);
  }
  if (!office.length) console.log("No office accounts found.");
}

main().finally(() => prisma.$disconnect());
