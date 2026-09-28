/**
 * Tag the existing Maarova bank by audience.
 *
 * Every item written so far assumes a clinician, because the clinical form is
 * the only form that has ever existed. This marks which items are genuinely
 * role neutral and can stay as they are, and which are clinical and therefore
 * need a non-clinical twin written for them.
 *
 * Nothing is rewritten here and no item is deactivated. Tagging only.
 *
 *   npx tsx --env-file=.env.local scripts/maarova-tag-clinical-items.ts
 *   npx tsx --env-file=.env.local scripts/maarova-tag-clinical-items.ts --apply
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

/** Vocabulary that only makes sense if the reader practises clinically. */
const CLINICAL = new RegExp(
  [
    "patient", "patients", "clinical", "clinician", "clinicians", "ward", "wards",
    "nurse", "nurses", "nursing", "doctor", "doctors", "physician", "consultant",
    "registrar", "theatre", "surgery", "surgical", "diagnos\\w*", "rounds",
    "bedside", "triage", "medication", "prescrib\\w*", "mortality", "morbidity",
    "scrub", "handover", "on-call", "shift", "A&E", "ICU", "NICU", "outpatient",
    "inpatient", "medicine", "care team", "duty of care",
  ].join("|"),
  "i"
);

/**
 * Items that trip the vocabulary check but describe the *institution* rather
 * than the respondent. A hospital has patient throughput whoever is answering,
 * so an HR director can answer these about her own organisation without being
 * a clinician. Matched on a distinctive fragment rather than the full text.
 */
const INSTITUTIONAL = [
  "early adopters of digital health tools",
  "strong focus on patient throughput",
  "measured by patient volumes",
];

function isInstitutional(text: string) {
  return INSTITUTIONAL.some((frag) => text.includes(frag));
}

/** Does the item read clinically, in its stem or in any of its options? */
function readsClinically(text: string, options: unknown): boolean {
  if (CLINICAL.test(text)) return true;
  if (Array.isArray(options)) {
    for (const o of options) {
      const label = (o as { label?: string })?.label;
      if (typeof label === "string" && CLINICAL.test(label)) return true;
    }
  }
  return false;
}

async function main() {
  const modules = await prisma.maarovaModule.findMany({
    orderBy: { order: "asc" },
    include: { questionGroups: { include: { questions: { orderBy: { order: "asc" } } } } },
  });

  let clinical = 0;
  let neutral = 0;
  let institutionalKept = 0;
  const perModule: Record<string, { clinical: number; total: number }> = {};

  for (const m of modules) {
    const questions = m.questionGroups.flatMap((g) => g.questions);
    perModule[m.type] = { clinical: 0, total: questions.length };

    // The identity module is clinical by design. Its twin is a separate module.
    const moduleIsClinical = m.type === "CILTI";
    if (APPLY) {
      await prisma.maarovaModule.update({
        where: { id: m.id },
        data: { audience: moduleIsClinical ? "CLINICAL" : "BOTH" },
      });
    }

    for (const q of questions) {
      const institutional = isInstitutional(q.text);
      const isClinical =
        moduleIsClinical || (!institutional && readsClinically(q.text, q.options));

      if (institutional && readsClinically(q.text, q.options)) institutionalKept++;
      if (isClinical) {
        clinical++;
        perModule[m.type].clinical++;
      } else {
        neutral++;
      }

      if (APPLY) {
        await prisma.maarovaQuestion.update({
          where: { id: q.id },
          data: { audience: isClinical ? "CLINICAL" : "BOTH" },
        });
      }
    }
  }

  for (const [type, c] of Object.entries(perModule)) {
    console.log(`  ${type.padEnd(18)} clinical ${String(c.clinical).padStart(3)} / ${c.total}`);
  }
  console.log(`
  CLINICAL (needs a non-clinical twin written):  ${clinical}
  BOTH     (role neutral, serves both tracks):   ${neutral}
  kept as BOTH because they describe the institution rather than the respondent: ${institutionalKept}`);

  // Every existing session was served the clinical form, since it is the only
  // one that has existed. Recording that is what keeps the responses readable.
  const sessions = await prisma.maarovaAssessmentSession.count();
  const users = await prisma.maarovaUser.count();
  console.log(`\n  Sessions already defaulted to CLINICAL by the migration: ${sessions}`);
  console.log(`  Users with no track recorded yet (will be asked once): ${users}`);

  if (!APPLY) console.log("\n  DRY RUN. Nothing written.\n");
  else console.log("\n  Applied.\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
