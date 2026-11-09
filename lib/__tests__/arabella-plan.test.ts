import { describe, expect, it } from "vitest";
import { ARABELLA_PLAN, GO_LIVE, weekStart } from "@/lib/arabella-plan";
import { released } from "@/lib/staffTaskRelease";
import { ARABELLA_DAILY } from "@/lib/arabella-daily";

describe("Arabella plan trickle", () => {
  it("starts each week on a Monday, 06:00 Lagos", () => {
    for (const w of [1, 2, 6]) {
      const d = weekStart(w);
      expect(d.getUTCDay()).toBe(1);
      expect(d.getUTCHours()).toBe(5);
    }
    expect(weekStart(1).toISOString().slice(0, 10)).toBe(GO_LIVE);
    expect(weekStart(3).toISOString().slice(0, 10)).toBe("2026-11-30");
  });

  it("has unique codes and no em dashes in staff copy", () => {
    const codes = ARABELLA_PLAN.map((t) => t.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const t of ARABELLA_PLAN) expect(`${t.title}${t.why}${t.evidence}`).not.toContain("—");
  });

  it("releases a few tasks a week, never the whole plan at once", () => {
    const perWeek = new Map<number, number>();
    for (const t of ARABELLA_PLAN) perWeek.set(t.week, (perWeek.get(t.week) ?? 0) + 1);
    for (const n of perWeek.values()) expect(n).toBeLessThanOrEqual(5);
  });

  it("matches the daily view's phase dates", () => {
    expect(ARABELLA_DAILY.phaseStarts[1]).toBe(GO_LIVE);
  });

  it("treats a null start as live and a future start as not yet", () => {
    const now = new Date("2026-11-20T10:00:00Z");
    const where = released(now);
    expect(where.OR).toEqual([{ startsOn: null }, { startsOn: { lte: now } }]);
  });
});
