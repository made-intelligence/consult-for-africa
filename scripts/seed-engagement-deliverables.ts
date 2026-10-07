/**
 * Structure the deliverables for the live engagements that have none.
 *
 * Eight signed, invoiced engagements were carrying zero deliverables: the work
 * was sold and the bench was hired, and nothing connected the two. This gives
 * each of them a spine that a director can accept, amend or reject.
 *
 * Everything lands as DRAFT and not client visible, on purpose. This is a
 * starting structure drawn from the signed scope, not an authority on it. The
 * review by Matthew and Adediwura is the step that makes it real, and they are
 * expected to cut and rename.
 *
 * Idempotent: matches on engagement plus deliverable name, so re-running
 * updates descriptions rather than duplicating.
 *
 * Run: npx tsx --env-file=.env.local scripts/seed-engagement-deliverables.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Spec {
  /** Substring that identifies the engagement; must match exactly one. */
  engagement: string;
  deliverables: { name: string; description: string }[];
}

const PLAN: Spec[] = [
  {
    engagement: "Medbury Division, Setup and Management",
    deliverables: [
      {
        name: "Division operating model and governance charter",
        description:
          "How the division runs: decision rights between Medbury and CFA, reporting lines, the cadence of governance, and what each side is accountable for. Sets the frame every other deliverable sits inside.",
      },
      {
        name: "Secondment structure for the two divisional COOs",
        description:
          "The arrangement under which the COOs sit on Medbury payroll and are seconded to CFA management: reporting, objectives, review, and the conditions for ending it. Needs to be settled before either person starts.",
      },
      {
        name: "Technology platform specification",
        description:
          "The platform underneath the division, specified to build. This is the part of the mandate that differentiates the offer rather than the part that merely delivers it.",
      },
      {
        name: "Standard operating procedures",
        description:
          "The procedures the division runs on, written to be handed over rather than to be admired. Covers the operating core, not every edge case.",
      },
      {
        name: "Commercial model and pricing architecture",
        description:
          "How the division prices and what it earns, including the revenue and EBITDA participation, and what has to be true for the incentive to pay.",
      },
      {
        name: "Three month setup plan",
        description:
          "The setup sprint, week by week, with the gates that say whether it is on track. The sprint is three months and the handover is two.",
      },
      {
        name: "Handover and capability transfer pack",
        description:
          "What Medbury holds at the end: documentation, trained people, and the running routines. The test is whether the division still works once CFA steps back.",
      },
      {
        name: "Monthly performance pack",
        description:
          "The template for the monthly report to Medbury leadership. Built once so the monthly support retainer produces something consistent rather than something assembled each time.",
      },
    ],
  },
  {
    engagement: "Medlyfe Introduces",
    deliverables: [
      {
        name: "Run of show for the evening of 8 October",
        description:
          "The evening in order: cocktail, fireside, panel, and what happens between them. Timings, who is on, who hands to whom.",
      },
      {
        name: "Guest list and invitation strategy",
        description:
          "Who is in the room and how they are asked. The evening is the opening of a series, so the list is built for who we want back, not only for who fills seats.",
      },
      {
        name: "Speaker and panel brief",
        description:
          "What each speaker is there to say, and the questions the panel is actually answering. Written so a guest leaves able to repeat the argument.",
      },
      {
        name: "Creative direction for the series",
        description:
          "The look, tone and language of The Art of Looking Like Yourself, applied across the evening and the campaign that follows it.",
      },
      {
        name: "Eight week campaign calendar",
        description:
          "The campaign after the evening, week by week: what goes out, where, and what each week is trying to move.",
      },
      {
        name: "Content production schedule",
        description:
          "What has to be shot, written and approved, by when, for the calendar to be deliverable rather than aspirational.",
      },
      {
        name: "Media and partnership plan",
        description:
          "Earned and partnered reach around the series, and who owns each relationship.",
      },
      {
        name: "Conversion and measurement framework",
        description:
          "What the programme is measured on after the evening: enquiries, bookings and what they cost. Agreed before launch so the result is not argued about afterwards.",
      },
    ],
  },
  {
    engagement: "House of Refuge, Management Retainer and Fundraising",
    deliverables: [
      {
        name: "Monthly management report",
        description:
          "The standing report to leadership under the management retainer. Format fixed once so each month is comparable with the last.",
      },
      {
        name: "Operating dashboard and KPI set",
        description:
          "The handful of numbers the facility is actually run on, defined and sourced, with who owns each one.",
      },
      {
        name: "Case for support",
        description:
          "The fundraising argument: what the facility does, what it costs, what a funder changes by giving. The core document every approach is cut from.",
      },
      {
        name: "Funder target list and segmentation",
        description:
          "Who to approach, in what order, and why each would care. Segmented by the kind of ask rather than by size alone.",
      },
      {
        name: "Grant pipeline and application calendar",
        description:
          "Live opportunities with deadlines, owners and status, so applications are made on time rather than noticed late.",
      },
      {
        name: "Staff assessment rollout plan",
        description:
          "How the staff assessment is introduced, who is assessed in what order, and how results are handled. The last one worked because staff self registered on a single shared link.",
      },
      {
        name: "Board reporting pack",
        description:
          "What the board sees and how often, separated from the operational reporting so the two do not collapse into each other.",
      },
    ],
  },
  {
    engagement: "Arabella Women's Health Diagnostic Audit",
    deliverables: [
      {
        name: "Site visit plan",
        description:
          "What is seen, who is met and what is collected on site. Built for a single visit, so nothing that needs to be observed in person is left to a follow up call.",
      },
      {
        name: "Survey instruments",
        description:
          "The four live survey instruments and the logic behind each. Already published and collecting.",
      },
      {
        name: "Survey response analysis",
        description:
          "What the responses say, including where response rates are too thin to carry a conclusion.",
      },
      {
        name: "Clinical operations review",
        description:
          "How care is actually delivered: flow, staffing, records, and where the gaps between stated and real practice sit.",
      },
      {
        name: "Revenue and financial review",
        description:
          "Where the money comes from, where it leaks, and whether the records can support the question being asked of them.",
      },
      {
        name: "Governance and structure review",
        description:
          "Ownership, decision rights and reporting, including what carried over from the predecessor entity and what did not.",
      },
      {
        name: "Diagnostic audit report",
        description:
          "The findings, written to the leadership rather than filed as an audit paper. Opens with a letter from Debo.",
      },
      {
        name: "Findings presentation",
        description:
          "The session where the report is walked through, built so the hard findings are heard rather than defended against.",
      },
    ],
  },
  {
    engagement: "Osteon Clinics Organisational Audit",
    deliverables: [
      {
        name: "Site visit findings",
        description:
          "What the visit on 17 September showed, recorded against what was expected before it.",
      },
      {
        name: "Ten case patient journey trace",
        description:
          "Ten real cases followed end to end, which is where the difference between the written process and the lived one shows up.",
      },
      {
        name: "Survey responses and analysis",
        description:
          "The four live surveys, their responses, and what can and cannot be concluded from the numbers returned.",
      },
      {
        name: "Organisational structure assessment",
        description:
          "Roles, reporting and where authority actually sits as against the chart.",
      },
      {
        name: "The practice against the company",
        description:
          "The central thesis of this audit: the practice is bigger than the company around it, and the consequences of that gap for risk, succession and value.",
      },
      {
        name: "Audit report",
        description:
          "The findings written to the principal, with the integrity material framed procedurally rather than accusatorially.",
      },
      {
        name: "Recommendations and roadmap",
        description:
          "What to do, in what order, with what it costs and who owns it.",
      },
    ],
  },
  {
    engagement: "Aman HMO Lagos Provider Network Growth",
    deliverables: [
      {
        name: "Existing client branch mapping",
        description:
          "Where Aman's current enrollees actually are, by branch and employer. The network should be built where the members already sit, not where providers are easiest to sign.",
      },
      {
        name: "Islamic affinity provider mapping",
        description:
          "Providers reachable through the Takaful and Islamic affinity network, which is the advantage a general HMO expanding into Lagos does not have.",
      },
      {
        name: "Network gap analysis",
        description:
          "Where coverage fails against where members are, by specialty and by distance.",
      },
      {
        name: "Target provider list",
        description:
          "The prioritised list, with what each provider closes in the gap analysis and what it will take to sign them.",
      },
      {
        name: "Provider recruitment approach and terms",
        description:
          "How providers are approached and on what commercial terms, consistent across the network rather than negotiated one at a time.",
      },
      {
        name: "Network growth plan",
        description:
          "The sequence and timetable, with the coverage position each stage reaches.",
      },
      {
        name: "Business development playbook",
        description:
          "How the practice runs after this engagement ends, written for Dorothy's team to use without us.",
      },
    ],
  },
  {
    engagement: "Belfiore Client Vault",
    deliverables: [
      {
        name: "Client Vault requirements specification",
        description:
          "What the vault holds, who sees what, and what it has to do. Phase one scope, with later phases named and deliberately excluded.",
      },
      {
        name: "Client record data model",
        description:
          "The structure of a client record, designed so the clinical, commercial and preference histories sit together rather than in three places.",
      },
      {
        name: "Five domain client experience framework",
        description:
          "The five domains of the front desk programme, defined with what good looks like in each.",
      },
      {
        name: "Front desk standard operating procedures",
        description:
          "The procedures the front desk runs on, written for the person doing the job rather than for the file.",
      },
      {
        name: "Staff training materials",
        description:
          "What the team is taught and how it is assessed, so the programme survives a change of staff.",
      },
      {
        name: "Phase one build and rollout plan",
        description:
          "What is built, in what order, and how it goes live without interrupting a working clinic.",
      },
      {
        name: "Measurement and review framework",
        description:
          "How the programme is judged, measured from the client's experience rather than from the desk's activity.",
      },
    ],
  },
  {
    engagement: "Lyfe Place Abuja Medical Campus",
    deliverables: [
      {
        name: "Feasibility study",
        description:
          "Whether the campus works. A draft exists in docs as Lyfe Place Abuja, Feasibility Study.",
      },
      {
        name: "Measured geometry and space allocation",
        description:
          "953.9 sqm gross against 664.3 net, superseding the 711 and 519 in the brief. The extra 145 sqm is corridor, so the rent roll is flat and setup costs more.",
      },
      {
        name: "Campus plan and financials",
        description:
          "The campus as six businesses in occupation rather than five rooms let. A draft exists in docs.",
      },
      {
        name: "Monthly financial model",
        description:
          "The authority on timing and funding: payback at 29 months rather than 21, peak funding of N718m rather than N598m, trough at month 15.",
      },
      {
        name: "Business plan and go to market",
        description:
          "How the campus fills, priced and sequenced. A draft exists in docs.",
      },
      {
        name: "Division plan, both versions",
        description:
          "Costed both ways, with and without CFA managing the conversion clinic. The choice is control rather than money: EBITDA differs by under N1m.",
      },
      {
        name: "Fee schedule",
        description:
          "Fees due to CFA across the four activities, with the incentive subordinated to the client's return of capital. A draft exists in docs.",
      },
      {
        name: "Investment summary",
        description:
          "The two page version for a principal who will not read the model.",
      },
    ],
  },
];

