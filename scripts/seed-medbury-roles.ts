/**
 * The four client briefs, onto the CadreHealth job board.
 *
 * The client is named in the employer organisation, which is private to them and
 * to admin, and nowhere in anything a candidate can see. The public board reads
 * `facilityName`, and that value flows into the card, the page title, the meta
 * description, the JSON-LD hiringOrganization and the share text, so it carries
 * the anonymous label instead. The slug carries it too, so slugs are built from
 * the label rather than the client's name.
 *
 * The body copy is written the same way: no client name, no brand names for
 * their divisions, and nothing quoting their own marketing description, which is
 * searchable and would identify them as surely as the name would.
 *
 * Idempotent: re-running matches on any title the role has previously carried,
 * so copy and titles can both be corrected without duplicating anything.
 *
 * Run: npx tsx --env-file=.env.local scripts/seed-medbury-roles.ts
 */
import { PrismaClient, type CadreProfessionalCadre, type CadreMandateType } from "@prisma/client";

const prisma = new PrismaClient();

/** Private. The employer organisation, visible only to them and to admin. */
const ORG_NAME = "Medbury Medical Services";

/** Public. What a candidate sees as the employer. */
const PUBLIC_EMPLOYER = "Confidential healthcare group";

/**
 * The opening every brief shares. Describes the client well enough for a senior
 * person to decide whether it is worth their time, without using the phrases
 * their own site uses.
 */
const CLIENT_INTRO =
  "Our client is a Nigerian healthcare group running three businesses: occupational health services for corporate and industrial clients, a network of outsourced and co-managed clinics, and a medical equipment and supply division. CadreHealth is handling this search on their behalf and will name them at first interview.";

interface Brief {
  key: string;
  /** Monthly NGN, where the market has already put a number on the role. */
  salaryRangeMin?: number;
  salaryRangeMax?: number;
  title: string;
  /** Every title this role has carried, so a rename updates rather than duplicates. */
  matchTitles: string[];
  cadre: CadreProfessionalCadre;
  subSpecialty: string | null;
  type: CadreMandateType;
  minYearsExperience: number;
  locationState: string;
  locationCity: string | null;
  description: string;
  requiredQualifications: string[];
  preferredQualifications: string[];
  isRelocationRequired?: boolean;
}

