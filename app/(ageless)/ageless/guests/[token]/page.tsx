import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LYFE_EVENT, LYFE_EVENT_THEME, MEDLYFE_BRAND as MB } from "@/lib/lyfe";
import GuestsForm from "./GuestsForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${LYFE_EVENT_THEME} · Your guests`,
  robots: { index: false, follow: false },
};

/**
 * Where a confirmed guest names the people they are bringing, so each of them
 * gets an access pass of their own. The token is their invitation token.
 */
export default async function GuestsPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const host = await prisma.lyfeEnquiry.findUnique({
    where: { inviteToken: token },
    select: { id: true, fullName: true, guestCount: true, eventStage: true },
  });
  if (!host || host.eventStage !== "CONFIRMED") notFound();

  const named = await prisma.lyfeEnquiry.findMany({
    where: { sourceDetail: `guest-of:${host.id}` },
    orderBy: { createdAt: "asc" },
    select: { fullName: true },
  });

  const firstName = host.fullName.trim().split(/\s+/)[0] ?? host.fullName;

  return (
    <main style={{ background: MB.greenDeep, minHeight: "100vh" }}>
      <div className="mx-auto w-full max-w-xl px-6 py-16 md:py-24">
        <p className="text-[10.5px] font-semibold uppercase" style={{ color: MB.lime, letterSpacing: "0.2em" }}>
          {LYFE_EVENT.host}
        </p>

        <h1
          className="mt-6 text-[40px] leading-[1.05] md:text-[54px]"
          style={{ fontFamily: "var(--font-display), Georgia, serif", fontWeight: 600, color: MB.white, letterSpacing: "-0.02em" }}
        >
          {LYFE_EVENT_THEME}
        </h1>

        <div className="mt-10 p-6" style={{ background: MB.greenDark, borderLeft: `3px solid ${MB.lime}` }}>
          <p className="text-[15px] leading-[1.9]" style={{ color: MB.white }}>
            <strong>{LYFE_EVENT.date}</strong>
            <br />
            Arrival {LYFE_EVENT.arrival} &middot; Programme {LYFE_EVENT.programme} &middot; Close {LYFE_EVENT.close}
            <br />
            {LYFE_EVENT.venueAddress ? `${LYFE_EVENT.venueName}, ${LYFE_EVENT.venueAddress}` : LYFE_EVENT.venueName}
          </p>
        </div>

        <GuestsForm
          token={token}
          firstName={firstName}
          open={host.guestCount ?? 0}
          named={named.map((n) => n.fullName)}
        />
      </div>
    </main>
  );
}
