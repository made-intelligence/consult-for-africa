/**
 * Seed Haven's SOP and core training modules (lib/haven-sop-modules.ts) into
 * the Protocol library, with their questions.
 *
 * Nothing reaches staff from this script. New modules land with approvedAt
 * NULL and stay invisible on the staff page until a clinician approves them
 * (Dr Odedina, or anyone with canApproveClinical).
 *
 * Idempotent, by (clientId, code):
 *   - new module: inserted at version 1, unapproved
 *   - unchanged module: left alone, approval kept
 *   - changed module (title, summary, body or questions): version bumped and
 *     approval cleared, as the schema comment on Protocol.version requires, so
 *     an edit can never inherit the previous sign-off. ProtocolProgress rows
 *     go stale against the new version on their own.
 * Questions are replaced only when they changed.
 *
 * Raw SQL, parameterised, for the same reason as seed-haven-protocols.ts: the
 * generated client in a worktree is routinely a branch behind.
 *
 *   npx tsx --env-file=.env scripts/seed-haven-sop-modules.ts            dry run, prints the plan
 *   npx tsx --env-file=.env scripts/seed-haven-sop-modules.ts --apply    writes
 */
import { randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";
import { SOP_MODULES, type SopModule, type SopQuestion } from "../lib/haven-sop-modules";

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

function validate(m: SopModule) {
  if (m.questions.length < 4 || m.questions.length > 6) throw new Error(`${m.code}: ${m.questions.length} questions`);
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
  for (const m of SOP_MODULES) {
    validate(m);
    if (codes.has(m.code)) throw new Error(`Duplicate code ${m.code}`);
    codes.add(m.code);
  }

  const c = await prisma.$queryRaw<{ id: string }[]>`
    SELECT "id" FROM "Client" WHERE "name" = 'Haven Paediatric Centre' LIMIT 1`;
  if (!c.length) throw new Error("No Haven client.");
  const clientId = c[0].id;

  const tally = { created: 0, unchanged: 0, revised: 0, approvalCleared: 0 };

  for (const m of SOP_MODULES) {
    const found = await prisma.$queryRaw<ExistingProtocol[]>`
      SELECT "id","title","summary","body","version","approvedAt"
      FROM "Protocol" WHERE "clientId" = ${clientId} AND "code" = ${m.code} LIMIT 1`;

    if (!found.length) {
      tally.created++;
      console.log(`  + ${m.code}  ${m.title}  (${m.questions.length} questions)`);
      if (APPLY) {
        const id = cuid();
        await prisma.$executeRaw`
          INSERT INTO "Protocol" ("id","clientId","code","domain","title","summary","body","version","roles","departments","method","frequency","isActive","createdAt","updatedAt")
          VALUES (${id}, ${clientId}, ${m.code}, ${m.domain}, ${m.title}, ${m.summary}, ${m.body}, 1,
                  ${m.roles}, ${m.departments}, ${m.method}, ${m.frequency}, true, NOW(), NOW())`;
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

    // Labels that are not content (domain, roles, method, frequency) are kept
    // in step without touching the version or the approval.
    if (APPLY) {
      await prisma.$executeRaw`
        UPDATE "Protocol" SET "domain" = ${m.domain}, "roles" = ${m.roles}, "departments" = ${m.departments},
          "method" = ${m.method}, "frequency" = ${m.frequency}, "isActive" = true, "updatedAt" = NOW()
        WHERE "id" = ${p.id}`;
    }

    if (!contentChanged && !questionsChanged) {
      tally.unchanged++;
      continue;
    }

    tally.revised++;
    if (p.approvedAt) tally.approvalCleared++;
    console.log(
      `  ~ ${m.code}  v${p.version} -> v${p.version + 1}${p.approvedAt ? "  APPROVAL CLEARED" : ""}` +
        `${contentChanged ? "  content" : ""}${questionsChanged ? "  questions" : ""}`,
    );
    if (APPLY) {
      await prisma.$executeRaw`
        UPDATE "Protocol" SET "title" = ${m.title}, "summary" = ${m.summary}, "body" = ${m.body},
          "version" = "version" + 1, "approvedAt" = NULL, "approvedById" = NULL, "approvalNote" = NULL,
          "updatedAt" = NOW()
        WHERE "id" = ${p.id}`;
      if (questionsChanged) await replaceQuestions(p.id, m.questions);
    }
  }

  const totalQuestions = SOP_MODULES.reduce((n, m) => n + m.questions.length, 0);
  console.log(
    `\n  ${SOP_MODULES.length} modules, ${totalQuestions} questions. ` +
      `${tally.created} new, ${tally.revised} revised (${tally.approvalCleared} lose approval), ${tally.unchanged} unchanged.`,
  );
  console.log(APPLY ? "  Written. Every new or revised module waits for clinical approval." : "  DRY RUN. Re-run with --apply.");
}

main()
  .catch((e) => {
    console.error(String(e));
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