async function main() {
  let created = 0;
  let updated = 0;
  const problems: string[] = [];

  for (const spec of PLAN) {
    const matches = await prisma.engagement.findMany({
      where: { name: { contains: spec.engagement, mode: "insensitive" } },
      select: { id: true, name: true, endDate: true, client: { select: { name: true } } },
    });

    if (matches.length !== 1) {
      problems.push(
        `"${spec.engagement}" matched ${matches.length} engagements; skipped`,
      );
      continue;
    }
    const engagement = matches[0];
    console.log(`\n${engagement.client?.name ?? "-"} / ${engagement.name}`);

    for (const d of spec.deliverables) {
      const existing = await prisma.deliverable.findFirst({
        where: { engagementId: engagement.id, name: d.name },
        select: { id: true },
      });

      if (existing) {
        await prisma.deliverable.update({
          where: { id: existing.id },
          data: { description: d.description },
        });
        updated++;
        console.log(`  = ${d.name}`);
      } else {
        await prisma.deliverable.create({
          data: {
            engagementId: engagement.id,
            name: d.name,
            description: d.description,
            // Draft and internal. A director decides what this really is.
            status: "DRAFT",
            reviewStage: "DRAFT",
            clientVisible: false,
          },
        });
        created++;
        console.log(`  + ${d.name}`);
      }
    }
  }

  console.log(`\ncreated ${created}, updated ${updated}`);
  for (const p of problems) console.log(`PROBLEM: ${p}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
