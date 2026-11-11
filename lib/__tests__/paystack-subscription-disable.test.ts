import { describe, it, expect, vi, beforeEach } from "vitest";

const { updateMany } = vi.hoisted(() => ({ updateMany: vi.fn(async (_args: unknown) => ({ count: 0 })) }));
vi.mock("@/lib/prisma", () => ({ prisma: { cadreSubscription: { updateMany } } }));
vi.mock("@/lib/email", () => ({ emailPaymentReceipt: vi.fn(), emailTrackPurchaseConfirmation: vi.fn() }));
vi.mock("@/lib/cadreHealth/paymentEmails", () => ({ emailCadreProWelcome: vi.fn(), emailCadreCoachingBooked: vi.fn() }));

import { handleCadreSubscription } from "@/lib/paystack/handlers";

describe("subscription.disable on a shared Paystack account", () => {
  beforeEach(() => updateMany.mockClear());

  it("never cancels by customer code alone (another product's subscription)", async () => {
    await handleCadreSubscription({ event: "subscription.disable", data: { customer: { customer_code: "CUS_shared" } } });
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("cancels only the CadreHealth subscription holding that exact code", async () => {
    await handleCadreSubscription({
      event: "subscription.not_renew",
      data: { customer: { customer_code: "CUS_shared" }, subscription_code: "SUB_abc" },
    });
    expect(updateMany).toHaveBeenCalledWith({
      where: { paystackSubCode: "SUB_abc", plan: "PRO" },
      data: expect.objectContaining({ status: "CANCELLED" }),
    });
  });
});
