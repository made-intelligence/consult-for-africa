import { describe, it, expect } from "vitest";
import { subscriptionPeriod } from "@/lib/paystack/handlers";

/**
 * Whether a charge moves the billing period.
 *
 * The handler runs more than once for the same charge: Paystack retries, and a
 * replay is run deliberately days later to repair something. Resetting the
 * period on a re-run takes time the subscriber has already paid for, which is
 * exactly the kind of loss nobody notices until they complain.
 */
const NOW = new Date("2026-09-21T12:00:00Z");

describe("subscriptionPeriod", () => {
  it("leaves a running period alone, so a replay cannot shorten it", () => {
    // The real case that found this: an active subscriber paid up to 7 Nov,
    // and replaying his original charge would have moved it to 21 Oct.
    const prior = { status: "ACTIVE", currentPeriodEnd: new Date("2026-11-07T00:00:00Z") };
    expect(subscriptionPeriod(prior, NOW)).toBeNull();
  });

  it("starts a month for a brand new subscriber", () => {
    const p = subscriptionPeriod(null, NOW);
    expect(p?.start).toEqual(NOW);
    expect(p?.end.toISOString()).toBe("2026-10-21T12:00:00.000Z");
  });

  it("starts a fresh month when the last period has lapsed, which is a real renewal", () => {
    const prior = { status: "ACTIVE", currentPeriodEnd: new Date("2026-09-01T00:00:00Z") };
    const p = subscriptionPeriod(prior, NOW);
    expect(p?.end.toISOString()).toBe("2026-10-21T12:00:00.000Z");
  });

  it("starts a fresh month for someone who cancelled and came back", () => {
    const prior = { status: "CANCELLED", currentPeriodEnd: new Date("2026-12-01T00:00:00Z") };
    expect(subscriptionPeriod(prior, NOW)).not.toBeNull();
  });

  it("treats a period ending exactly now as lapsed, not running", () => {
    const prior = { status: "ACTIVE", currentPeriodEnd: NOW };
    expect(subscriptionPeriod(prior, NOW)).not.toBeNull();
  });

  it("starts a month when the record has no period recorded", () => {
    const prior = { status: "ACTIVE", currentPeriodEnd: null };
    expect(subscriptionPeriod(prior, NOW)).not.toBeNull();
  });
});
