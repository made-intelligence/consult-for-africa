import { describe, it, expect } from "vitest";
import {
  cleanValues,
  derivedValue,
  findSection,
  missingSections,
  ownersFor,
  practiceDay,
  sectionStatus,
  summarise,
  visibleSections,
  type DailyConfig,
} from "@/lib/dailyReturn";
import { ARABELLA_DAILY, ARABELLA_SECTIONS } from "@/lib/arabella-daily";

const at = (iso: string) => new Date(iso);
const day = (s: string) => new Date(`${s}T00:00:00Z`);

describe("Arabella daily config", () => {
  it("has the twelve agreed items, numbered 1 to 12, with unique codes", () => {
    expect(ARABELLA_SECTIONS.map((s) => s.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(new Set(ARABELLA_SECTIONS.map((s) => s.code)).size).toBe(12);
  });

  it("phases 1 to 5 in week one, 6 to 9 next, 10 to 12 after", () => {
    expect(ARABELLA_SECTIONS.filter((s) => s.phase === 1).map((s) => s.number)).toEqual([1, 2, 3, 4, 5]);
    expect(ARABELLA_SECTIONS.filter((s) => s.phase === 2).map((s) => s.number)).toEqual([6, 7, 8, 9]);
    expect(ARABELLA_SECTIONS.filter((s) => s.phase === 3).map((s) => s.number)).toEqual([10, 11, 12]);
  });

  it("every headline code is a metric or a derived figure, and metric codes are unique per section", () => {
    for (const s of ARABELLA_SECTIONS) {
      const codes = s.metrics.map((m) => m.code);
      expect(new Set(codes).size).toBe(codes.length);
      const known = new Set([...codes, ...(s.derived ?? []).map((d) => d.code)]);
      for (const h of s.headline) expect(known.has(h)).toBe(true);
      for (const d of s.derived ?? []) for (const c of d.of) expect(codes).toContain(c);
    }
  });

  it("only money is restricted, and it is hidden from staff without the financial view", () => {
    expect(ARABELLA_SECTIONS.filter((s) => s.restricted === "FINANCIAL").map((s) => s.code)).toEqual(["money"]);
    expect(visibleSections(ARABELLA_DAILY, false).some((s) => s.code === "money")).toBe(false);
    expect(visibleSections(ARABELLA_DAILY, true)).toHaveLength(12);
  });
});

describe("practice day", () => {
  it("uses Lagos time, so 23:30 UTC is already tomorrow", () => {
    expect(practiceDay(ARABELLA_DAILY, at("2026-11-10T23:30:00Z")).toISOString()).toBe("2026-11-11T00:00:00.000Z");
    expect(practiceDay(ARABELLA_DAILY, at("2026-11-10T22:30:00Z")).toISOString()).toBe("2026-11-10T00:00:00.000Z");
  });
});

describe("section status and missing sections", () => {
  const cfg: DailyConfig = ARABELLA_DAILY;
  const money = findSection(cfg, "money")!;
  const lab = findSection(cfg, "lab")!;
  const safety = findSection(cfg, "safety")!;

  it("is due during the day and missing after 20:00 Lagos", () => {
    const d = day("2026-11-17");
    expect(sectionStatus(cfg, money, d, false, at("2026-11-17T17:00:00Z"))).toBe("DUE"); // 18:00 Lagos
    expect(sectionStatus(cfg, money, d, false, at("2026-11-17T19:00:00Z"))).toBe("MISSING"); // 20:00 Lagos
    expect(sectionStatus(cfg, money, d, true, at("2026-11-17T19:00:00Z"))).toBe("IN");
  });

  it("a past day with no return is missing", () => {
    expect(sectionStatus(cfg, money, day("2026-11-16"), false, at("2026-11-17T08:00:00Z"))).toBe("MISSING");
  });

  it("an area whose phase has not started is not started, never missing", () => {
    const d = day("2026-11-17");
    expect(sectionStatus(cfg, lab, d, false, at("2026-11-18T08:00:00Z"))).toBe("NOT_STARTED"); // phase 2 starts 30 Nov
    expect(sectionStatus(cfg, lab, day("2026-11-30"), false, at("2026-12-01T08:00:00Z"))).toBe("MISSING");
    expect(sectionStatus(cfg, safety, day("2026-12-04"), false, at("2026-12-05T08:00:00Z"))).toBe("NOT_STARTED"); // phase 3 starts 7 Dec
  });

  it("lists only live sections with no return", () => {
    const missing = missingSections(cfg, day("2026-11-17"), ["on_duty", "patients"], at("2026-11-17T19:30:00Z"));
    expect(missing.map((s) => s.code)).toEqual(["opening", "wait", "money"]);
  });

  it("lists nothing before the first phase starts", () => {
    expect(missingSections(cfg, day("2026-11-15"), [], at("2026-11-15T20:00:00Z"))).toEqual([]);
  });
});

describe("cleaning values", () => {
  const patients = findSection(ARABELLA_DAILY, "patients")!;
  const opening = findSection(ARABELLA_DAILY, "opening")!;
  const money = findSection(ARABELLA_DAILY, "money")!;

  it("keeps blanks out rather than storing zero", () => {
    const { values, errors } = cleanValues(patients, { seen: "12", booked: "", no_show: 0, unknown: 5 });
    expect(errors).toEqual([]);
    expect(values).toEqual({ seen: 12, no_show: 0 });
  });

  it("rejects a fraction where a count is asked for, and a bad time", () => {
    expect(cleanValues(patients, { seen: "2.5" }).errors).toHaveLength(1);
    expect(cleanValues(opening, { opened_at: "8.15" }).errors).toHaveLength(1);
    expect(cleanValues(opening, { opened_at: "08:15", cash_reconciled: "yes" }).values).toEqual({ opened_at: "08:15", cash_reconciled: true });
  });

  it("reads naira with commas and the sign, and totals what was collected", () => {
    const { values } = cleanValues(money, { billed: "₦450,000", cash: "100,000", pos: 200000, transfer_a: "50000" });
    expect(values.billed).toBe(450000);
    expect(derivedValue(money.derived![0], values)).toBe(350000);
  });

  it("works out a share, and gives nothing when it cannot", () => {
    const next = findSection(ARABELLA_DAILY, "next_step")!;
    const share = next.derived![0];
    expect(derivedValue(share, { leaving: 20, booked_next: 15 })).toBe(75);
    expect(derivedValue(share, { leaving: 0, booked_next: 0 })).toBeNull();
    expect(derivedValue(share, { booked_next: 3 })).toBeNull();
  });
});

describe("owners and summaries", () => {
  it("matches owner roles loosely against job titles", () => {
    const staff = [
      { id: "a", position: "Head of Nursing Services", department: "NURSING" },
      { id: "b", position: "Front Desk Officer", department: "ADMIN" },
      { id: "c", position: "Cashier", department: "ACCOUNTS" },
    ];
    expect(ownersFor(findSection(ARABELLA_DAILY, "on_duty")!, staff).map((s) => s.id)).toEqual(["a"]);
    expect(ownersFor(findSection(ARABELLA_DAILY, "patients")!, staff).map((s) => s.id)).toEqual(["b"]);
    expect(ownersFor(findSection(ARABELLA_DAILY, "money")!, staff).map((s) => s.id)).toEqual(["c"]);
  });

  it("totals counts and averages minutes", () => {
    const patients = findSection(ARABELLA_DAILY, "patients")!;
    expect(summarise(patients, "seen", [{ seen: 10 }, { seen: 20 }, {}])).toEqual({ total: 30, average: 15, daysIn: 3 });
    const wait = findSection(ARABELLA_DAILY, "wait")!;
    expect(summarise(wait, "median_wait", [{ median_wait: 30 }, { median_wait: 40 }])).toEqual({ total: null, average: 35, daysIn: 2 });
  });
});