const BRIEFS: Brief[] = [
  {
    key: "coo-mms",
    title: "Chief Operating Officer, Occupational Health",
    matchTitles: ["Chief Operating Officer", "Chief Operating Officer, Occupational Health"],
    // Tagged MEDICINE, not HOSPITAL_MANAGEMENT, because the brief requires MBBS.
    // The cadre tag is what a candidate filters the board by and what the matcher
    // searches on, and only 15 people on the register carry Hospital Management
    // against 10,048 doctors. Tagging it by the discipline it actually demands is
    // both more accurate and the difference between 15 people finding it and ten
    // thousand.
    cadre: "MEDICINE",
    // Deliberately no sub-specialty. Nobody on the register carries Occupational
    // Medicine, so tagging it filters the role down to nobody and costs every
    // candidate five points in the matcher for failing to hold a qualification
    // the brief does not ask for: it wants MBBS plus operations leadership, not
    // occupational medicine training. The title carries the context instead.
    subSpecialty: null,
    type: "PERMANENT",
    minYearsExperience: 12,
    // Ikeja, not the Lekki address on the brief's letterhead: the client's own
    // public postings and the competing agency's both say Ikeja.
    locationState: "Lagos",
    locationCity: "Ikeja",
    // Published by a competing agency running the same mandate, so the number is
    // already in the market. Ours would read as the worse offer without it.
    salaryRangeMin: 1_700_000,
    salaryRangeMax: 2_000_000,
    description: `${CLIENT_INTRO}

They are looking for a Chief Operating Officer to lead the occupational health side of the group: strategy, operations, commercial performance and leadership across every business unit in the division.

This is an executive role reporting to the Divisional Head, Corporate Health and Wellness. The brief is to integrate and scale the occupational health business units into a leading occupational health and corporate wellness organisation in Africa.

The role is based in Ikeja, Lagos, on site. The band is 1.7m to 2m naira net per month.

What the role covers

Strategic leadership and growth. Build the division's growth plan against group objectives, open new business, and commercialise new occupational health service offerings across corporate, industrial and public sector markets.

Operations and service delivery. Own end to end operational management of the occupational health business units, with quality assurance and service standardisation across clinics, projects and industrial sites, and operational readiness for new site deployments.

Corporate client business development. Lead acquisition and retention of corporate occupational health clients across oil and gas, manufacturing, construction, maritime, telecoms, financial services, government and development organisations, including proposals, presentations and contract negotiation.

Financial performance. Divisional profitability and sustainability, budgets and forecasts, and the numbers that follow from them: revenue growth, gross margin, operating cost, EBITDA and project profitability.

Clinical governance and compliance. Regulatory compliance, clinical governance frameworks, infection prevention and patient safety, risk and incident management, and readiness for audit, inspection and accreditation.

Industrial clinics and field operations. Expansion of the industrial clinic and onsite healthcare operations, deployment of healthcare personnel across client sites, and SLA compliance across field operations.

Digital health. Integration of telemedicine, corporate wellness platforms, health analytics and electronic medical systems into occupational health operations.

People. Build and lead multidisciplinary teams, develop leadership succession, and run performance management for the division.

How performance is measured

Revenue growth and EBITDA margin, new corporate accounts and client retention, clinic utilisation and SLA compliance, budget adherence and cost to revenue, audit and clinical governance compliance, employee engagement and staff retention, and digital adoption across the division.`,
    requiredQualifications: [
      "MBBS or equivalent medical qualification",
      "12 to 15 years progressive healthcare leadership experience",
      "At least 5 years in a senior executive or operational leadership role",
      "Experience across occupational health, healthcare operations, HMO operations or multi-site healthcare management",
      "Demonstrated success managing large multidisciplinary teams and complex operations",
    ],
    preferredQualifications: [
      "MBA, MPH, MHA or a relevant executive management qualification",
      "Healthcare business development and industrial healthcare systems experience",
      "Track record of driving business growth and operational transformation",
    ],
  },
  {
    key: "head-ops-medclinics",
    title: "Head of Operations, Clinic Network",
    matchTitles: ["Head of Operations, Medclinics", "Head of Operations, Clinic Network"],
    cadre: "HOSPITAL_MANAGEMENT",
    subSpecialty: "Operations Manager",
    type: "PERMANENT",
    // The client's own brief says 7 years with 4 in leadership. A competing
    // agency is advertising the same mandate at 10 with 5. The client's written
    // brief is what we recruit to until they say otherwise; screening people out
    // on a bar we cannot evidence wastes their time and ours.
    minYearsExperience: 7,
    locationState: "Lagos",
    locationCity: "Ikeja",
    // Published by the competing agency. A single figure, not a band.
    salaryRangeMin: 1_300_000,
    salaryRangeMax: 1_300_000,
    description: `${CLIENT_INTRO}

This role runs their clinic network: establishment and management, operational efficiency, profitability and scalability across every site.

It is based in Ikeja, Lagos, on site, and pays 1.3m naira net per month. It reports to the Chief Operating Officer, with a career path to COO and Managing Director. Direct reports cover all existing and new clinics, the provider relations team, case management, primary care and emergency medical services teams, support operations and the non-clinical operations of the wellness business. It covers sites across Nigeria and Africa, so expect travel.

What the role covers

Strategic and network leadership. Deploy scalable operational structures across multisite clinic environments, lead new clinic rollouts and expansion feasibility studies, and build business plans that guarantee profitability per clinic location.

Provider network management. Set the criteria for provider selection and credentialing, lead contracting and performance reviews for in-clinic and external providers, run quality audits, and manage referral partnerships for diagnostics, secondary care and specialist consults.

Case management and emergency medical services. Oversee case coordination and continuity of care for clients and corporate partners, ensure escalation frameworks for emergencies, and drive ambulance and EMS integration into clinic operations.

Financial and commercial. Full profit and loss responsibility for the network, pricing models and cost structures, and the clinic performance metrics that sit under them: revenue, utilisation, conversion, client retention, cost per client and return on marketing spend.

Operations and service excellence. Standardise SOPs and client service protocols across all facilities, champion adoption of digital health tools, CRM and EMR, and maintain clinic accreditation and regulatory compliance.

People and organisational development. Build a culture of accountability, oversee recruitment and workforce planning for multidisciplinary teams, lead the organisational transformation needed to scale, and coach middle management for succession.

Brand, marketing and partnerships. Support client acquisition and retention, lead partnership negotiations with corporate clients, insurers and health tech partners, and represent the clinic network in industry forums.

How performance is measured

At least 25 percent year on year revenue growth per clinic with EBITDA at or above 20 percent. 100 percent credentialing compliance. At least 95 percent timely case closure to SLA. Operating costs down at least 10 percent without service compromise. Patient satisfaction at or above 90 percent. At least 80 percent client retention over twelve months. At least one new clinic site a year and at least two new service line enhancements. Clinic uptime at or above 98 percent. No critical role unfilled beyond 30 days.`,
    requiredQualifications: [
      "Bachelor's degree in healthcare administration, health sciences, healthcare management, business management, economics or a related field",
      "Master's degree (MBA, MPH, MSc Health Administration or equivalent)",
      "7 years progressive experience in corporate healthcare, wellness or lifestyle business operations, with at least 4 years in operations leadership",
      "3 years developing and implementing outsourced clinic set up and management services",
      "Experience managing multisite or networked healthcare operations",
      "Demonstrated profit and loss ownership against revenue and EBITDA targets",
    ],
    preferredQualifications: [
      "Medical, allied health or life sciences background (MBBS, BPharm, BSc Nursing, BSc Biomedical Science)",
      "Lean Six Sigma Green or Black Belt",
      "Project Management Professional (PMP or PRINCE2)",
      "Healthcare quality or operations certification (CPHQ, ISQua, ACHE, HFMA)",
      "Familiarity with lifestyle medicine, IV infusion therapy, nutritional medicine, hormone therapy and advanced diagnostics",
      "Experience with Nigerian healthcare provider landscape and EMS operations",
    ],
    isRelocationRequired: false,
  },
  {
    key: "bdm-procurement",
    title: "Business Development Manager, Medical Procurement and Healthcare Infrastructure",
    matchTitles: [
      "Business Development Manager, Medical Procurement and Healthcare Infrastructure",
    ],
    cadre: "HOSPITAL_MANAGEMENT",
    subSpecialty: "Healthcare Procurement",
    type: "PERMANENT",
    minYearsExperience: 3,
    locationState: "Lagos",
    locationCity: null,
    description: `${CLIENT_INTRO}

They are building an end to end healthcare solutions business, and this role drives the revenue behind it: medical equipment supply, consumables procurement, and healthcare infrastructure projects.

The role reports to the Divisional Head, Corporate Health and Wellness, and is built on partnerships: hospitals, corporate organisations, government agencies, OEMs and international suppliers.

What the role covers

Business development and revenue growth. Identify and close opportunities in medical equipment procurement (diagnostic, therapeutic and hospital grade), healthcare consumables and supply chain contracts, and turnkey healthcare infrastructure projects for clinics, hospitals and occupational health centres. Build a pipeline of high value B2B and B2G opportunities, and execute market entry across Nigeria and key African markets.

Strategic partnerships and vendor management. Establish relationships with OEMs and manufacturers, global and local distributors, and EPC contractors for healthcare infrastructure. Negotiate pricing, supply agreements and partnership frameworks, and manage vendor performance for quality, compliance and cost.

Project development and execution. Lead healthcare infrastructure projects end to end: needs assessment and client engagement, proposal development and costing, equipment specification and procurement planning, working alongside clinical, engineering and operations teams.

Market intelligence and product strategy. Track medical technologies, healthcare infrastructure investment and procurement policy, and advise leadership on new product lines and market positioning.

Client relationships. Hospitals and healthcare providers, corporate organisations across oil and gas and manufacturing, and government and donor funded health programmes, acting as a trusted adviser on procurement and infrastructure solutions.

Proposals and tenders. Lead technical and commercial proposals, manage participation in tenders, RFQs and RFPs, and ensure compliance with regulatory and client requirements.

How performance is measured

Revenue from procurement and infrastructure projects, number and value of new contracts secured, strategic partnerships established with OEMs, suppliers and contractors, project delivery against time and budget, and pipeline value and conversion rate.`,
    requiredQualifications: [
      "Bachelor's degree in medical sciences, biomedical engineering, pharmacy, business healthcare management or a related field",
      "3 to 7 years in medical equipment supply, healthcare procurement, or hospital infrastructure and construction projects",
      "Proven track record closing high value B2B or B2G deals",
      "Strong understanding of medical equipment lifecycle and specifications, healthcare supply chain systems and infrastructure project development",
      "Negotiation and contract management expertise",
    ],
    preferredQualifications: [
      "MBA or a relevant postgraduate qualification",
      "Financial acumen in costing, pricing and return on investment analysis",
    ],
  },
  {
    key: "bm-supply-chain",
    title: "Business Manager, Supply Chain",
    matchTitles: ["Business Manager, Supply Chain"],
    cadre: "HOSPITAL_MANAGEMENT",
    subSpecialty: "Healthcare Procurement",
    type: "PERMANENT",
    minYearsExperience: 5,
    locationState: "Lagos",
    locationCity: null,
    description: `${CLIENT_INTRO}

They are looking for a commercially minded operations manager to strengthen their medical and equipment supply division: day to day operations, healthcare project and infrastructure delivery, internal process improvement and divisional profitability.

The role reports to the Divisional Head, Corporate Health and Wellness. It needs operations leadership, project management capability, supply chain competence and a real understanding of the medical and industrial supply market in Nigeria.

What the role covers

Operations and supply chain. Procurement, inventory control, warehousing, dispatch and delivery. Accurate stock levels through structured forecasting and demand planning, timely order fulfilment against client specifications, vendor relationships and OEM compliance, and the SOPs, workflows and dashboards that keep performance consistent.

Healthcare project and infrastructure management. Plan, execute and deliver equipment installation, facility upgrades, infrastructure setup and turnkey medical projects. Coordinate with architects, engineers, OEMs and facility teams. Manage timelines, budgets, deliverables, technical documentation and quality standards, through site assessment, commissioning and handover.

Strategy and process improvement. Translate divisional strategy into operational and project delivery plans, find the gaps that cost money, and support new service lines across installation, maintenance and infrastructure.

Commercial support. Work with business development on proposals, quotations, tenders and technical submissions, provide feasibility input, pricing insight and supply chain checks for bids, and align operations and project resources to revenue targets.

Financial and profitability management. Operating costs, logistics expenses, procurement efficiency and project budgets. Margin performance, project profitability and cost savings. Working capital through optimal stock turnover and supplier payment cycles.

Team leadership. Supervise procurement officers, warehouse staff, logistics personnel, technical engineers and project teams, with clear KPIs covering both operations and project delivery.

How performance is measured

Order fulfilment at 95 percent and above, inventory accuracy at 98 percent and above, stockouts below 5 percent monthly, and delivery turnaround at 90 percent SLA compliance. On time project completion at 90 percent minimum, project budget variance within 10 percent, and 100 percent regulatory and safety adherence on all project sites. Bid response accuracy at 100 percent and technical documentation turnaround within 48 hours for standard items. Client complaint resolution within 48 to 72 hours and client satisfaction at 85 percent minimum.`,
    requiredQualifications: [
      "Bachelor's degree in supply chain, engineering project management, biomedical engineering, business administration or a related field",
      "5 to 8 years in medical supplies, equipment distribution, healthcare projects, industrial supply or related operations",
      "Strong track record managing healthcare equipment or facility projects end to end",
      "Knowledge of procurement, inventory management, warehousing, logistics and project documentation",
      "Experience supporting tenders, bids and commercial processes",
      "Proficient in ERP systems, project management tools and reporting dashboards",
    ],
    preferredQualifications: [
      "Project management certification",
      "Experience with OEM and international supplier relationships",
    ],
  },
];

