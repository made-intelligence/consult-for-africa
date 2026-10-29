/**
 * Uburu Health, onto the CadreHealth job board.
 *
 * Named rather than anonymised, unlike the Medbury mandate: Uburu's own advert
 * carries their name and platform publicly, so there is nothing to protect.
 *
 * Idempotent: re-running matches on any title the role has carried.
 *
 * Run: npx tsx --env-file=.env.local scripts/seed-uburu-roles.ts
 */
import { PrismaClient, type CadreProfessionalCadre, type CadreMandateType } from "@prisma/client";

const prisma = new PrismaClient();

const ORG_NAME = "Uburu Health";

interface Brief {
  title: string;
  salaryRangeMin?: number;
  salaryRangeMax?: number;
  isRemoteOk?: boolean;
  matchTitles: string[];
  cadre: CadreProfessionalCadre;
  subSpecialty: string | null;
  type: CadreMandateType;
  minYearsExperience: number | null;
  locationState: string;
  locationCity: string | null;
  description: string;
  requiredQualifications: string[];
  preferredQualifications: string[];
}

const BRIEFS: Brief[] = [
  {
    title: "Ecosystem Manager",
    matchTitles: ["Ecosystem Manager", "Data Officer", "Ecosystem Manager (Data Officer)"],
    // Health Records is the accurate taxonomy and has nobody on the register at
    // all, so it would make the role unfindable. Hospital Management is the
    // nearest cadre with an actual audience, and this is an operations and
    // stakeholder job more than a clinical records one.
    cadre: "HOSPITAL_MANAGEMENT",
    subSpecialty: "Quality Management",
    type: "PERMANENT",
    minYearsExperience: null,
    locationState: "Lagos",
    locationCity: null,
    // Largely remote with field visits, logistics covered.
    isRemoteOk: true,
    salaryRangeMin: 300_000,
    salaryRangeMax: 500_000,
    description: `Uburu Health runs a health information exchange: a platform that lets hospitals and clinics share patient information with each other securely. This role is how that network actually grows and keeps working in Lagos.

It is a field and relationship job as much as a technical one. You will be in and out of facilities, getting them onto the platform, training the people who will use it every day, and staying close enough to notice when they quietly stop.

The work is hybrid and largely remote, with the time out of the house spent visiting facilities rather than sitting in an office. Logistics are covered. The band is 300,000 to 500,000 naira a month, depending on what you bring.

What the role covers

Getting facilities on. Onboarding new sites, activating users, running the training, and handling the support questions that follow. Adoption is the measure, not installation.

Data exchange. Coordinating the secure, timely and accurate movement of health information between participating facilities, and keeping it inside Uburu's governance, privacy and security rules.

Data quality. Pushing for completeness and integrity in what facilities actually send. Finding the discrepancies, escalating them, and closing the loop rather than logging them.

Watching adoption. Tracking usage, exchange activity and engagement by facility, so a site going quiet is caught early rather than at the quarterly review.

Stakeholder management. Liaising with facilities, users and partners, and resolving operational issues before they become reasons to stop using the platform.

Feedback. Bringing what you learn in the field back to the people building the product, so the platform changes in response to how it is really used.

What matters in this role

Someone who can sit with a records officer at a busy facility and make the system make sense to them, and who can also read an exchange log and tell when the data is wrong. Comfort with both halves is the job.`,
    requiredQualifications: [
      "Experience in health information management, health data, or healthcare operations",
      "Able to train non-technical clinical and administrative staff",
      "Comfortable working across multiple facilities in Lagos",
      "Understanding of health data privacy and information sharing obligations",
    ],
    preferredQualifications: [
      "Background in health records, health informatics or public health",
      "Experience with electronic medical records or a health information exchange",
      "Prior work onboarding facilities onto a digital platform",
    ],
  },
];

function slugify(title: string, state: string): string {
  return [title, ORG_NAME, state]
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

async function main() {
  const org =
    (await prisma.cadreEmployerOrg.findFirst({ where: { name: ORG_NAME } })) ??
    (await prisma.cadreEmployerOrg.create({ data: { name: ORG_NAME } }));
  console.log(`Org: ${org.name} (${org.id}), verified: ${org.isVerified}`);

  for (const brief of BRIEFS) {
    const existing = await prisma.cadreMandate.findFirst({
      where: { employerOrgId: org.id, title: { in: brief.matchTitles } },
      select: { id: true, title: true },
    });

    const data = {
      title: brief.title,
      description: brief.description,
      cadre: brief.cadre,
      subSpecialty: brief.subSpecialty,
      type: brief.type,
      minYearsExperience: brief.minYearsExperience,
      locationState: brief.locationState,
      locationCity: brief.locationCity,
      salaryCurrency: "NGN",
      urgency: "MEDIUM",
      requiredQualifications: brief.requiredQualifications,
      preferredQualifications: brief.preferredQualifications,
      salaryRangeMin: brief.salaryRangeMin ?? null,
      salaryRangeMax: brief.salaryRangeMax ?? null,
      isRemoteOk: brief.isRemoteOk ?? false,
      isRelocationRequired: false,
      employerOrgId: org.id,
      facilityName: ORG_NAME,
      status: "OPEN" as const,
      isPublished: true,
      publishedAt: new Date(),
    };

    if (existing) {
      await prisma.cadreMandate.update({
        where: { id: existing.id },
        data: { ...data, slug: `${slugify(brief.title, brief.locationState)}-${existing.id.slice(-6)}` },
      });
      console.log(`  updated: ${brief.title}`);
    } else {
      const created = await prisma.cadreMandate.create({ data });
      await prisma.cadreMandate.update({
        where: { id: created.id },
        data: { slug: `${slugify(brief.title, brief.locationState)}-${created.id.slice(-6)}` },
      });
      console.log(`  created: ${brief.title} (${created.id})`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
