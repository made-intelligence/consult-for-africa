import { describe, expect, it } from "vitest";
import { ARABELLA_MODULES } from "@/lib/arabella-modules";
import { appliesTo } from "@/lib/havenLearn";

// Positions and departments as seeded in scripts/seed-arabella-staff.ts.
const ROSTER: [string, string][] = [
  ["Principal and Medical Director", "Leadership"],
  ["Head of Operations", "Operations"],
  ["Head of Nursing", "Nursing"],
  ["General Practitioner, Acting Head of Clinicals", "Clinical"],
  ["General Practitioner", "Clinical"],
  ["Nurse", "Nursing"],
  ["Locum Nurse", "Nursing"],
  ["Laboratory Scientist", "Laboratory"],
  ["Admin", "Front desk"],
  ["PA and Admin Assistant", "Front desk"],
  ["Facility Manager and Security Supervisor", "Facility"],
  ["Housekeeping", "Facility"],
  ["Security", "Facility"],
  ["Social Media Manager", "Marketing"],
];

const text = (m: (typeof ARABELLA_MODULES)[number]) =>
  [m.title, m.summary, m.body, ...m.questions.flatMap((q) => [q.question, q.because, ...q.options])].join("\n");

describe("Arabella training modules", () => {
  it("has unique codes", () => {
    const codes = ARABELLA_MODULES.map((m) => m.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("puts every module in weeks 1 to 12", () => {
    for (const m of ARABELLA_MODULES) {
      expect(Number.isInteger(m.week), m.code).toBe(true);
      expect(m.week, m.code).toBeGreaterThanOrEqual(1);
      expect(m.week, m.code).toBeLessThanOrEqual(12);
    }
  });

  it("gives every question a valid correct index and a reason", () => {
    for (const m of ARABELLA_MODULES) {
      expect(m.questions.length, m.code).toBeGreaterThanOrEqual(5);
      expect(m.questions.length, m.code).toBeLessThanOrEqual(6);
      for (const q of m.questions) {
        expect(q.options.length, q.question).toBeGreaterThanOrEqual(3);
        expect(q.correct, q.question).toBeGreaterThanOrEqual(0);
        expect(q.correct, q.question).toBeLessThan(q.options.length);
        expect(new Set(q.options).size, q.question).toBe(q.options.length);
        expect(q.because.length, q.question).toBeGreaterThan(10);
      }
    }
  });

  it("has no em or en dashes and never says AI", () => {
    for (const m of ARABELLA_MODULES) {
      expect(text(m), m.code).not.toMatch(/[—–]/);
      expect(text(m), m.code).not.toMatch(/\bAI\b/);
    }
  });

  it("keeps the core modules for everyone in weeks 1 and 2", () => {
    const core = ARABELLA_MODULES.filter((m) => m.roles.length === 0 && m.departments.length === 0);
    expect(core.length).toBeGreaterThan(0);
    for (const m of core) expect(m.week, m.code).toBeLessThanOrEqual(2);
  });

  it("reaches somebody on the staff list with every module", () => {
    for (const m of ARABELLA_MODULES) {
      const who = ROSTER.filter(([p, d]) => appliesTo(m.roles, m.departments, p, d));
      expect(who.length, m.code).toBeGreaterThan(0);
    }
  });

  it("never gives one person more than three modules in a week", () => {
    for (const [p, d] of ROSTER) {
      const perWeek = new Map<number, number>();
      for (const m of ARABELLA_MODULES) {
        if (appliesTo(m.roles, m.departments, p, d)) perWeek.set(m.week, (perWeek.get(m.week) ?? 0) + 1);
      }
      for (const [w, n] of perWeek) expect(n, `${p} week ${w}`).toBeLessThanOrEqual(3);
    }
  });
});
