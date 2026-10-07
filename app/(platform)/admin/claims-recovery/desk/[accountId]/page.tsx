import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import TopBar from "@/components/platform/TopBar";
import { ADVANCE_LIVE } from "@/lib/claims-recovery";
import { DESK_ROLES, OPEN_STATUSES } from "@/lib/recovery-desk";
import { ageDays } from "@/lib/recovery-rules";
import { AccountBar, ClaimActions, ImportBox, PayerPanel, VetButton } from "./AccountClient";

export const dynamic = "force-dynamic";

const naira = (n: number | null | undefined) => (n == null ? "—" : `₦${n.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`);
const VERDICT: Record<string, string> = { PASS: "bg-green-50 text-green-700", REPAIR: "bg-amber-50 text-amber-700", FAIL: "bg-red-50 text-red-700" };

type Draft = { letterSubject: string; letterBody: string; callScript: string; escalateTo: string | null };

export default async function RecoveryAccountPage({ params }: { params: Promise<{ accountId: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (!DESK_ROLES.includes(session.user.role)) redirect("/dashboard");
  const { accountId } = await params;

  const account = await prisma.recoveryAccount.findUnique({ where: { id: accountId }, include: { hospital: { select: { name: true, lga: true } } } });
  if (!account) notFound();

  const [batches, claims, activity, drafts] = await Promise.all([
    prisma.recoveryBatch.findMany({ where: { accountId }, orderBy: { receivedAt: "desc" }, include: { _count: { select: { claims: true } } } }),
    prisma.recoveryClaim.findMany({ where: { accountId }, orderBy: [{ priority: { sort: "asc", nulls: "last" } }, { billedAmount: "desc" }], include: { payer: true } }),
    prisma.recoveryActivity.findMany({ where: { accountId }, orderBy: { createdAt: "desc" }, take: 40 }),
    prisma.recoveryActivity.findMany({ where: { accountId, kind: "AI_DRAFT" }, orderBy: { createdAt: "desc" }, distinct: ["payerId"] }),
  ]);

  const open = claims.filter((c) => OPEN_STATUSES.includes(c.status));
  const payers = [...new Map(claims.map((c) => [c.payerId, c.payer])).values()];
  const sum = (xs: typeof claims, f: (c: (typeof claims)[number]) => number) => xs.reduce((a, c) => a + f(c), 0);
  const card = "rounded-xl border border-slate-200 bg-white p-4";

  return (
    <div className="flex h-full flex-col">
      <TopBar title={`Desk: ${account.hospital.name}`} />
      <div className="flex-1 space-y-8 overflow-y-auto p-6">
        <Link href="/admin/claims-recovery/desk" className="text-sm text-slate-500 hover:underline">All hospitals on the desk</Link>

        <AccountBar id={account.id} status={account.status} signed={account.agreementSignedAt?.toISOString().slice(0, 10) ?? null} advanceRate={account.advanceRate.toNumber()} fundingLive={ADVANCE_LIVE} />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            { v: String(open.length), l: "open claims" },
            { v: naira(sum(open, (c) => c.billedAmount.toNumber())), l: "billed, open" },
            { v: naira(sum(open, (c) => c.vetPayable?.toNumber() ?? 0)), l: "expected payable" },
            { v: naira(sum(claims, (c) => c.recoveredAmount.toNumber())), l: "recovered" },
            { v: naira(sum(claims, (c) => c.advanceAmount?.toNumber() ?? 0)), l: "advanced" },
          ].map((x) => (
            <div key={x.l} className={card}>
              <p className="text-xl font-semibold text-[#0B3C5D]">{x.v}</p>
              <p className="text-xs text-slate-500">{x.l}</p>
            </div>
          ))}
        </div>

        <section className="grid gap-4 lg:grid-cols-2">
          <ImportBox accountId={account.id} />
          <div className={card}>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Batches</h3>
            {batches.length === 0 && <p className="text-sm text-slate-500">No claims received yet.</p>}
            <div className="space-y-2">
              {batches.map((b) => (
                <div key={b.id} className="flex items-center justify-between text-sm">
                  <span>{b.reference} · {b.kind} · {b._count.claims} claims · <span className="text-slate-500">{b.status}</span></span>
                  {(b.status === "RECEIVED" || b.status === "VETTING") && <VetButton batchId={b.id} />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {payers.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Payers</h2>
            <div className="grid gap-3 lg:grid-cols-2">
              {payers.map((p) => {
                const pc = open.filter((c) => c.payerId === p.id);
                const d = drafts.find((x) => x.payerId === p.id);
                return (
                  <PayerPanel
                    key={p.id}
                    accountId={account.id}
                    payer={{ id: p.id, name: p.name, type: p.type, conflict: p.conflict, conflictNote: p.conflictNote, advanceEligible: p.advanceEligible }}
                    openCount={pc.length}
                    openValue={naira(sum(pc, (c) => c.vetPayable?.toNumber() ?? c.billedAmount.toNumber()))}
                    draft={d ? { ...(d.detail as unknown as Draft), at: d.createdAt.toISOString().slice(0, 10) } : null}
                  />
                );
              })}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Claims, in the order to work them</h2>
          <div className="space-y-2">
            {claims.map((c) => (
              <div key={c.id} className={card}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {c.priority ? <span className="mr-2 text-[#D4AF37]">#{c.priority}</span> : null}
                      {c.claimRef} · {c.payer.name}
                      {c.vetVerdict && <span className={`ml-2 rounded px-1.5 py-0.5 text-xs ${VERDICT[c.vetVerdict]}`}>{c.vetVerdict} {c.vetLikelihood}%{c.vetConfirmedAt ? " ✓" : ""}</span>}
                      <span className="ml-2 text-xs font-normal text-slate-500">{c.status}</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      Billed {naira(c.billedAmount.toNumber())} · payable {naira(c.vetPayable?.toNumber())} · recovered {naira(c.recoveredAmount.toNumber())} · {ageDays(c.serviceDate, c.submittedAt) ?? "?"} days · {c.serviceSummary ?? "no description"}
                    </p>
                    {c.vetRationale && <p className="mt-1 text-xs text-slate-600">{c.vetRationale}</p>}
                    {Array.isArray(c.vetRepairs) && (c.vetRepairs as string[]).length > 0 && (
                      <p className="mt-1 text-xs text-amber-800">Repair: {(c.vetRepairs as string[]).join(" → ")}</p>
                    )}
                    {c.decision && (
                      <p className="mt-1 text-xs text-slate-700">
                        Decision {c.decision}{c.decision === "ADVANCE" ? ` ${naira(c.decisionAmount?.toNumber())}` : ""}: {(c.decisionReasons as string[] | null)?.join("; ")}{c.approvedAt ? " · approved" : ""}
                      </p>
                    )}
                    {c.nextAction && <p className="mt-1 text-xs font-medium text-[#0B3C5D]">Next: {c.nextAction}{c.nextActionAt ? ` (by ${c.nextActionAt.toLocaleDateString("en-GB")})` : ""}</p>}
                  </div>
                  <ClaimActions
                    claim={{ id: c.id, accountId: c.accountId, status: c.status, verdict: c.vetVerdict, confirmed: !!c.vetConfirmedAt, decision: c.decision, approved: !!c.approvedAt }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Activity</h2>
          <div className="space-y-1 text-xs">
            {activity.map((a) => (
              <p key={a.id} className="text-slate-600">
                <span className="text-slate-400">{a.createdAt.toLocaleString("en-GB", { timeZone: "Africa/Lagos", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>{" "}
                <span className="font-semibold">{a.kind}</span> {a.summary}
              </p>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
