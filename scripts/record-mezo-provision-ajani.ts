/**
 * Record Dr Ajani's Mezo place on the CadreHealth side, and send her the link.
 *
 * She was provisioned directly against Mezo's database rather than through the
 * signed partner endpoint, because MEZO_PARTNER_SECRET lives only in Vercel and
 * there is a live request for a dermatologist. That path writes nothing back
 * here, so without this row CadreHealth has no idea she has a Mezo place: the
 * backfill selects on `mezoInterest: null` and would open a second one the
 * moment she claims.
 *
 * Run: npx tsx --env-file=.env.local scripts/record-mezo-provision-ajani.ts
 */
import { PrismaClient } from "@prisma/client";
import { emailMezoClaim } from "../lib/cadreHealth/mezoClaimEmail";

const prisma = new PrismaClient();
const DRY = process.argv.includes("--dry");

const EMAIL = "daraolu@yahoo.com";
const CLAIM_URL =
  "https://mezohealth.com/claim/50253612b53298965ae3ec03cf4cc6049f87ddc9cd2a4bfd";

async function main() {
  if (!process.env.ZEPTOMAIL_API_KEY) {
    throw new Error("ZEPTOMAIL_API_KEY is not set; refusing to fall back to SMTP.");
  }

  const person = await prisma.cadreProfessional.findUniqueOrThrow({
    where: { email: EMAIL },
    select: { id: true, email: true, firstName: true, lastName: true, cadre: true },
  });

  const existing = await prisma.cadreMezoInterest.findUnique({
    where: { professionalId: person.id },
    select: { id: true, claimEmailSentAt: true },
  });

  if (existing?.claimEmailSentAt) {
    console.log("already recorded and emailed; nothing to do");
    return;
  }

  if (DRY) {
    console.log(`would record PROVISIONED for ${person.email} and send ${CLAIM_URL}`);
    return;
  }

  await prisma.cadreMezoInterest.upsert({
    where: { professionalId: person.id },
    create: {
      professionalId: person.id,
      // No survey was taken: she came in by introduction, not through the
      // instrument, and the payload is deliberately honest about that rather
      // than carrying invented answers.
      payload: { source: "direct introduction", provisionedBy: "script" },
      practiceCity: "Lagos",
      mezoStatus: "PROVISIONED",
      mezoClaimUrl: CLAIM_URL,
      mezoProvisionedAt: new Date(),
    },
    update: {
      mezoStatus: "PROVISIONED",
      mezoClaimUrl: CLAIM_URL,
      mezoProvisionedAt: new Date(),
    },
  });

  await emailMezoClaim({ person, claimUrl: CLAIM_URL, delayed: false });

  await prisma.cadreMezoInterest.update({
    where: { professionalId: person.id },
    data: { claimEmailSentAt: new Date() },
  });

  console.log(`recorded and emailed ${person.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
