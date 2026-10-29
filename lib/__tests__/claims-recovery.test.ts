import { describe, it, expect } from "vitest";
import { Prisma } from "@prisma/client";
import { check, score } from "@/lib/claims-recovery";
import { decide, type DecisionInput } from "@/lib/recovery-rules";
import { parseClaimsSheet } from "@/lib/recovery-desk";
import { DEFAULT_CAMPAIGN, fill, importKey, renderEmail, splitEmails, splitPhones } from "@/lib/hospital-sales";

const D = (n: number) => new Prisma.Decimal(n);

describe("receivables check", () => {
  it("is arithmetic on the hospital's own numbers", () => {
    const r = check({ monthlyBilled: 15_000_000, daysToPay: 120, queriedPct: 20 });
    expect(r.outstanding).toBe(60_000_000);
    expect(r.inDispute).toBe(12_000_000);
    expect(r.per30Days).toBe(15_000_000);
  });
  it("scores size and seniority", () => {
    expect(score({ monthlyBilled: 15_000_000, daysToPay: 120, queriedPct: 20 }, "Owner or Medical Director")).toBe("HOT");
    expect(score({ monthlyBilled: 1_000_000, daysToPay: 60, queriedPct: 5 }, "Other")).toBe("COLD");
  });
});

describe("advance decisioning", () => {
  const base: DecisionInput = {
    status: "VETTED", vetVerdict: "PASS", vetLikelihood: 85, vetConfirmed: true, vetPayable: D(90000), billedAmount: D(100000), tariffAmount: D(95000), ageDays: 40,
    payer: { advanceEligible: true, conflict: false },
    account: { status: "ACTIVE", advanceRate: D(0.6), maxClaimAgeDays: 180, payerCap: D(0.4), facilityLimit: D(10_000_000), agreementSigned: true },
    outstandingTotal: D(1_000_000), outstandingPayer: D(100_000), fundingLive: true,
  };
  it("advances the rate on the lowest of billed, tariff and expected payable", () => {
    const d = decide(base);
    expect(d.decision).toBe("ADVANCE");
    expect(d.amount.eq(54000)).toBe(true);
  });
  it("never advances while funding is not live", () => expect(decide({ ...base, fundingLive: false }).decision).toBe("HOLD"));
  it("waits for a person to confirm the verification", () => expect(decide({ ...base, vetConfirmed: false }).decision).toBe("HOLD"));
  it("never advances against a payer CFA advises", () => expect(decide({ ...base, payer: { advanceEligible: true, conflict: true } }).decision).toBe("DECLINE"));
  it("declines claims over the age limit", () => expect(decide({ ...base, ageDays: 400 }).decision).toBe("DECLINE"));
  it("holds under the likelihood floor", () => expect(decide({ ...base, vetLikelihood: 60 }).decision).toBe("HOLD"));
  it("allows a hospital's first advance despite the payer cap", () =>
    expect(decide({ ...base, outstandingTotal: D(0), outstandingPayer: D(0) }).decision).toBe("ADVANCE"));
  it("applies the payer cap once there is a book", () =>
    expect(decide({ ...base, outstandingTotal: D(5_000_000), outstandingPayer: D(3_000_000) }).decision).toBe("HOLD"));
});

describe("claims sheet", () => {
  const sheet = `Claim Ref,HMO,Enrollee ID,Service Date,Date Submitted,Service,Auth Code,Documents,Amount Billed,Tariff,Payer Response
CL-001,Hygeia HMO,HY123,03/06/2026,10/06/2026,Caesarean section,PA-99,notes; discharge summary,"₦450,000",420000,Queried
CL-002,Reliance HMO,,15/07/2026,,Malaria treatment outpatient,,,25000,,
CL-003,,X,,,,,,1000,,
CL-004,Avon HMO,,,,,,,abc,,`;
  it("reads naira amounts and day-first dates, and reports what it skipped", () => {
    const p = parseClaimsSheet(sheet);
    expect(p.rows).toHaveLength(2);
    expect(p.rows[0].billedAmount.eq(450000)).toBe(true);
    expect(p.rows[0].serviceDate?.toISOString().slice(0, 10)).toBe("2026-06-03");
    expect(p.rows[0].documentsHeld).toHaveLength(2);
    expect(p.skipped).toHaveLength(2);
  });
});

describe("hospital directory and email", () => {
  it("normalises names, phones and emails", () => {
    expect(importKey("PROMISE MEDICAL CEN-TRE LAGOS Ltd", "Agege")).toBe("promise medical centre lagos|agege");
    expect(splitPhones("08033105494, 08028917770")).toEqual(["+2348033105494", "+2348028917770"]);
    expect(splitEmails("info@x.com; Admin@Y.ng")).toEqual(["info@x.com", "admin@y.ng"]);
  });
  it("greets by name or falls back politely", () => {
    expect(fill("{{greeting}} {{hospital}}", { hospital: "Betta", name: null })).toBe("Good day, Betta");
  });
  it("renders with the tracked link and the opt out, and no stray placeholders", () => {
    const e = renderEmail({ body: DEFAULT_CAMPAIGN.body, ctaText: DEFAULT_CAMPAIGN.ctaText, token: "abcdefghijklmnopqrstuv", hospital: "Betta Hospital", name: "Dr Ade" });
    expect(e.html).toContain("Dear Dr Ade,");
    expect(e.html).toContain("/go/abcdefghijklmnopqrstuv");
    expect(e.html).toContain("/optout/abcdefghijklmnopqrstuv");
    expect(e.html).not.toContain("{{");
    expect(e.text).toContain("Check what Betta Hospital is owed");
  });
});
