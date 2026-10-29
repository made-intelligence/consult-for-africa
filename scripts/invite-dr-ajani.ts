/**
 * Invite Dr Ajani, dermatologist, to CadreHealth.
 *
 * Mezo follows on its own and cannot be sent now. Mezo lives in its own repo
 * with its own database, and the backfill that provisions a Mezo profile selects
 * on `passwordHash: { not: null }`, so only doctors who have actually claimed
 * CadreHealth are picked up. Sending a Mezo link today would mean minting a
 * token this codebase cannot mint. He claims here, the cron provisions him
 * there, and he gets the Mezo invitation in that run.
 *
 * Run: npx tsx --env-file=.env.local scripts/invite-dr-ajani.ts --dry
 */
import { PrismaClient } from "@prisma/client";
import { sendCadreEmail } from "../lib/cadreEmail";

const prisma = new PrismaClient();
const DRY = process.argv.includes("--dry");

/** Not NEXTAUTH_URL: that is localhost in .env.local and this runs from a laptop. */
const PUBLIC_BASE = process.env.CADRE_PUBLIC_URL ?? "https://oncadre.com";

const PERSON = {
  email: "daraolu@yahoo.com",
  phone: "+234 802 555 9295",
  // Only a surname was given. firstName is left empty rather than stuffed with
  // the title, which is the exact corruption that makes 28% of greetings on the
  // imported register wrong. cadreSalutation then renders "Dr Ajani", which is
  // what a consultant should be called anyway.
  firstName: "",
  lastName: "Ajani",
  cadre: "MEDICINE" as const,
  subSpecialty: "Dermatology",
};

async function main() {
  if (!process.env.ZEPTOMAIL_API_KEY) {
    throw new Error("ZEPTOMAIL_API_KEY is not set; refusing to fall back to SMTP.");
  }

  const existing = await prisma.cadreProfessional.findUnique({
    where: { email: PERSON.email },
    select: { id: true, passwordHash: true },
  });

  const professional =
    existing ??
    (await prisma.cadreProfessional.create({
      data: {
        ...PERSON,
        accountStatus: "IMPORTED",
        // Deliberately not stamped. He has not confirmed the specialty himself;
        // it came to us second hand, and the claim page asks him to confirm it.
        specialtyConfirmedAt: null,
      },
      select: { id: true, passwordHash: true },
    }));

  if (professional.passwordHash) {
    console.log("already claimed; nothing to invite");
    return;
  }

  const claimUrl = `${PUBLIC_BASE}/oncadre/claim/${professional.id}`;

  const body = `Dr Ajani, good to meet you.

I have reserved a profile for you on CadreHealth, which is the network we run for Nigerian healthcare professionals. It holds your licence and CPD in one place with renewal reminders, shows what people in your specialty are actually paid, and puts you in front of hospitals that are hiring without your current employer ever seeing it.

Claiming it takes about a minute. Nothing is published and no employer can reach you unless you say yes to them individually.

Once you are in, I will send you the invitation to Mezo as well. That is the private practice network, and it is the more useful of the two for a dermatologist in private practice. It only opens to doctors who have claimed here first, which is why this one comes before it.`;

  if (DRY) {
    console.log("TO:", PERSON.email);
    console.log("CLAIM:", claimUrl);
    console.log(body);
    return;
  }

  await sendCadreEmail({
    to: PERSON.email,
    subject: "Your CadreHealth profile is reserved",
    heading: "Claim your profile",
    body,
    ctaText: "Claim your profile",
    ctaHref: claimUrl,
    footer: "If this is not for you, ignore this and nothing further will be sent.",
  });

  console.log(`invited ${PERSON.email}`);
  console.log(`claim url: ${claimUrl}`);
  console.log("Mezo: pending his claim, then the backfill cron provisions him.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
