/**
 * Seed Arabella's training (lib/arabella-modules.ts) into the Protocol library,
 * with its questions.
 *
 * Nothing reaches staff from this script. New modules land with approvedAt
 * NULL; Dr Chito (canApproveClinical) approves each one in the app at
 * /ArabellaStaff/learn/approve. Even approved, a module reaches staff only from
 * its week's Monday (startsOn = weekStart(week), lib/arabella-plan.ts).
 *
 * Idempotent, by (clientId, code). The same rules as seed-haven-sop-modules.ts:
 *   - new module: inserted at version 1, unapproved
 *   - unchanged module: left alone, approval kept
 *   - changed module (title, summary, body or questions): version bumped and
 *     approval cleared, so an edit never inherits the sign-off. A send-back
 *     note is cleared too: the revision is the answer to it, and it goes back
 *     into Dr Chito's queue.
 * Labels (domain, roles, departments, method, frequency, startsOn) are kept in
 * step without touching the version or the approval.
 * Never deletes a module or anybody's progress. Progress rows go stale against
 * a new version on their own.
 *
 * The dry run also prints every module Dr Chito has sent back, with her note,
 * so the revision can be written before re-running.
 *
 * Needs migration 20261109120000_arabella_training (Protocol.startsOn,
 * Protocol.sentBackAt) applied first.
 *
 *   npx tsx --env-file=.env scripts/seed-arabella-modules.ts            dry run, prints the plan
 *   npx tsx --env-file=.env scripts/seed-arabella-modules.ts --apply    writes
 */
import { randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";
import { ARABELLA } from "../lib/staffSites";
import { weekStart } from "../lib/arabella-plan";
import { ARABELLA_MODULES, type ArabellaModule, type SopQuestion } from "../lib/arabella-modules";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const cuid = () => "c" + randomBytes(12).toString("hex");

type ExistingProtocol = {
  id: string;
  title: string;
  summary: string;
  body: string | null;
  version: number;
  approvedAt: Date | null;
  sentBackAt: Date | null;
  approvalNote: string | null;
};

type ExistingQuestion = {
  question: string;
  options: string[];
  correct: number;
  because: string | null;
  sortOrder: number;
};

function sameQuestions(a: ExistingQuestion[], b: SopQuestion[]): boolean {
  if (a.length !== b.length) return false;
  const sorted = [...a].sort((x, y) => x.sortOrder - y.sortOrder);
  return sorted.every(
    (q, i) =>
      q.question === b[i].question &&
      q.correct === b[i].correct &&
      (q.because ?? "") === b[i].because &&
      q.options.length === b[i].options.length &&
      q.options.every((o, j) => o === b[i].options[j]),
  );
}

function validate(m: ArabellaModule) {
  if (m.questions.length < 4 || m.questions.length > 6) throw new Error(`${m.code}: ${m.questions.length} questions`);
  if (m.week < 1 || m.week > 12) throw new Error(`${m.code}: week ${m.week}`);
  for (const q of m.questions) {
    if (q.correct < 0 || q.correct >= q.options.length) throw new Error(`${m.code}: bad correct index on "${q.question}"`);
  }
}

async function replaceQuestions(protocolId: string, qs: SopQuestion[]) {
  await prisma.$executeRaw`DELETE FROM "ProtocolQuestion" WHERE "protocolId" = ${protocolId}`;
  for (const [i, q] of qs.entries()) {
    await prisma.$executeRaw`
      INSERT INTO "ProtocolQuestion" ("id","protocolId","question","options","correct","because","sortOrder")
      VALUES (${cuid()}, ${protocolId}, ${q.question}, ${q.options}, ${q.correct}, ${q.because}, ${i})`;
  }
}

async function main() {
  const codes = new Set<string>();
  for (const m of ARABELLA_MODULES) {
    validate(m);
    if (codes.has(m.code)) throw new Error(`Duplicate code ${m.code}`);
    codes.add(m.code);
  }

  const clientId = ARABELLA.clientId!;
  const c = await prisma.$queryRaw<{ name: string }[]>`SELECT "name" FROM "Client" WHERE "id" = ${clientId} LIMIT 1`;
  if (!c.length) throw new Error(`No client ${clientId}`);
  console.log(`${APPLY ? "APPLYING" : "DRY RUN"} for ${c[0].name}\n`);

  const tally = { created: 0, unchanged: 0, revised: 0, approvalCleared: 0 };
  const sentBack: string[] = [];

  for (const m of [...ARABELLA_MODULES].sort((a, b) => a.week - b.week)) {
    const startsOn = weekStart(m.week);
    const found = await prisma.$queryRaw<ExistingProtocol[]>`
      SELECT "id","title","summary","body","version","approvedAt","sentBackAt","approvalNote"
      FROM "Protocol" WHERE "clientId" = ${clientId} AND "code" = ${m.code} LIMIT 1`;

    if (!found.length) {
      tally.created++;
      console.log(`  + wk${String(m.week).padStart(2)} ${startsOn.toISOString().slice(0, 10)}  ${m.code}  ${m.title}  (${m.questions.length} questions)`);
      if (APPLY) {
        const id = cuid();
        await prisma.$executeRaw`
          INSERT INTO "Protocol" ("id","clientId","code","domain","title","summary","body","version","roles","departments","method","frequency","startsOn","isActive","createdAt","updatedAt")
          VALUES (${id}, ${clientId}, ${m.code}, ${m.domain}, ${m.title}, ${m.summary}, ${m.body}, 1,
                  ${m.roles}, ${m.departments}, ${m.method}, ${m.frequency}, ${startsOn}, true, NOW(), NOW())`;
        await replaceQuestions(id, m.questions);
      }
      continue;
    }

    const p = found[0];
    const qs = await prisma.$queryRaw<ExistingQuestion[]>`
      SELECT "question","options","correct","because","sortOrder"
      FROM "ProtocolQuestion" WHERE "protocolId" = ${p.id}`;
    const contentChanged = p.title !== m.title || p.summary !== m.summary || (p.body ?? "") !== m.body;
    const questionsChanged = !sameQuestions(qs, m.questions);

    if (p.sentBackAt && !contentChanged && !questionsChanged) {
      sentBack.push(`  ${m.code}  ${m.title}\n      "${p.approvalNote ?? ""}"`);
    }

    if (APPLY) {
      await prisma.$executeRaw`
        UPDATE "Protocol" SET "domain" = ${m.domain}, "roles" = ${m.roles}, "departments" = ${m.departments},
          "method" = ${m.method}, "frequency" = ${m.frequency}, "startsOn" = ${startsOn}, "isActive" = true, "updatedAt" = NOW()
        WHERE "id" = ${p.id}`;
    }

    if (!contentChanged && !questionsChanged) {
      tally.unchanged++;
      continue;
    }

    tally.revised++;
    if (p.approvedAt) tally.approvalCleared++;
    console.log(
      `  ~ ${m.code}  v${p.version} -> v${p.version + 1}${p.approvedAt ? "  APPROVAL CLEARED" : ""}${p.sentBackAt ? "  answers a send-back" : ""}` +
        `${contentChanged ? "  content" : ""}${questionsChanged ? "  questions" : ""}`,
    );
    if (APPLY) {
      await prisma.$executeRaw`
        UPDATE "Protocol" SET "title" = ${m.title}, "summary" = ${m.summary}, "body" = ${m.body},
          "version" = "version" + 1, "approvedAt" = NULL, "approvedById" = NULL, "approvalNote" = NULL,
          "sentBackAt" = NULL, "updatedAt" = NOW()
        WHERE "id" = ${p.id}`;
      if (questionsChanged) await replaceQuestions(p.id, m.questions);
    }
  }

  const totalQuestions = ARABELLA_MODULES.reduce((n, m) => n + m.questions.length, 0);
  console.log(
    `\n  ${ARABELLA_MODULES.length} modules, ${totalQuestions} questions. ` +
      `${tally.created} new, ${tally.revised} revised (${tally.approvalCleared} lose approval), ${tally.unchanged} unchanged.`,
  );
  if (sentBack.length) console.log(`\n  Sent back by the approver, not yet revised:\n${sentBack.join("\n")}`);
  console.log(APPLY ? "\n  Written. Every new or revised module waits for Dr Chito's approval." : "\n  DRY RUN. Nothing written. Re-run with --apply.");
}

main()
  .catch((e) => {
    console.error(String(e));
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