function slugify(title: string, state: string): string {
  // Built from the public label, never the client's name: the slug is in the URL
  // and would otherwise identify them in the address bar and in search results.
  return [title, PUBLIC_EMPLOYER, state]
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
      salaryRangeMin: brief.salaryRangeMin ?? null,
      salaryRangeMax: brief.salaryRangeMax ?? null,
      salaryCurrency: "NGN",
      urgency: "MEDIUM",
      requiredQualifications: brief.requiredQualifications,
      preferredQualifications: brief.preferredQualifications,
      isRemoteOk: false,
      isRelocationRequired: brief.isRelocationRequired ?? false,
      employerOrgId: org.id,
      // What a candidate sees. The client is carried by employerOrgId, which is
      // private to them and to admin.
      facilityName: PUBLIC_EMPLOYER,
      status: "OPEN" as const,
      isPublished: true,
      publishedAt: new Date(),
    };

    if (existing) {
      await prisma.cadreMandate.update({
        where: { id: existing.id },
        // The slug is rewritten too: the first version of these roles was posted
        // under the client's name and the old slug still carried it.
        data: {
          ...data,
          slug: `${slugify(brief.title, brief.locationState)}-${existing.id.slice(-6)}`,
        },
      });
      console.log(
        `  updated: ${brief.title}${existing.title !== brief.title ? ` (was "${existing.title}")` : ""}`,
      );
    } else {
      const created = await prisma.cadreMandate.create({ data });
      await prisma.cadreMandate.update({
        where: { id: created.id },
        data: { slug: `${slugify(brief.title, brief.locationState)}-${created.id.slice(-6)}` },
      });
      console.log(`  created: ${brief.title} (${created.id})`);
    }
  }

  const reach = await prisma.cadreProfessional.count({
    where: { cadre: "HOSPITAL_MANAGEMENT", accountStatus: { not: "SUSPENDED" } },
  });
  const doctors = await prisma.cadreProfessional.count({
    where: { cadre: "MEDICINE", accountStatus: { not: "SUSPENDED" } },
  });
  console.log(`\nRegister reach for these roles:`);
  console.log(`  cadre HOSPITAL_MANAGEMENT: ${reach}`);
  console.log(`  cadre MEDICINE (for the COO, which requires MBBS): ${doctors}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
