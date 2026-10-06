import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LYFE_EVENT, LYFE_EVENT_THEME, MEDLYFE_BRAND as MB } from "@/lib/lyfe";
import ConfirmForm from "./ConfirmForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${LYFE_EVENT_THEME} · Confirm your place`,
  robots: { index: false, follow: false },
};

/**
 * The page an invitation links to.
 *
 * The token is the invitation. Anybody holding it can answer for the person it
 * was sent to, which is the same property a paper invitation has, and the same
 * trade: a guest who has to make an account to say yes does not say yes.
 */
export default async function ConfirmPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const guest = await prisma.lyfeEnquiry.findUnique({
    where: { inviteToken: token },
    select: {
      id: true,
      fullName: true,
      guestCount: true,
      eventStage: true,
    },
  });

  if (!guest) notFound();

  const firstName = guest.fullName.trim().split(/\s+/)[0] ?? guest.fullName;
  const answered = guest.eventStage === "CONFIRMED" || guest.eventStage === "DECLINED";

  return (
    <main style={{ background: MB.greenDeep, minHeight: "100vh" }}>
      <div className="mx-auto w-full max-w-xl px-6 py-16 md:py-24">
        <p
          className="text-[10.5px] font-semibold uppercase"
          style={{ color: MB.lime, letterSpacing: "0.2em" }}
        >
          {LYFE_EVENT.host}
        </p>

        <h1
          className="mt-6 text-[40px] leading-[1.05] md:text-[54px]"
          style={{
            fontFamily: "var(--font-display), Georgia, serif",
            fontWeight: 600,
            color: MB.white,
            letterSpacing: "-0.02em",
          }}
        >
          {LYFE_EVENT_THEME}
        </h1>

        <p className="mt-4 text-[16px] leading-relaxed" style={{ color: MB.mist }}>
          {LYFE_EVENT.proposition}
        </p>

        <div
          className="mt-10 p-6"
          style={{ background: MB.greenDark, borderLeft: `3px solid ${MB.lime}` }}
        >
          <p className="text-[15px] leading-[1.9]" style={{ color: MB.white }}>
            <strong>{LYFE_EVENT.date}</strong>
            <br />
            Arrival {LYFE_EVENT.arrival} &middot; Programme {LYFE_EVENT.programme} &middot; Close{" "}
            {LYFE_EVENT.close}
            <br />
            {LYFE_EVENT.venueAddress
              ? `${LYFE_EVENT.venueName}, ${LYFE_EVENT.venueAddress}`
              : LYFE_EVENT.venueName}
          </p>
        </div>

        <ConfirmForm
          token={token}
          firstName={firstName}
          guestCount={guest.guestCount ?? 0}
          alreadyAnswered={answered}
          answeredAs={answered ? (guest.eventStage as "CONFIRMED" | "DECLINED") : null}
        />
      </div>
    </main>
  );
}
