/**
 * Paystack event handlers for the products that live in this codebase:
 * client invoices, training track purchases, CadreHealth subscriptions and
 * CadreHealth coaching sessions.
 *
 * Pulled out of the webhook route so a single front door can dispatch to them
 * (see app/api/paystack/webhook/route.ts) and so a replay can re-run one
 * without going back through HTTP.
 *
 * Every handler is idempotent. Paystack retries, and a replay re-runs an event
 * on purpose, so running twice must not double-charge, double-enrol or
 * double-receipt anyone.
 */
import { prisma } from "@/lib/prisma";
import { emailPaymentReceipt, emailTrackPurchaseConfirmation } from "@/lib/email";
import { emailCadreProWelcome, emailCadreCoachingBooked } from "@/lib/cadreHealth/paymentEmails";
import { Decimal } from "@prisma/client/runtime/library";
import { InvoiceStatus } from "@prisma/client";

export interface PaystackEvent {
  event: string;
  data: {
    id?: number;
    reference?: string;
    amount?: number;
    currency?: string;
    channel?: string;
    customer?: { customer_code?: string; email?: string };
    metadata?: {
      product?: string;
      type?: string;
      invoiceId?: string;
      invoiceNumber?: string;
      clientId?: string;
      trackPurchaseId?: string;
      trackId?: string;
      userId?: string;
      professional_id?: string;
      session_id?: string;
      [key: string]: unknown;
    };
  };
}

/* ── Training track purchases ─────────────────────────────────────────────── */

export async function handleTrackPurchase(event: PaystackEvent): Promise<void> {
  const { data } = event;
  const trackPurchaseId = data.metadata?.trackPurchaseId;
  if (!trackPurchaseId) return;

  const purchase = await prisma.trackPurchase.findUnique({ where: { id: trackPurchaseId } });

  if (!purchase || purchase.status === "CONFIRMED") {
    // Already processed, or the id does not resolve. Either way there is
    // nothing to do and repeating is harmless.
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.trackPurchase.update({
      where: { id: trackPurchaseId },
      data: {
        status: "CONFIRMED",
        paystackTxnId: String(data.id),
        confirmedAt: new Date(),
      },
    });

    const track = await tx.trainingTrack.findUnique({
      where: { id: purchase.trackId },
      include: { modules: { where: { isActive: true }, orderBy: { order: "asc" } } },
    });

    if (track) {
      const existing = await tx.trainingEnrollment.findUnique({
        where: { userId_trackId: { userId: purchase.userId, trackId: purchase.trackId } },
      });

      if (!existing) {
        await tx.trainingEnrollment.create({
          data: {
            userId: purchase.userId,
            trackId: purchase.trackId,
            status: "IN_PROGRESS",
            startedAt: new Date(),
            moduleProgress: {
              create: track.modules.map((mod, i) => ({
                moduleId: mod.id,
                status: i === 0 ? "AVAILABLE" : "LOCKED",
              })),
            },
          },
        });
      }
    }
  });

  const user = await prisma.user.findUnique({
    where: { id: purchase.userId },
    select: { email: true, name: true },
  });
  const track = await prisma.trainingTrack.findUnique({
    where: { id: purchase.trackId },
    select: { name: true },
  });

  if (user && track) {
    emailTrackPurchaseConfirmation({
      email: user.email,
      firstName: user.name?.split(" ")[0] ?? "there",
      trackName: track.name,
      amountPaid: Number(purchase.amountNGN),
    }).catch((err) => {
      console.error("[paystack] track purchase email failed:", err);
    });
  }

  console.log(`[paystack] track purchase ${data.reference} confirmed for user ${purchase.userId}`);
}

/* ── Client invoice payments ──────────────────────────────────────────────── */

