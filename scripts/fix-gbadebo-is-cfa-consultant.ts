/**
 * Correction, 6 October 2026. Dr Omotanwa Gbadebo was first set up as a Haven
 * ClientContact on the understanding that she was the hospital's own incoming
 * Head of Operations. She is not. She is a CFA consultant who will go into
 * Haven as prospective Head of Operations once the transformation is through.
 *
 * So:
 *   - remove the ClientContact row, which was the wrong record and would have
 *     given her the Haven client portal, where the session is clientId-scoped
 *     and shows every invoice on the account
 *   - create her as a platform User, role CONSULTANT, like the other 69
 *
 * Her ConsultantProfile and her Assignment to the Haven engagement are NOT
 * created here. The profile needs her real title, location and years, and the
 * assignment needs a rate and an allocation. Inventing either would put a
 * fiction in the system of record. Both are listed as outstanding.
 *
 * Idempotent. No email is sent and no password is set.
 *
 *   npx tsx --env-file=.env.local scripts/fix-gbadebo-is-cfa-consultant.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const EMAIL = "adebusayogbadebo@gmail.com";
const NAME = "Dr Omotanwa Gbadebo";

async function main() {
  const contact = await prisma.clientContact.findUnique({
    where: { email: EMAIL },
    include: { client: { select: { name: true } } },
  });
  if (contact) {
    if (contact.isPortalEnabled) {
      console.warn("! Portal was enabled on this contact. Removing the row revokes it, which is the intent.");
    }
    await prisma.clientContact.delete({ where: { id: contact.id } });
    console.log(`removed ClientContact ${NAME} from ${contact.client.name}`);
  } else {
    console.log("• No ClientContact to remove.");
  }

  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    update: { name: NAME },
    create: { email: EMAIL, name: NAME, role: "CONSULTANT" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  console.log(`User: ${user.name} <${user.email}> role=${user.role} id=${user.id}`);

  const profile = await prisma.consultantProfile.findUnique({ where: { userId: user.id } });
  const eng = await prisma.engagement.findFirst({
    where: { name: { contains: "Haven" } },
    select: { id: true, name: true },
  });
  const assignment = eng
    ? await prisma.assignment.findFirst({ where: { engagementId: eng.id, consultantId: user.id } })
    : null;

  console.log("\nOutstanding:");
  console.log(`  ConsultantProfile : ${profile ? "present" : "NOT created, needs title, location, years, specialties"}`);
  console.log(`  Haven assignment  : ${assignment ? "present" : "NOT created, needs rate, rate type and allocation"}`);
  console.log(`  Haven engagement has ${eng ? await prisma.assignment.count({ where: { engagementId: eng.id } }) : 0} assignments in total`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => prisma.$disconnect());
