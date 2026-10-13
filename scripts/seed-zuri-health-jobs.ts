/**
 * Zuri Health (Nairobi) facility record and its three consultant mandates.
 *
 * Source: the three job descriptions Zuri sent on 13 Oct 2026 (Consultant
 * Obstetrician and Gynaecologist, Consultant Physician, Consultant
 * Paediatrician). They want doctors ready to relocate to Kenya, so every role
 * is INTERNATIONAL with relocation required, and applicants go through the
 * screening form at /oncadre/kenya rather than the one-click apply.
 *
 * Zuri published no pay figures, so none are stated here. The JDs tell people
 * to write to careers@zuri.health; we leave that out, since we run the search.
 *
 * Idempotent: the facility is upserted by slug; a mandate is skipped if an OPEN
 * one with the same title already exists at Zuri.
 *
 *   npx tsx --env-file=.env.local scripts/seed-zuri-health-jobs.ts
 */
import { prisma } from "@/lib/prisma";

export const ZURI_FACILITY_SLUG = "zuri-health";

function slugify(text: string, suffix: string): string {
  const base = text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
  return `${base}-${suffix}`;
}

const FACILITY = {
  slug: ZURI_FACILITY_SLUG,
  name: "Zuri Health",
  type: "INTERNATIONAL" as const,
  state: "Kenya",
  city: "Nairobi",
  address: "132 Manyani East, Lavington, Nairobi, Kenya",
  website: "https://zuri.health",
  description:
    "Zuri Health is a pan-African digital health company delivering care through telemedicine (app, SMS, USSD and voice), embedded clinics, mobile clinics, Medic at Home, labs, pharmacy and corporate wellness, in partnership with insurers, telcos and employers. It is based in Nairobi and is hiring consultants through Consult For Africa's CadreHealth recruitment service.",
};

const KENYA_REG =
  "Specialist registration with the Kenya Medical Practitioners and Dentists Council (KMPDC) and a current practising licence before you start. If you are not yet registered, we will take you through the process.";

const HOW_WE_WORK = `How Zuri works: patients who come to you through Zuri are Zuri patients and their care is billed through Zuri, including at partner facilities. Any private practice you already have stays yours. Every encounter is documented in the Zuri system the same working day, and Zuri runs a published duty rota.`;

