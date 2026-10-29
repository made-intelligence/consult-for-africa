import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LYFE_INVITERS } from "@/lib/lyfe";
import { agelessStatusToken, loadAgelessInvitations } from "@/lib/agelessInvitations";
import InvitationsBoard from "@/components/ageless/InvitationsBoard";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["ASSOCIATE_DIRECTOR", "DIRECTOR", "PARTNER", "ADMIN"];

/** Who the AGELESS email went to, and what came of it. */
export default async function AgelessInvitationsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (!ALLOWED_ROLES.includes(session.user.role)) redirect("/dashboard");

  const { rows, registrants, summary } = await loadAgelessInvitations();
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.consultforafrica.com";
  const hostLink = `${base}/ageless/invitations/${agelessStatusToken()}`;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700">
        AGELESS · 21 October · Capital Club Lagos
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Invitations</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
        Everyone the invitation email went to, and whether it bounced or brought them
        back. Registrations are worked in the{" "}
        <Link href="/admin/lyfe-enquiries" className="font-medium text-amber-800 underline">
          enquiry queue
        </Link>
        .
      </p>
      <div className="mt-5 max-w-3xl rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-medium text-slate-800">The host&apos;s link, no login needed</p>
        <p className="mt-1">
          Shows the same page with emails shortened. Anyone holding it can see the names, so
          send it only to the hosts.
        </p>
        <p className="mt-2 select-all break-all font-mono text-xs text-slate-800">{hostLink}</p>
      </div>
      <div className="mt-8">
        <InvitationsBoard
          summary={summary}
          rows={rows.map((r) => ({ ...r, sentAt: r.sentAt?.toISOString() ?? null }))}
          registrants={registrants.map((r) => ({ ...r, at: r.at.toISOString() }))}
          inviterNames={Object.fromEntries(LYFE_INVITERS.map((i) => [i.key, i.name]))}
        />
      </div>
    </div>
  );
}