export async function handleInvoicePayment(event: PaystackEvent): Promise<void> {
  const { data } = event;
  const invoiceId = data.metadata?.invoiceId;
  if (!invoiceId || !data.reference) return;

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { client: { select: { name: true, email: true } } },
  });

  if (!invoice) {
    console.error(`[paystack] invoice ${invoiceId} not found`);
    return;
  }

  // Paystack sends kobo/cents
  const paymentAmount = new Decimal(data.amount ?? 0).div(100);
  const reference = data.reference;

  // Duplicate check sits inside the transaction so two concurrent deliveries
  // cannot both pass it.
  const result = await prisma.$transaction(async (tx) => {
    const existingPayment = await tx.payment.findFirst({ where: { paystackRef: reference } });
    if (existingPayment) return { skipped: true as const };

    await tx.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: paymentAmount,
        currency: invoice.currency,
        paymentDate: new Date(),
        paymentMethod: "paystack",
        reference,
        paystackRef: reference,
        paystackTxnId: String(data.id),
        status: "CONFIRMED",
        confirmedAt: new Date(),
      },
    });

    const newPaidAmount = new Decimal(invoice.paidAmount).add(paymentAmount);
    const newBalanceDue = new Decimal(invoice.total).sub(newPaidAmount);
    const newStatus: InvoiceStatus = newBalanceDue.lte(0) ? "PAID" : "PARTIALLY_PAID";

    await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        paidAmount: newPaidAmount,
        balanceDue: newBalanceDue.lt(0) ? new Decimal(0) : newBalanceDue,
        status: newStatus,
        paidDate: newStatus === "PAID" ? new Date() : undefined,
      },
    });

    return { skipped: false as const };
  });

  if (result.skipped) {
    console.warn(`[paystack] duplicate payment for ref ${reference}, skipping`);
    return;
  }

  const newBalanceDue = new Decimal(invoice.total).sub(
    new Decimal(invoice.paidAmount).add(paymentAmount)
  );

  emailPaymentReceipt({
    clientEmail: invoice.client.email,
    clientName: invoice.client.name,
    invoiceNumber: invoice.invoiceNumber,
    amountPaid: Number(paymentAmount),
    balanceDue: Number(newBalanceDue.lt(0) ? new Decimal(0) : newBalanceDue),
    currency: invoice.currency,
    reference,
  }).catch((err) => {
    console.error("[paystack] receipt email failed:", err);
  });

  console.log(`[paystack] payment ${reference} recorded for invoice ${invoice.invoiceNumber}`);
}

/* ── CadreHealth subscriptions ────────────────────────────────────────────── */

/** List price of the CadreHealth PRO plan, in whole Naira. Used only as a
 *  fallback when an event arrives without an amount. */
export const PRO_PRICE_NGN = 1500;

/**
 * What to record as the subscription amount, in whole Naira.
 *
 * Paystack reports kobo, and what lands can differ from the list price: a bank
 * transfer carries fees, so the first PRO subscriber paid NGN 1,522.85 against
 * a list price of 1,500. Record what was actually charged, since the alternative
 * is a constant that cannot be reconciled against Paystack settlements. The
 * column is whole Naira, so kobo is lost to rounding either way.
 *
 * Falls back to the list price only when the event carries no usable amount,
 * which is the case for events that are not themselves a charge.
 */
/**
 * Whether a charge should move the billing period, and to when.
 *
 * The period must not be reset just because the handler ran again. Paystack
 * retries, and a replay is run on purpose days later to repair something; both
 * re-deliver the original charge. Resetting then would move a paid-up period
 * to a month from today, quietly taking time the subscriber has already paid
 * for, and would zero their usage counter into the bargain.
 *
 * So a subscriber whose period is still running keeps it. A new subscriber, or
 * one whose period has lapsed, gets a fresh month: that is a genuine renewal.
 */
export function subscriptionPeriod(
  prior: { status?: string | null; currentPeriodEnd?: Date | null } | null,
  now: Date
): { start: Date; end: Date } | null {
  const runningUntil = prior?.currentPeriodEnd;
  if (prior?.status === "ACTIVE" && runningUntil && runningUntil.getTime() > now.getTime()) {
    return null; // leave the period alone
  }
  const end = new Date(now);
  end.setMonth(end.getMonth() + 1);
  return { start: now, end };
}

export function subscriptionAmountNGN(amountKobo: unknown): number {
  if (typeof amountKobo !== "number" || !Number.isFinite(amountKobo) || amountKobo <= 0) {
    return PRO_PRICE_NGN;
  }
  return Math.round(amountKobo / 100);
}

