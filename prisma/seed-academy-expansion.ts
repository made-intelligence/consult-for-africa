/**
 * C4A TRAINING ACADEMY - EXPANSION (Oct 2026)
 *
 * Loads every file in prisma/academy-expansion/ and adds it to the Academy
 * WITHOUT deleting anything. The older seed-academy-*.ts files wipe all
 * enrolments and certificates first; never run those against production.
 *
 *  - New tracks are created; existing tracks are left as they are except for
 *    estimatedHours, which is recomputed from their modules.
 *  - New modules are appended after a track's existing modules. A module that
 *    already exists (by slug) has its content refreshed in place.
 *  - Questions are added only where the same question text is not already on
 *    the module, so the script is safe to run twice.
 *  - Every module's pass mark is set to PASS_MARK.
 *  - Every existing enrolment gets a progress row for each new module, open if
 *    the module before it is passed, locked otherwise. Certificates stand.
 *  - Domain, level, price, prerequisite and display order come from
 *    lib/academyDomains.ts for every track, so the curriculum map lives in one place.
 *
 * Run:
 *   npx tsx --env-file=.env prisma/seed-academy-expansion.ts            (dry run, validates only)
 *   npx tsx --env-file=.env prisma/seed-academy-expansion.ts --apply
 */

import { PrismaClient } from "@prisma/client";
import { readdirSync } from "fs";
import path from "path";
import type { Question, TrackExpansion } from "./academy-expansion/types";
import { ACADEMY_DOMAINS, ACADEMY_PRICES_NGN } from "../lib/academyDomains";

const PASS_MARK = 80;
const QUESTIONS_PER_MODULE = 10;

const prisma = new PrismaClient();
const apply = process.argv.includes("--apply");

async function loadExpansions(): Promise<{ file: string; x: TrackExpansion }[]> {
  const dir = path.join(__dirname, "academy-expansion");
  const files = readdirSync(dir).filter((f) => f.endsWith(".ts") && f !== "types.ts").sort();
  const out = [];
  for (const file of files) {
    const mod = await import(path.join(dir, file));
    out.push({ file, x: (mod.default ?? mod.expansion) as TrackExpansion });
  }
  return out;
}

function checkQuestion(q: Question, where: string, errors: string[]) {
  const type = q.type ?? "MULTIPLE_CHOICE";
  const correct = q.options.filter((o) => o.isCorrect).length;
  if (q.options.length < 4) errors.push(`${where}: fewer than 4 options`);
  if (new Set(q.options.map((o) => o.id)).size !== q.options.length) errors.push(`${where}: duplicate option ids`);
  if (type === "MULTIPLE_CHOICE" && correct !== 1) errors.push(`${where}: multiple choice needs exactly 1 correct, has ${correct}`);
  if (type === "MULTI_SELECT" && correct < 2) errors.push(`${where}: multi select needs 2+ correct, has ${correct}`);
  if (!q.explanation?.trim()) errors.push(`${where}: no explanation`);
}

/** House style: no em dashes anywhere in Academy copy. */
function checkCopy(text: string, where: string, errors: string[]) {
  if (text.includes("—")) errors.push(`${where}: contains an em dash`);
}

