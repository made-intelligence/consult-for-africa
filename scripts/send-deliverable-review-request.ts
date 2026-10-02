/**
 * Asks Matthew and Adediwura to review the deliverable structure now on every
 * live engagement, and to assign it out.
 *
 * Run: npx tsx --env-file=.env.local scripts/send-deliverable-review-request.ts
 * Add --dry to print without sending.
 */
import { PrismaClient } from "@prisma/client";
import { notifyInternal } from "../lib/email";

const prisma = new PrismaClient();
const DRY = process.argv.includes("--dry");

const RECIPIENTS = [
  "matthew.aloba@consultforafrica.com",
  "adediwura.okeleye@consultforafrica.com",
];

/** The eight that had nothing on them until now. */
const NEWLY_STRUCTURED = [
  "Medbury Division, Setup and Management",
  "Medlyfe Introduces, Launch Programme",
  "House of Refuge, Management Retainer and Fundraising",
  "Arabella Women's Health Diagnostic Audit",
  "Osteon Clinics Organisational Audit",
  "Aman HMO Lagos Provider Network Growth",
  "Belfiore Client Vault, Phase 1",
  "Lyfe Place Abuja Medical Campus",
];

async function main() {
  const base = process.env.NEXTAUTH_URL ?? "https://consultforafrica.com";

  const engagements = await prisma.engagement.findMany({
    where: { name: { in: NEWLY_STRUCTURED } },
    select: {
      id: true,
      name: true,
      client: { select: { name: true } },
      _count: { select: { deliverables: true } },
    },
    orderBy: { name: "asc" },
  });

  const totalNew = engagements.reduce((n, e) => n + e._count.deliverables, 0);
  const available = await prisma.consultantProfile.count({
    where: { availabilityStatus: "AVAILABLE" },
  });
  const unowned = await prisma.deliverable.count({ where: { assignmentId: null } });

  const rows = engagements
    .map(
      (e) => `<tr>
        <td style="padding:7px 0;border-bottom:1px solid #F1F3F7;color:#374151;font-size:14px;">
          ${e.name}<br><span style="color:#9CA3AF;font-size:12px;">${e.client?.name ?? ""}</span>
        </td>
        <td style="padding:7px 0;border-bottom:1px solid #F1F3F7;text-align:right;color:#0F2744;font-weight:600;font-size:14px;">
          ${e._count.deliverables}
        </td>
      </tr>`,
    )
    .join("");

  const html = `
    <p style="margin:0 0 16px;color:#111827;font-size:15px;line-height:1.6;">Matthew, Adediwura,</p>

    <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.7;">
      Eight of our live engagements were carrying no deliverables at all. The work
      was signed and invoiced, the bench was hired, and nothing on the platform
      connected the two. I have put a structure on all eight, drawn from the signed
      scope in each case: ${totalNew} deliverables across them.
    </p>

    <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.7;">
      All of it is draft and none of it is visible to any client. It is a starting
      point rather than an authority, and I would rather you cut and rename than
      inherit something that reads well and is wrong. Where I have inferred scope
      from a mandate document rather than from something agreed since, that is
      exactly where I would expect you to correct it.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <td style="padding:0 0 8px;color:#9CA3AF;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;">Engagement</td>
        <td style="padding:0 0 8px;text-align:right;color:#9CA3AF;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;">Deliverables</td>
      </tr>
      ${rows}
    </table>

    <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.7;">
      What I am asking for is a pass through each one to accept, amend or delete,
      and then to put names against them. There are ${available} consultants on the
      platform showing as available and ${unowned} deliverables with nobody attached,
      which is the gap worth closing first.
    </p>

    <p style="margin:0 0 24px;color:#374151;font-size:14px;line-height:1.7;">
      Start with Medbury Division and Medlyfe Introduces. Medlyfe has an event on
      8 October, so that one has the least room.
    </p>

    <p style="margin:0 0 28px;">
      <a href="${base}/deliverables"
         style="display:inline-block;background:#0F2744;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;font-size:14px;">
        Review the deliverables
      </a>
    </p>

    <p style="margin:0;color:#6B7280;font-size:13px;line-height:1.6;">
      One thing to sort out while you are in there, Adediwura: you have two accounts,
      a director account on your consultforafrica.com address and a consultant account
      on the gmail one. Tell me which to keep and I will close the other, otherwise
      assignments will start going to the wrong place.
    </p>
  `;

  const subject = `${totalNew} deliverables to review across eight engagements`;

  if (DRY) {
    console.log("TO:", RECIPIENTS.join(", "));
    console.log("SUBJECT:", subject);
    console.log(
      html
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    );
    return;
  }

  await notifyInternal(RECIPIENTS, subject, html);
  console.log(`sent to ${RECIPIENTS.join(", ")}`);
  console.log(`subject: ${subject}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