export async function handleCadreSubscription(event: PaystackEvent): Promise<void> {
  if (event.event === "charge.success") {
    const { metadata, customer } = event.data;
    if (metadata?.type !== "cadre_subscription") return;

    const professionalId = metadata.professional_id;
    if (!professionalId) return;

    const now = new Date();
    const chargedNGN = subscriptionAmountNGN(event.data.amount);

    // Read before writing so a retry or a deliberate replay does not send a
    // second welcome. The upsert itself is safely repeatable; the email is not.
    const prior = await prisma.cadreSubscription.findUnique({
      where: { professionalId },
      select: { plan: true, status: true, currentPeriodEnd: true },
    });
    const alreadyPro = prior?.plan === "PRO" && prior.status === "ACTIVE";
    const period = subscriptionPeriod(prior, now);
    // A create is always a new subscriber, so it always starts a period.
    const freshPeriod = period ?? subscriptionPeriod(null, now)!;

    await prisma.cadreSubscription.upsert({
      where: { professionalId },
      update: {
        plan: "PRO",
        status: "ACTIVE",
        amountNGN: chargedNGN,
        // Only on a real renewal. Re-running for a period already paid for
        // would shorten it and wipe the usage counter.
        ...(period
          ? {
              currentPeriodStart: period.start,
              currentPeriodEnd: period.end,
              aiMessagesThisMonth: 0,
              aiMessagesResetAt: now,
            }
          : {}),
        paystackCustomerCode: customer?.customer_code || undefined,
      },
      create: {
        professionalId,
        plan: "PRO",
        status: "ACTIVE",
        amountNGN: chargedNGN,
        currentPeriodStart: freshPeriod.start,
        currentPeriodEnd: freshPeriod.end,
        paystackCustomerCode: customer?.customer_code || undefined,
      },
    });

    if (!alreadyPro) {
      const professional = await prisma.cadreProfessional.findUnique({
        where: { id: professionalId },
        select: { email: true, firstName: true, lastName: true, cadre: true },
      });
      if (professional) {
        // Failing to send must not fail the handler: the subscription is
        // already active and retrying a bug rarely fixes it.
        emailCadreProWelcome({
          person: professional,
          amountKobo: event.data.amount ?? 0,
          reference: event.data.reference ?? "",
          periodStart: freshPeriod.start,
          periodEnd: freshPeriod.end,
        }).catch((err) => {
          console.error("[paystack] cadre pro welcome email failed:", err);
        });
      }
    }
    return;
  }

  if (event.event === "subscription.disable" || event.event === "subscription.not_renew") {
    // These events carry no metadata, so the customer code is the only link
    // back to a subscriber. An unknown code simply matches nothing.
    const customerCode = event.data?.customer?.customer_code;
    if (!customerCode) return;

    await prisma.cadreSubscription.updateMany({
      where: { paystackCustomerCode: customerCode, plan: "PRO" },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });
  }
}

/* ── CadreHealth coaching sessions ────────────────────────────────────────── */

/**
 * A mentee paying for a coaching session.
 *
 * The callback page verifies the same reference when the browser comes back,
 * so this handler is what covers the mentee who closes the tab at the OTP
 * screen and never returns. Whichever arrives first marks the session paid and
 * notifies the mentor; the other finds nothing left to do.
 */
