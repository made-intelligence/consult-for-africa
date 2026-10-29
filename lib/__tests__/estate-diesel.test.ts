import { describe, it, expect } from "vitest";
import {
  costRun,
  splitRun,
  checkDelivery,
  checkConsumption,
  weightedAverageCost,
  suggestedLitresPerHour,
  daysOfCoverRemaining,
  needsTopUp,
  type SplitUnit,
} from "../estate/diesel";

const occupied = (id: string, share = 1): SplitUnit => ({
  id,
  dieselShare: share,
  billable: true,
  inService: true,
});

describe("costRun", () => {
  it("costs a clean four-hour run at the stated rates", () => {
    const r = costRun({
      startedAt: new Date("2026-09-20T18:00:00Z"),
      endedAt: new Date("2026-09-20T22:00:00Z"),
      litresPerHour: 10,
      pricePerLitre: 1800,
    });
    expect(r.runMinutes).toBe(240);
    expect(r.litresUsed).toBe(40);
    expect(r.costNaira).toBe(72000);
  });

  it("bills part hours to the minute rather than rounding up to an hour", () => {
    const r = costRun({
      startedAt: new Date("2026-09-20T18:00:00Z"),
      endedAt: new Date("2026-09-20T18:20:00Z"),
      litresPerHour: 10,
      pricePerLitre: 1800,
    });
    expect(r.runMinutes).toBe(20);
    expect(r.litresUsed).toBeCloseTo(3.33, 2);
  });

  it("refuses a run that ends before it starts", () => {
    expect(() =>
      costRun({
        startedAt: new Date("2026-09-20T22:00:00Z"),
        endedAt: new Date("2026-09-20T18:00:00Z"),
        litresPerHour: 10,
        pricePerLitre: 1800,
      }),
    ).toThrow();
  });
});

describe("splitRun", () => {
  it("splits equally when every unit carries the same share", () => {
    const s = splitRun({
      costNaira: 72000,
      litresUsed: 40,
      units: ["a", "b", "c", "d"].map((id) => occupied(id)),
    });
    expect(s.lines.map((l) => l.amount)).toEqual([18000, 18000, 18000, 18000]);
    expect(s.ownerAmount).toBe(0);
  });

  it("loses nothing to rounding on a figure that does not divide", () => {
    // ₦100,000.00 over 3 is ₦33,333.333... — somebody has to take the extra kobo.
    const s = splitRun({ costNaira: 100000, litresUsed: 55.56, units: ["a", "b", "c"].map((id) => occupied(id)) });
    const total = s.lines.reduce((t, l) => t + l.amount, 0) + s.ownerAmount;
    expect(total).toBeCloseTo(100000, 2);
    expect(s.lines.map((l) => l.amount).sort()).toEqual([33333.33, 33333.33, 33333.34]);
  });

  it("ties out over twelve units, the real case", () => {
    const units = Array.from({ length: 12 }, (_, i) => occupied(`u${i}`));
    const s = splitRun({ costNaira: 87654.32, litresUsed: 48.7, units });
    const total = s.lines.reduce((t, l) => t + l.amount, 0) + s.ownerAmount;
    expect(total).toBeCloseTo(87654.32, 2);
    const litres = s.lines.reduce((t, l) => t + l.litres, 0) + s.ownerLitres;
    expect(litres).toBeCloseTo(48.7, 2);
  });

  it("follows the weights when units are not the same size", () => {
    const s = splitRun({
      costNaira: 100000,
      litresUsed: 50,
      units: [occupied("big", 1.5), occupied("small", 1), occupied("small2", 1)],
    });
    const byId = Object.fromEntries(s.lines.map((l) => [l.unitId, l.amount]));
    expect(byId.big / byId.small).toBeCloseTo(1.5, 3);
  });

  it("puts a vacant unit's share on the owner rather than on the other tenants", () => {
    const s = splitRun({
      costNaira: 100000,
      litresUsed: 50,
      units: [
        occupied("let1"),
        occupied("let2"),
        occupied("let3"),
        { id: "vacant", dieselShare: 1, billable: false, inService: true },
      ],
    });
    expect(s.lines).toHaveLength(3);
    expect(s.lines.every((l) => l.amount === 25000)).toBe(true);
    expect(s.ownerAmount).toBe(25000);
  });

  it("takes an out-of-service unit out of the denominator entirely", () => {
    const s = splitRun({
      costNaira: 90000,
      litresUsed: 50,
      units: [
        occupied("a"),
        occupied("b"),
        occupied("c"),
        { id: "works", dieselShare: 1, billable: false, inService: false },
      ],
    });
    // Three live units, so a third each — not a quarter with the fourth on the owner.
    expect(s.lines.map((l) => l.amount)).toEqual([30000, 30000, 30000]);
    expect(s.ownerAmount).toBe(0);
  });

  it("splits the same way every time, so a re-run cannot reshuffle who paid the extra kobo", () => {
    const units = ["z", "m", "a"].map((id) => occupied(id));
    const first = splitRun({ costNaira: 100000, litresUsed: 10, units });
    const second = splitRun({ costNaira: 100000, litresUsed: 10, units: [...units].reverse() });
    const norm = (s: typeof first) =>
      s.lines.map((l) => `${l.unitId}:${l.amount}`).sort();
    expect(norm(first)).toEqual(norm(second));
  });

  it("puts the whole cost on the owner when no unit is in service", () => {
    const s = splitRun({
      costNaira: 50000,
      litresUsed: 25,
      units: [{ id: "a", dieselShare: 1, billable: false, inService: false }],
    });
    expect(s.lines).toHaveLength(0);
    expect(s.ownerAmount).toBe(50000);
  });
});

