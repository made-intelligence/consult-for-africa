/**
 * Put the Haven Paediatric Centre people into the platform as ClientContacts.
 *
 * Haven had none. Every email on the engagement went out through addresses
 * hardcoded in the send scripts, so nothing was logged against a contact and
 * the Communications CRM has no record of a nine-month engagement.
 *
 *   Dr Omotanwa Gbadebo  - prospective Head of Operations (post-transformation)
 *   Kabir Aregbesola     - board contact, primary (backfill)
 *   Usman Gwadabe        - cc on everything to the board (backfill)
 *
 * Portal access is left OFF for all three. The client portal session carries
 * only clientId, so a contact with access sees every Haven invoice, including
 * the agreed fee, the N7.7m concession in the invoice notes and the balance.
 * Turning it on is a decision per person, not a default.
 *
 * Idempotent: upserts on email, which is unique.
 *
 *   npx tsx --env-file=.env.local scripts/add-haven-contacts.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const CLIENT_NAME = "Haven Paediatric Centre";

const CONTACTS = [
  {
    name: "Dr Omotanwa Gbadebo",
    email: "adebusayogbadebo@gmail.com",
    title: "Head of Operations (prospective, post-transformation)",
    isPrimary: false,
  },
  {
    name: "Kabir Aregbesola",
    email: "kabir@aurorahills.co",
    title: "Board",
    isPrimary: true,
  },
  {
    name: "Usman Gwadabe",
    email: "usman.g@aurorahills.co",
    title: "Board",
    isPrimary: false,
  },
];

async function main() {
  const client = await prisma.client.findFirst({ where: { name: CLIENT_NAME } });
  if (!client) throw new Error(`No client "${CLIENT_NAME}".`);

  for (const c of CONTACTS) {
    const existing = await prisma.clientContact.findUnique({ where: { email: c.email } });
    if (existing && existing.clientId !== client.id) {
      console.warn(`! ${c.email} already belongs to another client — skipped.`);
      continue;
    }
    const row = await prisma.clientContact.upsert({
      where: { email: c.email },
      // isPortalEnabled and passwordHash are deliberately untouched on update,
      // so a re-run cannot revoke access someone has since been granted.
      update: { name: c.name, title: c.title, isPrimary: c.isPrimary, clientId: client.id },
      create: { ...c, clientId: client.id, isPortalEnabled: false },
    });
    console.log(`${existing ? "updated" : "created"}  ${row.name}  <${row.email}>  portal=${row.isPortalEnabled}`);
  }

  const all = await prisma.clientContact.findMany({
    where: { clientId: client.id },
    orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
  });
  console.log("\n" + "=".repeat(72));
  console.log(`  ${CLIENT_NAME} — ${all.length} contacts`);
  for (const k of all) {
    console.log(`   ${k.isPrimary ? "*" : " "} ${k.name.padEnd(22)} ${k.email.padEnd(30)} portal=${k.isPortalEnabled}`);
    console.log(`     ${k.title ?? "-"}`);
  }
  console.log("=".repeat(72));
}

main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => prisma.$disconnect());
