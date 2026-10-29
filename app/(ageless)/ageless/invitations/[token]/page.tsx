import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LYFE_INVITERS } from "@/lib/lyfe";
import { isAgelessStatusToken, loadAgelessInvitations, maskEmail } from "@/lib/agelessInvitations";
import InvitationsBoard from "@/components/ageless/InvitationsBoard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Invitations",
  robots: { index: false, follow: false },
};

/**
 * The invitations page for the hosts, who have no platform login. The token
 * is the only key, so emails are shortened here before they leave the server.
 */
export default async function HostInvitationsPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!isAgelessStatusToken(token)) notFound();

  const { rows, registrants, summary } = await loadAgelessInvitations();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-5 py-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700">
          AGELESS · 21 October · Capital Club Lagos
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Where the invitations stand</h1>
        <p className="mt-3 text-sm text-slate-600">
          Live. Refresh the page for the latest.
        </p>
        <div className="mt-8">
          <InvitationsBoard
            summary={summary}
            rows={rows.map((r) => ({
              ...r,
              email: maskEmail(r.email),
              sentAt: r.sentAt?.toISOString() ?? null,
            }))}
            registrants={registrants.map((r) => ({ ...r, at: r.at.toISOString() }))}
            inviterNames={Object.fromEntries(LYFE_INVITERS.map((i) => [i.key, i.name]))}
          />
        </div>
      </div>
    </div>
  );
}