async function main() {
  const expansions = await loadExpansions();
  const errors: string[] = [];
  const seenSlugs = new Map<string, string>();
  const existingTracks = await prisma.trainingTrack.findMany({
    include: { modules: { include: { questions: { select: { question: true } } } } },
  });
  const trackBySlug = new Map(existingTracks.map((t) => [t.slug, t]));
  const moduleOwner = new Map(existingTracks.flatMap((t) => t.modules.map((m) => [m.slug, t.slug] as const)));

  // ── Validate everything before writing anything ──────────────────────────
  for (const { file, x } of expansions) {
    const existing = trackBySlug.get(x.slug);
    if (!existing && !x.track) errors.push(`${file}: track ${x.slug} does not exist and no track spec given`);
    if (existing && x.track) errors.push(`${file}: track ${x.slug} already exists, drop the track spec`);
    if (x.track) checkCopy(x.track.description, `${file} track`, errors);

    for (const t of x.topUp ?? []) {
      const m = existing?.modules.find((mm) => mm.slug === t.moduleSlug);
      if (!m) { errors.push(`${file}: top-up module ${t.moduleSlug} not on track ${x.slug}`); continue; }
      const total = m.questions.length + t.questions.length;
      if (total < QUESTIONS_PER_MODULE) errors.push(`${file}: ${t.moduleSlug} would have ${total} questions, needs ${QUESTIONS_PER_MODULE}`);
      t.questions.forEach((q, i) => { checkQuestion(q, `${file} ${t.moduleSlug} top-up q${i + 1}`, errors); checkCopy(JSON.stringify(q), `${file} ${t.moduleSlug} top-up q${i + 1}`, errors); });
    }
    for (const m of existing?.modules ?? []) {
      const added = x.topUp?.find((t) => t.moduleSlug === m.slug)?.questions.length ?? 0;
      if (m.questions.length + added < QUESTIONS_PER_MODULE) errors.push(`${file}: existing module ${m.slug} has ${m.questions.length + added} questions, needs a top-up to ${QUESTIONS_PER_MODULE}`);
    }

    for (const m of x.modules) {
      const where = `${file} ${m.slug}`;
      if (seenSlugs.has(m.slug)) errors.push(`${where}: slug also used in ${seenSlugs.get(m.slug)}`);
      seenSlugs.set(m.slug, file);
      const owner = moduleOwner.get(m.slug);
      if (owner && owner !== x.slug) errors.push(`${where}: slug already belongs to track ${owner}`);
      if (m.questions.length < QUESTIONS_PER_MODULE) errors.push(`${where}: ${m.questions.length} questions, needs ${QUESTIONS_PER_MODULE}`);
      if (m.content.sections.length < 3) errors.push(`${where}: fewer than 3 sections`);
      m.questions.forEach((q, i) => checkQuestion(q, `${where} q${i + 1}`, errors));
      checkCopy(JSON.stringify(m), where, errors);
    }
  }

  // Tracks this run does not touch still need their modules at 10 questions.
  const touched = new Set(expansions.map((e) => e.x.slug));
  for (const t of existingTracks) if (!touched.has(t.slug)) errors.push(`track ${t.slug} has no expansion file`);

  // Every track sits in exactly one domain.
  const mapped = ACADEMY_DOMAINS.flatMap((d) => [...d.foundation, ...d.paid.map((p) => p.slug)]);
  for (const slug of new Set(mapped)) if (mapped.filter((m) => m === slug).length > 1) errors.push(`track ${slug} is in more than one domain`);
  for (const slug of touched) if (!mapped.includes(slug)) errors.push(`track ${slug} is in no domain`);
  for (const slug of mapped) if (!touched.has(slug)) errors.push(`domain track ${slug} has no expansion file`);

  if (errors.length) {
    console.log(`${errors.length} problem(s):\n` + errors.map((e) => "  - " + e).join("\n"));
    if (apply) process.exitCode = 1;
    if (apply || errors.length) return;
  }

  const newModules = expansions.reduce((a, e) => a + e.x.modules.length, 0);
  const newQuestions = expansions.reduce(
    (a, e) => a + e.x.modules.reduce((b, m) => b + m.questions.length, 0) + (e.x.topUp ?? []).reduce((b, t) => b + t.questions.length, 0), 0);
  console.log(`Valid: ${expansions.length} files, ${expansions.filter((e) => e.x.track).length} new tracks, ${newModules} new modules, ${newQuestions} new questions.`);
  if (!apply) { console.log("Dry run. Pass --apply to write."); return; }

  // ── Write ────────────────────────────────────────────────────────────────
  for (const { x } of expansions) {
    let track = trackBySlug.get(x.slug) ?? null;
    if (!track && x.track) {
      const { priceNGN, discountPct, ...rest } = x.track;
      const created = await prisma.trainingTrack.create({
        data: { ...rest, slug: x.slug, priceNGN: priceNGN ?? null, discountPct: discountPct ?? null, estimatedHours: 1 },
      });
      track = { ...created, modules: [] };
      console.log(`+ track ${x.slug}`);
    }
    if (!track) continue;

    for (const t of x.topUp ?? []) {
      const m = track.modules.find((mm) => mm.slug === t.moduleSlug)!;
      await addQuestions(m.id, t.questions);
    }

    let order = track.modules.reduce((a, m) => Math.max(a, m.order), 0);
    for (const m of x.modules) {
      const data = {
        name: m.name,
        description: m.description,
        estimatedMinutes: m.estimatedMinutes,
        content: m.content,
        resources: m.resources ?? undefined,
      };
      const existing = await prisma.trainingModule.findUnique({ where: { slug: m.slug } });
      const saved = existing
        ? await prisma.trainingModule.update({ where: { id: existing.id }, data })
        : await prisma.trainingModule.create({ data: { ...data, slug: m.slug, trackId: track.id, order: ++order } });
      await addQuestions(saved.id, m.questions);
    }

    await prisma.trainingModule.updateMany({ where: { trackId: track.id }, data: { passingScore: PASS_MARK } });
    const mins = await prisma.trainingModule.aggregate({ where: { trackId: track.id, isActive: true }, _sum: { estimatedMinutes: true } });
    await prisma.trainingTrack.update({
      where: { id: track.id },
      data: { estimatedHours: Math.max(1, Math.round((mins._sum.estimatedMinutes ?? 0) / 60)) },
    });

    await backfillProgress(track.id);
    console.log(`= ${x.slug}`);
  }

  // Domain map: category, level, price, prerequisite and order for every track.
  let sortOrder = 0;
  for (const d of ACADEMY_DOMAINS) {
    for (const slug of d.foundation) {
      await prisma.trainingTrack.update({
        where: { slug },
        data: { category: d.key, level: "FOUNDATION", pricingType: "FREE", priceNGN: null, prerequisites: [], sortOrder: ++sortOrder },
      });
    }
    for (const p of d.paid) {
      await prisma.trainingTrack.update({
        where: { slug: p.slug },
        data: { category: d.key, level: p.level, pricingType: "PAID", priceNGN: ACADEMY_PRICES_NGN[p.level], prerequisites: [d.foundation[0]], sortOrder: ++sortOrder },
      });
    }
  }
  console.log("Domain map applied.");
}

