/**
 * Give internship centres a starting email from the hospital sales directory.
 *
 * The directory holds general inboxes (info@, management@), not the Head of
 * Nursing, so each is recorded with the role "General inbox" for the programme
 * lead to replace. Matches are listed by hand: a fuzzy match put LASUTH against
 * the Health Service Commission and could not tell Reddington's two sites
 * apart. Only centres with no email yet are touched.
 *
 *   npx tsx --env-file=.env.local scripts/backfill-internship-centre-emails.ts          # dry run
 *   npx tsx --env-file=.env.local scripts/backfill-internship-centre-emails.ts --apply
 */
import { PrismaClient } from "@prisma/client";
import { slugify } from "../lib/cadreHealth/internship/programme";

const prisma = new PrismaClient();

/** Internship centre name -> directory hospital name, as the directory spells it. */
const MATCHES: Record<string, string> = {
  "Kelina Hospital": "KELINA HOSPITAL LAGOS",
  "Vedic Lifecare Hospital": "VEDIC LIFECARE HOSPTAL",
  "Ave Maria Hospital (Headquarters)": "AVE MARIA HOSPITAL(HEADQUARTERS)",
  "Anna Maria Hospital": "ANNA MARIA HOSPITAL",
  "Etta Atlantic Memorial Hospital": "ETTA ATLANTIC MEMORIAL HOSPITAL",
  "Coptic Hospital": "COPTIC HOSPITAL",
  "Healing Stripes Hospital": "HEALING STRIPES HOSPITAL",
  "United Heart Hospital and Clinics": "UNITED HEART HOSPITAL AND CLINICS",
  "Lagos Island Maternity Hospital": "LAGOS ISLAND MATERNITY HOSPITAL",
  "Best Care Hospital": "BEST CARE HOSPITAL",
  "Motayo Hospital": "MOTAYO HOSPITAL LIMITED",
};

/** A clinical or management inbox beats billing or insurance. */
const rank = (e: string) => (/insurance|billing|hmo|account/.test(e) ? 2 : /tqm|quality/.test(e) ? 1 : 0);

async function main() {
  const apply = process.argv.includes("--apply");
  let n = 0;
  for (const [centreName, dirName] of Object.entries(MATCHES)) {
    const centre = await prisma.cadreInternshipCentre.findUnique({ where: { slug: slugify(centreName) }, select: { id: true, contactEmail: true } });
    if (!centre) { console.log(`- ${centreName}: not seeded, skipped`); continue; }
    if (centre.contactEmail) { console.log(`- ${centreName}: already has ${centre.contactEmail}`); continue; }
    const hospital = await prisma.hospital.findFirst({
      where: { name: dirName },
      select: { contacts: { where: { email: { not: null } }, select: { email: true } } },
    });
    const email = hospital?.contacts.map((c) => c.email!.toLowerCase()).sort((a, b) => rank(a) - rank(b))[0];
    if (!email) { console.log(`- ${centreName}: no email in the directory`); continue; }
    console.log(`+ ${centreName}: ${email}`);
    n++;
    if (apply) await prisma.cadreInternshipCentre.update({ where: { id: centre.id }, data: { contactEmail: email, contactRole: "General inbox" } });
  }
  console.log(apply ? `Updated ${n}.` : `${n} to update. DRY RUN. Re-run with --apply.`);
}

main().finally(() => prisma.$disconnect());
