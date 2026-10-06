import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  LYFE_CONSULT,
  LYFE_NAME,
  LYFE_PHONE_DISPLAY,
  LYFE_SURGEON,
  MEDLYFE_BRAND as MB,
  whatsappLink,
} from "@/lib/lyfe";
import { slotLabel } from "@/lib/lyfeEmail";

export const metadata: Metadata = {
  title: "Your consultation",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Where Paystack sends somebody after they pay.
 *
 * It reports what the database says, not what the redirect implies. A person
 * can arrive here with a successful charge whose webhook has not landed yet, so
 * the honest answer in that second is "we are confirming it", with the amount
 * and the time they chose shown so they can see we have the right booking. The
 * webhook is the only thing that marks it paid.
 */
export default async function BookedPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const sp = await searchParams;
  const reference = (sp.reference ?? sp.trxref ?? "").trim();

  const entry = reference
    ? await prisma.lyfeEnquiry
        .findFirst({
          where: { paymentRef: reference },
          select: { fullName: true, slotAt: true, paidAt: true, email: true },
        })
        .catch(() => null)
    : null;

  const firstName = entry?.fullName.trim().split(/\s+/)[0] ?? null;
  const when = entry?.slotAt ? slotLabel(entry.slotAt) : null;
  const confirmed = !!entry?.paidAt;

  return (
    <main
      className="flex min-h-screen items-center justify-center px-5 py-20"
      style={{ background: MB.green }}
    >
      <div className="w-full max-w-xl">
        <div
          className="rounded-2xl p-8 md:p-11"
          style={{ background: MB.greenDeep, border: `1px solid ${MB.lime}44` }}
        >
          <p
            className="text-[11px] font-semibold uppercase"
            style={{ color: MB.greenSoft, letterSpacing: "0.18em" }}
          >
            {confirmed ? "Booked" : entry ? "Confirming" : "Your consultation"}
          </p>

          <h1
            className="mt-4 text-[30px] leading-tight md:text-[38px]"
            style={{ fontFamily: "var(--lyfe-display), Georgia, serif", fontWeight: 600, color: MB.white }}
          >
            {confirmed
              ? `That is booked${firstName ? `, ${firstName}` : ""}.`
              : entry
                ? "We are confirming your payment."
                : "We could not find that booking."}
          </h1>

          {when && (
            <div
              className="mt-7 rounded-xl px-6 py-5"
              style={{ background: MB.green, border: `1px solid ${MB.lime}33` }}
            >
              <p className="text-[20px]" style={{ color: MB.white, fontWeight: 600 }}>
                {when}
              </p>
              <p className="mt-1 text-[14px]" style={{ color: MB.limeSoft }}>
                {LYFE_CONSULT.minutes} minutes with {LYFE_SURGEON.name}, by video.
              </p>
            </div>
          )}

          <p className="mt-6 text-[15px] leading-relaxed" style={{ color: "#AFC2B4" }}>
            {confirmed
              ? "We send the video link the day before. Come with one thing in mind: what you would like to be different. You do not need photographs and you will not be sold to."
              : entry
                ? "Your bank has it and we are waiting on the confirmation, which usually takes a few seconds. You will get an email the moment it lands. Nothing more is needed from you."
                : "If you have just paid, the confirmation is on its way to your email. If you are not sure the payment went through, message us and we will check it rather than charge you twice."}
          </p>

          {confirmed && (
            <p className="mt-4 text-[14px] leading-relaxed" style={{ color: MB.greenSoft }}>
              {LYFE_CONSULT.redeemable}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={whatsappLink(
                firstName
                  ? `Hello, I am ${entry?.fullName}. I have just booked a consultation${when ? ` for ${when}` : ""}.`
                  : "Hello, I have just paid for a consultation and would like to check it came through.",
              )}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl px-6 py-3.5 text-sm font-semibold"
              style={{ background: MB.lime, color: MB.greenDeep }}
            >
              Message us on WhatsApp
            </a>
            <span className="text-[14px]" style={{ color: MB.greenSoft }}>
              or call {LYFE_PHONE_DISPLAY}
            </span>
          </div>

          <p className="mt-9 text-[13px]" style={{ color: MB.greenSoft }}>
            <Link href="/lyfe" className="underline underline-offset-4">
              Back to {LYFE_NAME}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