export async function handleCoachingSession(event: PaystackEvent): Promise<void> {
  const { data } = event;
  if (data.metadata?.type !== "cadre_coaching_session") return;

  // The reference is stored immediately after initialize, so it is the usual
  // way back to the session. metadata.session_id covers the moment between
  // those two writes, when the reference is not on the row yet.
  const byRef = data.reference
    ? await prisma.cadreCoachingSession.findUnique({ where: { paystackRef: data.reference } })
    : null;
  const coachingSession =
    byRef ??
    (data.metadata.session_id
      ? await prisma.cadreCoachingSession.findUnique({ where: { id: data.metadata.session_id } })
      : null);

  if (!coachingSession) {
    console.error(`[paystack] coaching session for ${data.reference} not found`);
    return;
  }

  // The status is the idempotency key: a second delivery claims nothing, so
  // the mentor is not notified twice.
  const claimed = await prisma.cadreCoachingSession.updateMany({
    where: { id: coachingSession.id, status: "PENDING_PAYMENT" },
    data: {
      status: "PAID",
      paidAt: new Date(),
      paystackRef: coachingSession.paystackRef ?? data.reference,
    },
  });
  if (claimed.count === 0) return;

  const mentorProfile = await prisma.cadreMentorProfile.findUnique({
    where: { id: coachingSession.mentorProfileId },
    select: {
      professionalId: true,
      professional: { select: { firstName: true, lastName: true } },
    },
  });
  if (!mentorProfile) return;

  await prisma.cadreNotification.create({
    data: {
      professionalId: mentorProfile.professionalId,
      type: "SYSTEM",
      title: "New coaching session booked",
      message: `Someone has booked a paid coaching session with you on: ${coachingSession.topic}`,
      link: "/oncadre/mentorship/my",
    },
  });

  // The mentor gets a notification in the app. The mentee, who is the one who
  // actually paid, previously got nothing at all.
  const mentee = await prisma.cadreProfessional.findUnique({
    where: { id: coachingSession.menteeId },
    select: { email: true, firstName: true, lastName: true, cadre: true },
  });
  if (mentee) {
    const mentorName = [
      mentorProfile.professional.firstName,
      mentorProfile.professional.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    emailCadreCoachingBooked({
      person: mentee,
      mentorName: mentorName || "your mentor",
      topic: coachingSession.topic,
      amountKobo: data.amount ?? coachingSession.amountNGN * 100,
      reference: data.reference ?? "",
      durationMinutes: coachingSession.durationMinutes,
    }).catch((err) => {
      console.error("[paystack] coaching confirmation email failed:", err);
    });
  }

  console.log(`[paystack] coaching session ${coachingSession.id} paid (${data.reference})`);
}


/**
 * A paid consultation with Dr Kpaduwa.
 *
 * The diary is held by `paidAt` and by nothing else, which is why the slot is
 * only committed here. Two people can get as far as a Paystack page for the
 * same half hour; only one of them can have the index.
 */
export async function handleLyfeConsultation(event: PaystackEvent): Promise<void> {
  if (event.event !== "charge.success") return;
  const meta = event.data?.metadata;
  if (meta?.type !== "lyfe_consultation") return;

  const reference = event.data?.reference;
  const enquiryId = typeof meta.enquiryId === "string" ? meta.enquiryId : null;
  if (!reference && !enquiryId) {
    console.error("[paystack/lyfe] charge carries neither a reference nor an enquiry id");
    return;
  }

  const entry = await prisma.lyfeEnquiry.findFirst({
    where: reference ? { paymentRef: reference } : { id: enquiryId! },
    select: { id: true, paidAt: true, slotAt: true, fullName: true, email: true, notes: true },
  });
  let keptTheSlot = true;
  if (!entry) {
    console.error(`[paystack/lyfe] no enquiry for reference ${reference}`);
    return;
  }
  if (entry.paidAt) return; // Paystack retries; booking twice does not.

  const paidAt = new Date();
  const amountKobo = typeof event.data?.amount === "number" ? event.data.amount : null;

  try {
    await prisma.lyfeEnquiry.update({
      where: { id: entry.id },
      data: {
        paidAt,
        status: "BOOKED",
        amountKobo: amountKobo ?? undefined,
        nextAction: "Send the video link and the pre-consultation note.",
        nextActionAt: new Date(paidAt.getTime() + 24 * 60 * 60 * 1000),
      },
    });
  } catch (err) {
    // The partial unique index on a paid slot has refused it, so somebody else
    // paid for this half hour first. The money is real and the slot is not, so
    // the row keeps the money, loses the slot, and lands on the coordinator's
    // list saying exactly that.
    const code = (err as { code?: string })?.code;
    if (code !== "P2002") throw err;
    keptTheSlot = false;
    const wanted = entry.slotAt?.toISOString() ?? "unknown";
    console.error(`[paystack/lyfe] ${entry.id} paid for a slot already sold (${wanted})`);
    await prisma.lyfeEnquiry.update({
      where: { id: entry.id },
      data: {
        paidAt,
        slotAt: null,
        status: "BOOKED",
        amountKobo: amountKobo ?? undefined,
        nextAction: "PAID BUT DOUBLE BOOKED. Offer another time today, or refund.",
        nextActionAt: paidAt,
        notes: [entry.notes, `Paid for ${wanted}, which had already gone.`].filter(Boolean).join("\n"),
      },
    });
  }

  // The booking is committed either way, so nothing below is allowed to undo
  // it. A confirmation that fails to send is a telephone call; a throw here is
  // a payment Paystack retries and a diary that never settles.
  try {
    const { emailLyfeConsultationConfirmed } = await import("@/lib/lyfeEmail");
    await emailLyfeConsultationConfirmed({
      to: entry.email,
      firstName: entry.fullName.trim().split(/\s+/)[0] ?? entry.fullName,
      slotAt: keptTheSlot ? entry.slotAt : null,
    });
  } catch (err) {
    console.error(`[paystack/lyfe] confirmation email failed for ${entry.id}:`, err);
  }

  try {
    const { notifyInternal } = await import("@/lib/email");
    const when = entry.slotAt ? entry.slotAt.toISOString() : "no slot";
    await notifyInternal(
      process.env.LYFE_COORDINATOR_EMAILS?.split(",")[0]?.trim() || "hello@consultforafrica.com",
      keptTheSlot ? `PAID: ${entry.fullName}, ${when}` : `PAID BUT DOUBLE BOOKED: ${entry.fullName}`,
      `<p>${entry.fullName} (${entry.email}) has paid for a consultation.</p><p>Slot: ${when}</p>` +
        (keptTheSlot ? "" : "<p><strong>That half hour had already gone. Offer another time today or refund.</strong></p>"),
    );
  } catch (err) {
    console.error(`[paystack/lyfe] coordinator notice failed for ${entry.id}:`, err);
  }
}
