/**
 * Prove the Arabella survey endpoint end to end before a single link is sent.
 *
 *   npx tsx --env-file=.env.local scripts/verify-arabella-survey-endpoint.ts --local
 *   npx tsx --env-file=.env.local scripts/verify-arabella-survey-endpoint.ts
 *   npx tsx --env-file=.env.local scripts/verify-arabella-survey-endpoint.ts --dry
 *
 * A live page can sit in front of a dead endpoint and a 200 can sit in front of
 * a handler that stored nothing, so this fills each of the four forms and posts
 * what the browser would actually have sent, reads the row back out of the
 * database, asserts the payload survived the round trip, and deletes every row
 * it created.
 *
 * The payload is built by loading the real HTML in a DOM and filling its real
 * inputs, rather than from a hand-written fixture. A fixture drifts from the
 * form the moment somebody edits a question; this cannot, because the form is
 * the fixture.
 *
 * Seed rows carry `__seed: true` inside the payload, which is how they are found
 * again and removed. Nothing else is touched. --dry builds the payloads and
 * prints what would be sent without posting anything.
 */

import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { prisma } from "../lib/prisma";

const LOCAL = process.argv.includes("--local");
const DRY = process.argv.includes("--dry");
const BASE = LOCAL ? "http://localhost:3000" : "https://www.consultforafrica.com";
const ENDPOINT = `${BASE}/api/arabella-audit/responses`;

const FORMS = [
  "public/arabella-staff-survey.html",
  "public/arabella-patient-survey.html",
  "public/arabella-referrer-survey.html",
  "public/arabella-leadership-survey.html",
];

type Filled = { slug: string; file: string; responses: Record<string, string> };

/** Fill every control the way a thorough respondent would, then read it back off the form. */
function fill(file: string): Filled {
  const dom = new JSDOM(readFileSync(file, "utf8"), { runScripts: "dangerously" });
  const { document } = dom.window;
  const form = document.getElementById("survey") as HTMLFormElement | null;
  if (!form) throw new Error(`${file}: no form element`);

  const slug = (readFileSync(file, "utf8").match(/const SLUG = "([^"]+)"/) ?? [])[1];
  if (!slug) throw new Error(`${file}: no slug`);

  // radios: one per group, mixing in the N/A option so that path is exercised too
  const groups = new Map<string, HTMLInputElement[]>();
  form.querySelectorAll<HTMLInputElement>("input[type=radio]").forEach((el) => {
    const list = groups.get(el.name) ?? [];
    list.push(el);
    groups.set(el.name, list);
  });
  let g = 0;
  for (const [, list] of groups) {
    list[g++ % 7 === 0 ? list.length - 1 : g % list.length].checked = true;
  }

  form.querySelectorAll<HTMLInputElement>("input[type=checkbox]").forEach((el, i) => {
    if (i % 3 === 0) el.checked = true;
  });

  form.querySelectorAll<HTMLSelectElement>("select").forEach((el) => {
    const real = [...el.options].find((o) => o.value !== "");
    if (real) el.value = real.value;
  });

  form.querySelectorAll<HTMLTextAreaElement>("textarea").forEach((el) => {
    el.value = `seed answer for ${el.name}`;
  });

  form.querySelectorAll<HTMLInputElement>("input[type=text]").forEach((el) => {
    el.value = el.name === "respondent" ? "Seed Respondent" : `seed ${el.name}`;
  });

  // the constant sum has to actually add to 100 or the form would refuse to send
  const splits = [...form.querySelectorAll<HTMLInputElement>('input[type=number][name^="split_"]')];
  if (splits.length) {
    const each = Math.floor(100 / splits.length);
    splits.forEach((el, i) => {
      el.value = String(i === 0 ? 100 - each * (splits.length - 1) : each);
    });
  }

  // exactly what the form's own submit handler builds
  const responses: Record<string, string> = { __seed: "true" };
  const fd = new dom.window.FormData(form);
  fd.forEach((v: unknown, k: string) => {
    const s = String(v);
    responses[k] = responses[k] === undefined ? s : `${responses[k]}; ${s}`;
  });

  const total = splits.length ? splits.reduce((a, el) => a + Number(el.value), 0) : null;
  if (total !== null && total !== 100) throw new Error(`${file}: seeded split adds to ${total}`);

  return { slug, file, responses };
}

async function main() {
  const filled = FORMS.map(fill);

  console.log(DRY ? "Dry run. Nothing will be posted.\n" : `Posting to ${ENDPOINT}\n`);
  for (const f of filled) {
    const keys = Object.keys(f.responses).length;
    console.log(`  ${f.slug.padEnd(30)} ${String(keys).padStart(3)} fields  (${f.file.replace("public/", "")})`);
  }
  if (DRY) {
    await prisma.$disconnect();
    return;
  }

  let failed = 0;
  console.log("");
  for (const f of filled) {
    const before = await prisma.auditSurveyResponse.count({ where: { survey: f.slug } });
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        survey: f.slug,
        respondent: f.responses.respondent,
        submittedAt: new Date().toISOString(),
        responses: f.responses,
      }),
    });
    const body = await res.text();
    if (!res.ok) {
      console.log(`FAIL  ${f.slug}: HTTP ${res.status} ${body.slice(0, 200)}`);
      failed++;
      continue;
    }

    // the only thing that matters: a row, with the fields still in it
    const row = await prisma.auditSurveyResponse.findFirst({
      where: { survey: f.slug },
      orderBy: { createdAt: "desc" },
    });
    const stored = row?.payload as Record<string, unknown> | undefined;
    const after = await prisma.auditSurveyResponse.count({ where: { survey: f.slug } });

    const problems: string[] = [];
    if (after !== before + 1) problems.push(`count went ${before} to ${after}`);
    if (!stored) problems.push("no row came back");
    else {
      if (stored.__seed !== "true") problems.push("the row read back is not the one we just wrote");
      const lost = Object.keys(f.responses).filter((k) => stored[k] === undefined);
      if (lost.length) problems.push(`${lost.length} field(s) did not survive: ${lost.slice(0, 6).join(", ")}`);
    }

    if (problems.length) {
      failed++;
      console.log(`FAIL  ${f.slug}\n        ${problems.join("\n        ")}`);
    } else {
      console.log(`ok    ${f.slug}  ${Object.keys(stored!).length} fields stored intact`);
    }
  }

  // clean up after ourselves, whatever happened
  const removed = await prisma.auditSurveyResponse.deleteMany({
    where: {
      survey: { in: filled.map((f) => f.slug) },
      payload: { path: ["__seed"], equals: "true" },
    },
  });
  console.log(`\nSeed rows deleted: ${removed.count}`);

  for (const f of filled) {
    const left = await prisma.auditSurveyResponse.count({ where: { survey: f.slug } });
    console.log(`  ${f.slug.padEnd(30)} ${left} real response(s) remain`);
  }

  await prisma.$disconnect();
  if (failed) {
    console.log(`\n${failed} survey(s) failed. Do not send the link.`);
    process.exitCode = 1;
  } else {
    console.log("\nAll four surveys store what the form sends. Safe to send the link.");
  }
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exitCode = 1;
});
