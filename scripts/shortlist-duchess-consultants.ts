/**
 * Shortlist consultants on the CFA platform for the Duchess International
 * Hospital risk management engagement.
 *
 *   npx tsx --env-file=.env.local scripts/shortlist-duchess-consultants.ts
 *
 * Read only. Scores every consultant profile against the skills the Duchess
 * terms of reference actually call for, and prints the ranked shortlist.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const WEIGHTS: Array<[RegExp, number, string]> = [
  [/\bJCI\b|joint commission/i, 10, "JCI"],
  [/COHSASA|SafeCare/i, 9, "Accreditation standard"],
  [/clinical governance/i, 9, "Clinical governance"],
  [/patient safety/i, 8, "Patient safety"],
  [/quality improvement|quality management|quality assurance|\bQI\b/i, 8, "Quality"],
  [/risk management|risk register|enterprise risk/i, 8, "Risk"],
  [/accreditation/i, 7, "Accreditation"],
  [/clinical audit|internal audit/i, 6, "Audit"],
  [/compliance|regulatory|HEFAMAA|NHIA/i, 6, "Compliance"],
  [/infection (prevention|control)|IPC\b/i, 6, "IPC"],
  [/sterilis|sterili|CSSD/i, 5, "CSSD"],
  [/nursing|matron|CNO|director of nursing/i, 5, "Nursing leadership"],
  [/tertiary|teaching hospital|multi-?specialty/i, 5, "Tertiary"],
  [/root cause|RCA\b|FMEA/i, 5, "RCA / FMEA"],
  [/power ?bi|dashboard|analytics|data scien|business intelligence/i, 5, "Data / BI"],
  [/incident report/i, 5, "Incident reporting"],
  [/ISO ?31000|ISO ?9001/i, 5, "ISO"],
  [/CPHRM|certified professional in healthcare risk/i, 12, "CPHRM"],
  [/training|facilitat|curriculum/i, 3, "Training"],
];

async function main() {
  const all = await prisma.consultantProfile.findMany({
    include: { user: { select: { name: true, email: true, role: true } } },
  });
  console.log(`consultant profiles on the platform: ${all.length}\n`);

  const scored = all.map((p) => {
    const hay = [
      p.title, p.bio, p.primarySpecialty, p.specialtyCategory,
      (p.specialties || []).join(" "), (p.expertiseAreas || []).join(" "),
      (p.interests || []).join(" "), p.cvText || "",
    ].join("  ");
    let score = 0;
    const hits: string[] = [];
    for (const [re, w, label] of WEIGHTS) {
      if (re.test(hay)) { score += w; hits.push(label); }
    }
    if (p.yearsExperience >= 10) score += 4;
    else if (p.yearsExperience >= 7) score += 2;
    if (p.availabilityStatus === "AVAILABLE") score += 3;
    if (p.cvText) score += 2;
    return { p, score, hits };
  }).filter((s) => s.score > 0).sort((a, b) => b.score - a.score);

  console.log(`profiles with at least one relevant signal: ${scored.length}\n`);
  for (const { p, score, hits } of scored.slice(0, 20)) {
    console.log(`── ${p.user?.name ?? "(no name)"}   [score ${score}]`);
    console.log(`   ${p.title}  /  ${p.location}${p.isDiaspora ? "  /  diaspora" : ""}`);
    console.log(`   ${p.yearsExperience} yrs  /  tier ${p.tier}  /  ${p.availabilityStatus}  /  cv: ${p.cvText ? "yes" : "no"}`);
    console.log(`   signals: ${hits.join(", ")}`);
    if (p.primarySpecialty) console.log(`   primary: ${p.primarySpecialty}`);
    console.log("");
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
