import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { LYFE_CONSULT } from "@/lib/lyfe";

/**
 * Taking the money for a consultation.
 *
 * The page used to offer a free call, so nothing on it had to work harder than
 * writing a row. A booking that is paid for is a different object: it holds a
 * named half hour in a surgeon's diary, and the thing that decides whether it
 * is held is Paystack telling us the charge succeeded, not the browser coming
 * back to a thank-you page. A person can close the tab on the way back and
 * still have paid.
 *
 * So initialisation happens here and confirmation happens in the webhook, and
 * the two are joined by a reference stored on the row before the person ever
 * reaches Paystack.
 */

function baseUrl(): string | null {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.BASE_URL ??
    null
  );
}

/**
 * Returns the Paystack checkout URL, or null if payment cannot be started.
 *
 * Null is not an error the caller should throw on. The enquiry is already
 * saved and the coordinator already knows, so a payment that cannot start is a
 * telephone call, not a lost booking.
 */
export async function startConsultPayment({
  enquiryId,
  email,
  name,
  slotAt,
}: {
  enquiryId: string;
  email: string;
  name: string;
  slotAt: Date;
}): Promise<string | null> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    console.error("[lyfe/pay] PAYSTACK_SECRET_KEY is not set");
    return null;
  }
  const base = baseUrl();
  if (!base) {
    console.error("[lyfe/pay] no base URL configured");
    return null;
  }

  const reference = `lyfe-${randomUUID()}`;

  try {
    // Written before the redirect so a webhook that arrives first still finds
    // the row it belongs to.
    await prisma.lyfeEnquiry.update({
      where: { id: enquiryId },
      data: { paymentRef: reference },
    });

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        amount: LYFE_CONSULT.fee * 100,
        currency: "NGN",
        reference,
        metadata: {
          type: "lyfe_consultation",
          enquiryId,
          name,
          slotAt: slotAt.toISOString(),
          custom_fields: [
            { display_name: "Consultation", variable_name: "consultation", value: "Dr Chinwe Kpaduwa, 30 minutes by video" },
          ],
        },
        callback_url: `${base.replace(/\/$/, "")}/lyfe/booked`,
      }),
      signal: AbortSignal.timeout(15000),
    });

    const data = await res.json();
    if (!data?.status || !data?.data?.authorization_url) {
      console.error("[lyfe/pay] Paystack refused the initialisation:", data);
      return null;
    }
    return data.data.authorization_url as string;
  } catch (err) {
    console.error("[lyfe/pay] could not start payment:", err);
    return null;
  }
}
