/**
 * Create the non-clinical twin of every clinical item.
 *
 * A twin carries the same construct as the item it parallels and differs only
 * in the world the scenario happens in. That is a claim this script checks
 * rather than trusts:
 *
 *   - the original must exist, be tagged CLINICAL, and sit in the named module
 *   - the twin must carry the same number of options, mapped to the same
 *     dimensions in the same order, or the two forms stop scoring alike
 *   - the twin must not itself read clinically, which is the whole point
 *   - option lengths are compared, because an option noticeably longer or
 *     shorter than the one it parallels is not the same item any more
 *
 * Idempotent: an original that already has a twin is left alone.
 *
 *   npx tsx --env-file=.env.local scripts/seed-maarova-twins.ts
 *   npx tsx --env-file=.env.local scripts/seed-maarova-twins.ts --apply
 */
import { PrismaClient } from "@prisma/client";
import { readsClinically, clinicalTokensIn } from "@/lib/maarova/clinicalVocabulary";
import type { Twin } from "./maarova-twins/types";
import { DISC_TWINS } from "./maarova-twins/disc";
import { VALUES_TWINS } from "./maarova-twins/values";
import { EMOTIONAL_TWINS } from "./maarova-twins/emotional";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ALL_TWINS: Twin[] = [...DISC_TWINS, ...VALUES_TWINS, ...EMOTIONAL_TWINS];

/** Proportional length gap beyond which two options are not really parallel. */
const LENGTH_TOLERANCE = 0.6;

interface Problem {
  twin: string;
  issue: string;
}

async function main() {
  const problems: Problem[] = [];
  let created = 0;
  let skipped = 0;

  for (const twin of ALL_TWINS) {
    const original = await prisma.maarovaQuestion.findFirst({
      where: { text: twin.of, group: { module: { type: twin.module } } },
      include: { group: true },
    });

    if (!original) {
      problems.push({ twin: twin.text.slice(0, 70), issue: `no original matches this stem in ${twin.module}` });
      continue;
    }
    if (original.audience !== "CLINICAL") {
      problems.push({ twin: twin.text.slice(0, 70), issue: `original is tagged ${original.audience}, not CLINICAL` });
      continue;
    }

    // The twin must not read clinically, or nothing has been achieved.
    const twinBlob = twin.text + " " + (twin.options ?? []).map((o) => o.label).join(" ");
    if (readsClinically(twinBlob)) {
      problems.push({
        twin: twin.text.slice(0, 70),
        issue: `twin still reads clinically: ${clinicalTokensIn(twinBlob).join(", ")}`,
      });
      continue;
    }

    const originalOptions = (original.options ?? []) as { dimension?: string; label?: string }[];

    if (twin.options) {
      if (twin.options.length !== originalOptions.length) {
        problems.push({
          twin: twin.text.slice(0, 70),
          issue: `option count ${twin.options.length} does not match original ${originalOptions.length}`,
        });
        continue;
      }
      let mismatch = false;
      for (let i = 0; i < twin.options.length; i++) {
        const supplied = twin.options[i];
        const label = typeof supplied === "string" ? supplied : supplied.label;

        // When a twin spells out scoring keys, every one must match. When it
        // supplies only a label there is nothing to check: the seeder copies
        // the original's keys wholesale.
        if (typeof supplied !== "string") {
          const a = supplied.dimension ?? null;
          const b = (originalOptions[i] as { dimension?: string }).dimension ?? null;
          if (a !== b) {
            problems.push({
              twin: twin.text.slice(0, 70),
              issue: `option ${i + 1} maps to ${a}, original maps to ${b}`,
            });
            mismatch = true;
            break;
          }
        }

        const la = label.length;
        const lb = (originalOptions[i].label ?? "").length;
        if (lb > 0 && Math.abs(la - lb) / lb > LENGTH_TOLERANCE) {
          problems.push({
            twin: twin.text.slice(0, 70),
            issue: `option ${i + 1} is ${la} chars against the original's ${lb}, beyond tolerance`,
          });
          mismatch = true;
          break;
        }
      }
      if (mismatch) continue;
    }

    const alreadyTwinned = await prisma.maarovaQuestion.findFirst({
      where: { twinOfId: original.id },
      select: { id: true },
    });
    if (alreadyTwinned) {
      skipped++;
      continue;
    }

    if (APPLY) {
      await prisma.maarovaQuestion.create({
        data: {
          groupId: original.groupId,
          audience: "NON_CLINICAL",
          twinOfId: original.id,
          format: original.format,
          text: twin.text,
          // Replace the wording, keep every scoring key the original carried.
          options: (twin.options
            ? originalOptions.map((o, i) => {
                const supplied = twin.options![i];
                return { ...o, label: typeof supplied === "string" ? supplied : supplied.label };
              })
            : originalOptions) as object,
          dimension: original.dimension,
          subDimension: original.subDimension,
          isReversed: original.isReversed,
          weight: original.weight,
          order: original.order,
          isActive: true,
        },
      });
    }
    created++;
  }

  console.log(`\n  twins defined:        ${ALL_TWINS.length}`);
  console.log(`  ${APPLY ? "created" : "would create"}:      ${created}`);
  console.log(`  already present:      ${skipped}`);
  console.log(`  rejected:             ${problems.length}`);

  if (problems.length) {
    console.log("\n  PROBLEMS");
    for (const p of problems) console.log(`   - ${p.twin}\n       ${p.issue}`);
  }

  if (!APPLY) console.log("\n  DRY RUN. Nothing written.\n");
  else console.log("\n  Applied.\n");

  if (problems.length) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
