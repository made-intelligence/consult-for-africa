/**
 * Build the Professional-to-Leadership Identity module, the non-clinical twin
 * of Clinical-to-Leadership Identity.
 *
 * CILTI measures the move from being excellent at the work to being
 * responsible for people who do the work. That construct is not clinical. A
 * lawyer who now runs human resources made the same transition, mourns the
 * same loss of craft, and is viewed with the same suspicion by the colleagues
 * she came from.
 *
 * So this is a parallel module rather than a rewrite:
 *
 *   - the same four dimensions, in the same order, six items each
 *   - the same dimension keys, so scoreCILTI and the composite score it
 *     without modification and the two tracks stay comparable
 *   - the same reversed items in the same positions
 *   - the same Likert-7 options and scoringConfig
 *
 * The first dimension keeps the key clinical_identity while being displayed as
 * Professional Identity. The key is an internal identifier and changing it
 * would fork the scoring for no measurement gain.
 *
 *   npx tsx --env-file=.env.local scripts/seed-maarova-plti.ts
 *   npx tsx --env-file=.env.local scripts/seed-maarova-plti.ts --apply
 */
import { PrismaClient } from "@prisma/client";
import { readsClinically, clinicalTokensIn } from "@/lib/maarova/clinicalVocabulary";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

interface GroupSpec {
  name: string;
  description: string;
  dimension: string;
  /** Item text, and whether it is reverse scored. Order is significant. */
  items: { text: string; reversed?: boolean }[];
}

const GROUPS: GroupSpec[] = [
  {
    name: "Professional Identity",
    description: "How strongly you identify with the discipline you trained in.",
    dimension: "clinical_identity",
    items: [
      { text: "My identity as a specialist in my own discipline is central to who I am, regardless of any leadership title I hold." },
      { text: "I feel most competent and confident when I am doing the technical work of my profession myself." },
      { text: "I would feel a profound sense of loss if I had to give up practising my profession entirely for a general management role." },
      { text: "I struggle to see myself as a leader when I am away from the technical work I was trained to do.", reversed: true },
      { text: "When colleagues introduce me, I prefer they use my professional title rather than my administrative one." },
      { text: "My professional training in Africa has shaped my values more than any leadership programme I have attended." },
    ],
  },
  {
    name: "Leadership Identity",
    description: "How strongly you have embraced your identity as an organisational leader.",
    dimension: "leadership_identity",
    items: [
      { text: "I see myself as a leader first, even though my background is in a specialist discipline." },
      { text: "I derive as much satisfaction from strategic planning as from solving problems in my own field." },
      { text: "I am comfortable making decisions that affect the whole organisation, not just my own function." },
      { text: "I actively seek opportunities to develop my leadership skills through formal training and coaching." },
      { text: "I can advocate for organisational priorities even when they conflict with the interests of my own profession." },
      { text: "Other people see me as a natural leader, and I have come to accept and embrace that perception." },
    ],
  },
  {
    name: "Transition Readiness",
    description: "How prepared you feel to move deeper into healthcare leadership.",
    dimension: "transition_readiness",
    items: [
      { text: "I am ready to take on a more senior leadership role, even if it means less time practising my own profession." },
      { text: "I have a clear understanding of the competencies required to lead a healthcare organisation effectively." },
      { text: "I have mentors or role models who have successfully navigated the specialist-to-leader transition in Africa." },
      { text: "I feel confident managing hospital finances, budgets, and resource allocation." },
      { text: "I can navigate the political dynamics of healthcare governance in my country without compromising my integrity." },
      { text: "I have a personal development plan that addresses the gaps between my current abilities and the demands of senior healthcare leadership." },
    ],
  },
  {
    name: "Identity Friction",
    description: "The tension you experience between your professional and leadership identities.",
    dimension: "identity_friction",
    items: [
      { text: "I often feel pulled between the work of my own profession and my leadership duties." },
      { text: "Colleagues from my own profession sometimes view my leadership role with suspicion, as if I have 'crossed to the other side'." },
      { text: "I feel guilty when administrative tasks take me away from the work I was trained to do." },
      { text: "I have successfully integrated my professional expertise and my leadership role into a coherent identity.", reversed: true },
      { text: "The health sector in my country does not adequately recognise or support the specialist-to-leader transition." },
      { text: "I sometimes feel like an imposter in leadership meetings because my primary training was technical rather than managerial.", reversed: true },
    ],
  },
];