describe("checkDelivery", () => {
  it("passes a delivery whose dip rise matches the waybill", () => {
    const c = checkDelivery({ waybillLitres: 1000, tankBeforeL: 200, tankAfterL: 1198, pricePerLitre: 1800 });
    expect(c.verdict).toBe("OK");
    expect(c.shortfallLitres).toBe(2);
  });

  it("flags a short delivery for a conversation with the supplier", () => {
    const c = checkDelivery({ waybillLitres: 1000, tankBeforeL: 200, tankAfterL: 1150, pricePerLitre: 1800 });
    expect(c.verdict).toBe("INVESTIGATE");
    expect(c.shortfallLitres).toBe(50);
    expect(c.shortfallNaira).toBe(90000);
  });

  it("says nothing at all when nobody dipped the tank", () => {
    const c = checkDelivery({ waybillLitres: 1000, tankBeforeL: null, tankAfterL: null, pricePerLitre: 1800 });
    expect(c.verdict).toBe("NO_DATA");
    expect(c.shortfallLitres).toBeNull();
  });
});

describe("checkConsumption", () => {
  it("agrees when the tank and the log tell the same story", () => {
    const c = checkConsumption({
      loggedMinutes: 600,
      litresPerHour: 10,
      openingDipL: 500,
      closingDipL: 400,
      deliveredLitres: 0,
      pricePerLitre: 1800,
    });
    expect(c.theoreticalLitres).toBe(100);
    expect(c.physicalDrawLitres).toBe(100);
    expect(c.verdict).toBe("OK");
  });

  it("calls out fuel leaving that no run accounts for", () => {
    const c = checkConsumption({
      loggedMinutes: 600,
      litresPerHour: 10,
      openingDipL: 500,
      closingDipL: 350,
      deliveredLitres: 0,
      pricePerLitre: 1800,
    });
    expect(c.physicalDrawLitres).toBe(150);
    expect(c.verdict).toBe("INVESTIGATE");
    expect(c.impliedLitresPerHour).toBe(15);
    expect(c.reading).toMatch(/nobody logged|running heavier/);
  });

  it("says the rate is over-recovering when less fuel went than was billed", () => {
    const c = checkConsumption({
      loggedMinutes: 600,
      litresPerHour: 10,
      openingDipL: 500,
      closingDipL: 430,
      deliveredLitres: 0,
      pricePerLitre: 1800,
    });
    expect(c.varianceLitres).toBe(-30);
    expect(c.reading).toMatch(/over-recovering/);
  });

  it("counts fuel delivered mid-window into the draw", () => {
    const c = checkConsumption({
      loggedMinutes: 600,
      litresPerHour: 10,
      openingDipL: 200,
      closingDipL: 600,
      deliveredLitres: 500,
      pricePerLitre: 1800,
    });
    expect(c.physicalDrawLitres).toBe(100);
    expect(c.verdict).toBe("OK");
  });

  it("does not raise an alarm on the small drift a flat tariff always produces", () => {
    const c = checkConsumption({
      loggedMinutes: 600,
      litresPerHour: 10,
      openingDipL: 500,
      closingDipL: 393,
      deliveredLitres: 0,
      pricePerLitre: 1800,
    });
    expect(c.varianceLitres).toBe(7);
    expect(c.verdict).toBe("OK");
  });
});

describe("weightedAverageCost", () => {
  it("weights by litres, not by the number of deliveries", () => {
    const wac = weightedAverageCost([
      { litres: 1000, pricePerLitre: 1800 },
      { litres: 200, pricePerLitre: 2000 },
    ]);
    expect(wac).toBeCloseTo(1833.33, 2);
  });

  it("has no answer before anything has been delivered", () => {
    expect(weightedAverageCost([])).toBeNull();
  });
});

describe("suggestedLitresPerHour", () => {
  it("puts a 100 kVA set at half load near the published charts", () => {
    // Charts give about 11.2 l/h for a 100 kVA at 50%.
    expect(suggestedLitresPerHour(100, 0.5)).toBeCloseTo(10, 0);
  });

  it("scales with load, which is the term nobody knows", () => {
    expect(suggestedLitresPerHour(100, 1)).toBe(20);
  });
});

describe("daysOfCoverRemaining", () => {
  it("divides the balance by the recent daily burn", () => {
    expect(daysOfCoverRemaining({ balanceNaira: 100000, spentNaira: 150000, overDays: 30 })).toBe(20);
  });

  it("declines to guess when there is no history", () => {
    expect(daysOfCoverRemaining({ balanceNaira: 100000, spentNaira: 0, overDays: 30 })).toBeNull();
  });
});

describe("needsTopUp", () => {
  it("catches a heavy user still above the naira floor", () => {
    const r = needsTopUp({ balanceNaira: 80000, floorNaira: 50000, daysOfCover: 3, minDays: 7 });
    expect(r.due).toBe(true);
    expect(r.reason).toMatch(/3 days/);
  });

  it("leaves a light user with months of cover alone", () => {
    expect(needsTopUp({ balanceNaira: 60000, floorNaira: 50000, daysOfCover: 90, minDays: 7 }).due).toBe(false);
  });

  it("fires on an exhausted deposit whatever the cover figure says", () => {
    expect(needsTopUp({ balanceNaira: 0, floorNaira: 50000, daysOfCover: null, minDays: 7 }).due).toBe(true);
  });
});
