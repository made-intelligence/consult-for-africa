import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { isNothing, lateness, reachedAPatient } from "@/lib/havenSafety";

describe("isNothing", () => {
  // Every "nothing" answer actually filed at Haven in October 2026.
  it.each(["Nothing for now ", "NIL", "Nil", "nil", "Nothing", "Nothing this week", "There was nothing this week", "", "  "])(
    "treats %j as nothing to raise",
    (t) => expect(isNothing(t)).toBe(true)
  );

  it.each([
    "2 medications with similar packaging design and font almost got mixed up",
    "An overdose and underdose prescription ",
    "Internet",
    "Manpower ",
    "Nothing was labelled on the second syringe",
  ])("raises %j", (t) => expect(isNothing(t)).toBe(false));
});

describe("lateness", () => {
  const now = new Date("2026-10-29T12:00:00Z").getTime();
  const daysAgo = (n: number) => new Date(now - n * 864e5);

  it("is late when nobody has taken it inside two days", () => {
    expect(lateness({ status: "NEW", reportedAt: daysAgo(3), takenAt: null, actionDueAt: null }, now)).toBe("Not taken");
  });
  it("is not late on day one", () => {
    expect(lateness({ status: "NEW", reportedAt: daysAgo(1), takenAt: null, actionDueAt: null }, now)).toBeNull();
  });
  it("is late when the agreed action is past its date", () => {
    expect(lateness({ status: "ACTION_AGREED", reportedAt: daysAgo(5), takenAt: daysAgo(4), actionDueAt: daysAgo(1) }, now)).toBe("Action overdue");
  });
  it("is late when open past fourteen days", () => {
    expect(lateness({ status: "INVESTIGATING", reportedAt: daysAgo(15), takenAt: daysAgo(14), actionDueAt: null }, now)).toBe("Open past 14 days");
  });
  it("is never late once closed", () => {
    expect(lateness({ status: "CLOSED", reportedAt: daysAgo(40), takenAt: null, actionDueAt: null }, now)).toBeNull();
  });
});

describe("reachedAPatient", () => {
  it("reads the form's answers", () => {
    expect(reachedAPatient("Yes")).toBe(true);
    expect(reachedAPatient("No, it was caught")).toBe(false);
    expect(reachedAPatient(null)).toBe(false);
  });
});
