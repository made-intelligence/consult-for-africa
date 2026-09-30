/**
 * Render each generated Arabella survey form in a real DOM and assert the form
 * it produces, because scripts/build-arabella-surveys.py emits JavaScript inside
 * a template literal and a form that fails to build looks identical to one that
 * built correctly until a respondent opens it.
 *
 *   node scripts/verify-arabella-forms.js
 *
 * Checks the scale questions all rendered with their six choices, the progress
 * counter agrees with them, the bespoke tail appended, the constant-sum block
 * initialised, and that no template marker survived the build.
 */
const fs = require("fs");
const { JSDOM } = require("jsdom");

const EXPECT = {
  "public/arabella-staff-survey.html": { scale: 55, split: 0, slug: "arabella-staff-culture" },
  "public/arabella-patient-survey.html": { scale: 24, split: 0, slug: "arabella-patient-experience" },
  "public/arabella-referrer-survey.html": { scale: 13, split: 6, slug: "arabella-referrer" },
  "public/arabella-leadership-survey.html": { scale: 24, split: 7, slug: "arabella-leadership-direction" },
};

let fails = 0;
for (const [file, want] of Object.entries(EXPECT)) {
  const raw = fs.readFileSync(file, "utf8");
  const errs = [];

  const dom = new JSDOM(raw, { runScripts: "dangerously" });
  const d = dom.window.document;
  const form = d.getElementById("survey");
  if (!form) {
    console.log(`FAIL  ${file}: the form element is missing`);
    fails++;
    continue;
  }

  const scale = new Set(
    [...form.querySelectorAll("input[type=radio]")].map((i) => i.name).filter((n) => /^q\d+$/.test(n))
  ).size;
  if (scale !== want.scale) errs.push(`${scale} scale questions, expected ${want.scale}`);

  const shown = d.getElementById("total")?.textContent;
  if (String(shown) !== String(want.scale)) errs.push(`the progress counter says "${shown}"`);

  for (const n of ["q1", `q${want.scale}`]) {
    const opts = form.querySelectorAll(`input[name="${n}"]`).length;
    if (opts !== 6) errs.push(`${n} offers ${opts} choices, expected 5 plus N/A`);
  }

  const splits = form.querySelectorAll('input[type=number][name^="split_"]').length;
  if (splits !== want.split) errs.push(`${splits} constant-sum inputs, expected ${want.split}`);
  if (want.split) {
    const label = d.getElementById("splittot")?.textContent ?? "";
    if (!/of 100$/.test(label)) errs.push(`the constant-sum total reads "${label}"`);
  }

  if (!d.getElementById("submitBtn")) errs.push("no submit button");
  if (!form.querySelector("h2.section")) errs.push("no section headings rendered");
  if (form.querySelectorAll("textarea").length === 0) errs.push("no open questions rendered, so the tail did not append");
  if (!raw.includes(`const SLUG = "${want.slug}"`)) errs.push(`the slug is not ${want.slug}`);
  if (!raw.includes('const ENDPOINT = "/api/arabella-audit/responses"')) errs.push("wrong or missing endpoint");

  const leftovers = raw.match(/__[A-Z_]+__/g);
  if (leftovers) errs.push(`unreplaced template markers: ${[...new Set(leftovers)].join(", ")}`);

  const headings = form.querySelectorAll("h2.section").length;
  const selects = form.querySelectorAll("select").length;
  const areas = form.querySelectorAll("textarea").length;
  const texts = form.querySelectorAll("input[type=text]").length;
  const boxes = form.querySelectorAll("input[type=checkbox]").length;

  if (errs.length) fails++;
  console.log(
    `${errs.length ? "FAIL" : "ok  "}  ${file.replace("public/", "")}  ` +
      `scale=${scale} sections=${headings} select=${selects} open=${areas} text=${texts} checkbox=${boxes} split=${splits}` +
      (errs.length ? "\n        " + errs.join("\n        ") : "")
  );
}

console.log(fails ? `\n${fails} form(s) failed.` : "\nAll four forms render.");
process.exit(fails ? 1 : 0);