const MANDATES = [
  {
    title: "Consultant Obstetrician and Gynaecologist (Nairobi, Kenya)",
    subSpecialty: "Obstetrics & Gynaecology",
    description: `Zuri Health is looking for a consultant obstetrician and gynaecologist to relocate to Nairobi and lead the clinical side of Petals, its end-to-end women's health platform.

You will follow women from preconception and antenatal care through delivery and postnatal recovery, rotate across Zuri's embedded clinics in Nairobi, and deliver at partner hospitals under Zuri's admitting arrangements. You will also see gynaecology and screening patients (family planning, cervical and breast screening, fertility counselling), act as escalation consultant for women's health cases on telemedicine, and write and teach the antenatal, referral and screening protocols the doctors, clinical officers and nurses follow.

Engagement: a monthly retainer covering an agreed number of clinic sessions and telemedicine cover, plus a revenue share on consultations, procedures and deliveries billed through Zuri. Reports to the Chief Medical Officer.

${HOW_WE_WORK}

This search is run by Consult For Africa on behalf of Zuri Health. Apply through the short screening form on this page.`,
    minYearsExperience: 3,
    requiredQualifications: [
      "MBBS plus a specialist qualification in Obstetrics and Gynaecology (FWACS, FMCOG, MRCOG or equivalent)",
      "At least 3 years practising as a specialist, including independent management of deliveries and caesarean sections",
      KENYA_REG,
      "Professional indemnity cover appropriate to obstetric practice",
      "Ready to relocate to Nairobi",
    ],
    preferredQualifications: [
      "Comfortable working under partner-facility admitting arrangements",
      "Experience writing protocols and training doctors, nurses and midwives",
      "Commitment to affordable, patient-centred maternal care",
    ],
  },
  {
    title: "Consultant Physician, Internal Medicine (Nairobi, Kenya)",
    subSpecialty: "Internal Medicine",
    description: `Zuri Health is looking for a consultant physician to relocate to Nairobi and be the clinical owner of chronic disease care across the company.

You will lead the Continuous Care Program for hypertension, diabetes and other non-communicable diseases, in person and by telemedicine; turn screening camp and corporate screening findings into enrolled, insured patients; and write the SOPs and run the training that let every clinician in every market deliver the programme to the same standard. You will run consultant sessions at the embedded clinics including Saturday rounds, act as escalation consultant for complex adult cases, quality-assure work for insurers and corporate clients, guide rational test ordering and prescribing, and work with the product team on risk scoring and chronic care protocols in the HMS.

Engagement: salaried, full time. Reports to the Chief Medical Officer, with a dotted line to the VP NCD and Continuous Care. Telemedicine coverage across Zuri's markets.

${HOW_WE_WORK}

This search is run by Consult For Africa on behalf of Zuri Health. Apply through the short screening form on this page.`,
    minYearsExperience: 3,
    requiredQualifications: [
      "MBBS plus a specialist qualification in Internal Medicine (FWACP, FMCP, MRCP or equivalent)",
      "At least 3 years practising as a specialist, with strong NCD management",
      KENYA_REG,
      "Professional indemnity cover",
      "Ready to relocate to Nairobi",
    ],
    preferredQualifications: [
      "Experience in outpatient, community or programme-based care",
      "Telemedicine experience",
      "Comfortable with digital tools, data and clinical systems",
      "The discipline to set and hold standards for a team",
    ],
  },
  {
    title: "Consultant Paediatrician (Nairobi, Kenya)",
    subSpecialty: "Paediatrics",
    description: `Zuri Health is looking for a consultant paediatrician to relocate to Nairobi and make Zuri the first choice for children's care.

You will run consultant paediatric sessions across Zuri's embedded clinics, including Saturday family rounds; take over newborn and child follow-up from the Petals maternity journey (well-baby reviews, growth monitoring, immunisation); provide Medic at Home visits and remote reviews for sick children; act as escalation consultant for paediatric cases on telemedicine; and write the triage, referral and prescribing SOPs the doctors and clinical officers follow. You will also support child health days and school and employer family programmes, and coordinate admissions through Zuri's partner facilities.

Engagement: sessional, a fixed number of sessions a week including Saturday rounds. Reports to the Chief Medical Officer.

${HOW_WE_WORK}

This search is run by Consult For Africa on behalf of Zuri Health. Apply through the short screening form on this page.`,
    minYearsExperience: 3,
    requiredQualifications: [
      "MBBS plus a specialist qualification in Paediatrics (FWACP Paed, FMCPaed, MRCPCH or equivalent)",
      "At least 3 years practising as a specialist in outpatient and newborn care",
      KENYA_REG,
      "Professional indemnity cover",
      "Ready to relocate to Nairobi and work a published rota including Saturdays",
    ],
    preferredQualifications: [
      "Warm, reassuring communication with children and parents",
      "Experience writing protocols and training junior clinicians",
    ],
  },
];

async function main() {
  let facility = await prisma.cadreFacility.findUnique({ where: { slug: FACILITY.slug } });
  if (!facility) {
    facility = await prisma.cadreFacility.create({ data: { ...FACILITY, isVerified: true } });
    console.log(`facility created: ${facility.name}`);
  } else console.log(`facility exists: ${facility.name} (${facility.id})`);

  for (const m of MANDATES) {
    const existing = await prisma.cadreMandate.findFirst({ where: { title: m.title, facilityId: facility.id, status: "OPEN" } });
    if (existing) {
      console.log(`  SKIP existing: ${m.title}  ->  /oncadre/jobs/${existing.slug}`);
      continue;
    }
    const row = await prisma.cadreMandate.create({
      data: {
        title: m.title,
        description: m.description,
        facilityId: facility.id,
        clientContact: "careers@zuri.health",
        cadre: "MEDICINE",
        type: "INTERNATIONAL",
        subSpecialty: m.subSpecialty,
        minYearsExperience: m.minYearsExperience,
        requiredQualifications: m.requiredQualifications,
        preferredQualifications: m.preferredQualifications,
        locationState: "Kenya",
        locationCity: "Nairobi",
        isRemoteOk: false,
        isRelocationRequired: true,
        salaryCurrency: "KES",
        urgency: "HIGH",
        status: "OPEN",
        isPublished: true,
        publishedAt: new Date(),
        isPilot: true,
        pilotNotes: "Zuri Health mandate received 13 Oct 2026. Candidates must be ready to relocate to Nairobi; screened through /oncadre/kenya.",
        briefedAt: new Date(),
        sourcingStartedAt: new Date(),
      },
    });
    const slug = slugify(m.title, row.id.slice(-6));
    await prisma.cadreMandate.update({ where: { id: row.id }, data: { slug } });
    console.log(`  created: ${m.title}  ->  https://www.consultforafrica.com/oncadre/jobs/${slug}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