async function main() {
  const cilti = await prisma.maarovaModule.findFirst({
    where: { type: "CILTI" },
    include: { questionGroups: { orderBy: { order: "asc" }, include: { questions: { orderBy: { order: "asc" } } } } },
  });
  if (!cilti) throw new Error("CILTI module not found");

  // Every item must actually be non-clinical, or the module is pointless.
  const offenders = GROUPS.flatMap((g) =>
    g.items.filter((i) => readsClinically(i.text)).map((i) => ({ g: g.name, t: i.text, tok: clinicalTokensIn(i.text) }))
  );
  if (offenders.length) {
    for (const o of offenders) console.log(`  READS CLINICALLY [${o.g}] ${o.tok.join(", ")}\n    ${o.t}`);
    throw new Error(`${offenders.length} PLTI items still read clinically`);
  }

  // Structural parity with the module it parallels.
  if (GROUPS.length !== cilti.questionGroups.length) {
    throw new Error(`group count ${GROUPS.length} does not match CILTI's ${cilti.questionGroups.length}`);
  }
  for (let i = 0; i < GROUPS.length; i++) {
    const mine = GROUPS[i];
    const theirs = cilti.questionGroups[i];
    if (mine.items.length !== theirs.questions.length) {
      throw new Error(`group "${mine.name}" has ${mine.items.length} items, CILTI's has ${theirs.questions.length}`);
    }
    if (mine.dimension !== theirs.questions[0].dimension) {
      throw new Error(`group "${mine.name}" is dimension ${mine.dimension}, CILTI's is ${theirs.questions[0].dimension}`);
    }
    for (let j = 0; j < mine.items.length; j++) {
      if (Boolean(mine.items[j].reversed) !== theirs.questions[j].isReversed) {
        throw new Error(`item ${j + 1} of "${mine.name}" differs on reverse scoring from its counterpart`);
      }
    }
  }
  console.log("  Structural parity with CILTI: groups, item counts, dimensions and reversals all match.");

  const existing = await prisma.maarovaModule.findFirst({ where: { type: "PLTI" }, select: { id: true } });
  if (existing) {
    console.log("  PLTI already exists. Nothing to do.");
    return;
  }

  console.log(`  ${APPLY ? "Creating" : "Would create"} PLTI: ${GROUPS.length} groups, ${GROUPS.reduce((n, g) => n + g.items.length, 0)} items`);
  if (!APPLY) {
    console.log("\n  DRY RUN. Nothing written.\n");
    return;
  }

  const likertOptions = cilti.questionGroups[0].questions[0].options as object;

  const module = await prisma.maarovaModule.create({
    data: {
      type: "PLTI",
      audience: "NON_CLINICAL",
      name: "Professional-to-Leadership Identity",
      slug: "plti",
      description:
        "Likert-7 measure of how you are navigating the transition from specialist practitioner to leader, including identity friction and transition readiness.",
      order: cilti.order,
      estimatedMinutes: cilti.estimatedMinutes,
      scoringConfig: cilti.scoringConfig as object,
      isActive: true,
    },
  });

  for (let gi = 0; gi < GROUPS.length; gi++) {
    const spec = GROUPS[gi];
    const source = cilti.questionGroups[gi];
    const group = await prisma.maarovaQuestionGroup.create({
      data: {
        moduleId: module.id,
        name: spec.name,
        description: spec.description,
        order: source.order,
      },
    });
    for (let qi = 0; qi < spec.items.length; qi++) {
      const item = spec.items[qi];
      const counterpart = source.questions[qi];
      await prisma.maarovaQuestion.create({
        data: {
          groupId: group.id,
          audience: "NON_CLINICAL",
          twinOfId: counterpart.id,
          format: counterpart.format,
          text: item.text,
          options: likertOptions,
          dimension: spec.dimension,
          subDimension: counterpart.subDimension,
          isReversed: Boolean(item.reversed),
          weight: counterpart.weight,
          order: counterpart.order,
          isActive: true,
        },
      });
    }
  }

  console.log("\n  Applied.\n");
}

main()
  .catch((e) => {
    console.error(String(e));
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
