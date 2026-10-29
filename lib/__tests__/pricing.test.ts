import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { RATE_CARD_ROLES } from "../constants";
import { DAY_RATES, PROGRAMME_RATE } from "../pricing";

/**
 * The rate card exists in two languages: lib/pricing.ts, which a director reads
 * on /finance/rate-card, and the Python fee builders, which a client's proposal
 * is actually built from. A figure that drifts between them produces a proposal
 * that disagrees with what the person negotiating it believes the rate to be,
 * which is the one failure mode nobody would notice until a client did.
 *
 * So parse the Python and assert against it rather than trusting a comment.
 */

const ROOT = join(__dirname, "..", "..");

function readPy(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

/**
 * Both builders hold grade names again further down the file, against day
 * counts rather than rates, so a whole file scan reads "Partner: 6" and passes
 * or fails for the wrong reason. Cut the RATES literal out first and parse only
 * inside it.
 */
function ratesBlock(src: string, open: "[" | "{"): string {
  const close = open === "[" ? "]" : "}";
  const start = src.indexOf(open, src.indexOf("RATES"));
  const end = src.indexOf(close, start);
  if (start < 0 || end < 0) throw new Error("no RATES literal found");
  return src.slice(start, end);
}

/** `("Partner, engagement lead",     750_000),` and friends. */
function parseTupleRates(src: string): Map<string, number> {
  const out = new Map<string, number>();
  const re = /\(\s*"([^"]+)",\s*([\d_]+)\s*\)/g;
  for (const m of ratesBlock(src, "[").matchAll(re)) out.set(m[1], Number(m[2].replace(/_/g, "")));
  return out;
}

/** `"Partner": 750_000,` and friends. */
function parseDictRates(src: string): Map<string, number> {
  const out = new Map<string, number>();
  const re = /"([A-Z][A-Za-z ]+)":\s*([\d_]+),/g;
  for (const m of ratesBlock(src, "{").matchAll(re)) out.set(m[1], Number(m[2].replace(/_/g, "")));
  return out;
}

describe("the published day rates", () => {
  it("match scripts/lib_medbury_aesthetics_fee.py", () => {
    const py = parseTupleRates(readPy("scripts/lib_medbury_aesthetics_fee.py"));
    expect(py.size).toBeGreaterThan(0);
    for (const { grade, rate } of DAY_RATES) {
      expect(py.get(grade), `grade "${grade}" is missing or different in the Python rate card`).toBe(rate);
    }
  });

  it("match scripts/clearview_fee.py, which keys on the short grade name", () => {
    const py = parseDictRates(readPy("scripts/clearview_fee.py"));
    expect(py.size).toBeGreaterThan(0);
    for (const { grade, rate } of DAY_RATES) {
      // "Partner, engagement lead" there is just "Partner".
      const short = grade.split(",")[0];
      expect(py.get(short), `grade "${short}" is missing or different in the Clearview rate card`).toBe(rate);
    }
  });

  it("is ordered most senior first, because every fee table renders in this order", () => {
    const rates = DAY_RATES.map((r) => r.rate);
    expect([...rates].sort((a, b) => b - a)).toEqual(rates);
  });
});

describe("the programme rate", () => {
  it("matches the Python builders", () => {
    for (const rel of ["scripts/lib_medbury_aesthetics_fee.py", "scripts/clearview_fee.py"]) {
      const m = readPy(rel).match(/(?:PROG_RATE|PROGRAMME_RATE)\s*=\s*([\d.]+)/);
      expect(m, `no programme rate found in ${rel}`).toBeTruthy();
      expect(Number(m![1])).toBe(PROGRAMME_RATE);
    }
  });

  it("is the only structural concession, so it is a single number not a range", () => {
    expect(typeof PROGRAMME_RATE).toBe("number");
  });
});

describe("the rate card gate", () => {
  it("excludes consultants and the office roles, because neither sees rates", () => {
    expect(RATE_CARD_ROLES).not.toContain("CONSULTANT");
    expect(RATE_CARD_ROLES).not.toContain("EXECUTIVE_ASSISTANT");
    expect(RATE_CARD_ROLES).not.toContain("ADMINISTRATIVE_ASSISTANT");
    expect(RATE_CARD_ROLES).not.toContain("ENGAGEMENT_MANAGER");
  });

  it("admits a director, which is how a growth lead is meant to get in", () => {
    expect(RATE_CARD_ROLES).toContain("DIRECTOR");
    expect(RATE_CARD_ROLES).toContain("PARTNER");
  });
});