async function addQuestions(moduleId: string, questions: Question[]) {
  const have = await prisma.trainingQuestion.findMany({ where: { moduleId }, select: { question: true, order: true } });
  const texts = new Set(have.map((q) => q.question.trim()));
  let order = have.reduce((a, q) => Math.max(a, q.order), 0);
  const fresh = questions.filter((q) => !texts.has(q.question.trim()));
  if (!fresh.length) return;
  await prisma.trainingQuestion.createMany({
    data: fresh.map((q) => ({
      moduleId,
      type: q.type ?? "MULTIPLE_CHOICE",
      question: q.question,
      options: JSON.stringify(q.options),
      explanation: q.explanation,
      points: q.points ?? 1,
      order: ++order,
    })),
  });
}

/** Give every enrolment on the track a progress row for each module it lacks. */
async function backfillProgress(trackId: string) {
  const modules = await prisma.trainingModule.findMany({ where: { trackId, isActive: true }, orderBy: { order: "asc" } });
  const enrolments = await prisma.trainingEnrollment.findMany({ where: { trackId }, include: { moduleProgress: true } });
  for (const e of enrolments) {
    const byModule = new Map(e.moduleProgress.map((p) => [p.moduleId, p]));
    for (let i = 0; i < modules.length; i++) {
      if (byModule.has(modules[i].id)) continue;
      const prev = i > 0 ? byModule.get(modules[i - 1].id) : null;
      const status = i === 0 || prev?.status === "COMPLETED" ? "AVAILABLE" : "LOCKED";
      const row = await prisma.moduleProgress.create({ data: { enrollmentId: e.id, moduleId: modules[i].id, status } });
      byModule.set(modules[i].id, row);
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
