import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import TopBar from "@/components/platform/TopBar";
import { ACK_COVERAGE, ADVANCE_LIVE, FUNDABLE_PAYER_TYPES } from "@/lib/claims-recovery";
import { bookSummary, isOverdue, owedNow } from "@/lib/recovery-ledger";
import { DESK_ROLES, OPEN_STATUSES } from "@/lib/recovery-desk";
import { ageDays } from "@/lib/recovery-rules";
import { AccountBar, ClaimActions, ImportBox, PayerPanel, PayoutButton, ReceiptBox, VetButton } from "./AccountClient";

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

  const [batches, claims, activity, drafts, advances, receipts, acks] = await Promise.all([
    prisma.recoveryBatch.findMany({ where: { accountId }, orderBy: { receivedAt: "desc" }, include: { _count: { select: { claims: true } } } }),
    prisma.recoveryClaim.findMany({ where: { accountId }, orderBy: [{ priority: { sort: "asc", nulls: "last" } }, { billedAmount: "desc" }], include: { payer: true } }),
    prisma.recoveryActivity.findMany({ where: { accountId }, orderBy: { createdAt: "desc" }, take: 40 }),
    prisma.recoveryActivity.findMany({ where: { accountId, kind: "AI_DRAFT" }, orderBy: { createdAt: "desc" }, distinct: ["payerId"] }),
    prisma.recoveryAdvance.findMany({ where: { accountId } }),
    prisma.recoveryReceipt.findMany({ where: { accountId }, orderBy: { receivedAt: "desc" }, take: 30, include: { payer: { select: { name: true } } } }),
    prisma.recoveryAcknowledgment.findMany({ where: { accountId } }),
  ]);
  const now = new Date();
  const book = bookSummary(advances, now);
  const advByClaim = new Map(advances.map((a) => [a.claimId, a]));
  const ackByPayer = new Map(acks.map((a) => [a.payerId, a.signedOn.toISOString().slice(0, 10)]));

  const open = claims.filter((c) => OPEN_STATUSES.includes(c.status));
  const payers = [...new Map(claims.map((c) => [c.payerId, c.payer])).values()];
  const sum = (xs: typeof claims, f: (c: (typeof claims)[number]) => number) => xs.reduce((a, c) => a + f(c), 0);
  const card = "rounded-xl border border-slate-200 bg-white p-4";
  const hmo = claims.filter((c) => FUNDABLE_PAYER_TYPES.includes(c.payer.type));
  const hmoBilled = sum(hmo, (c) => c.billedAmount.toNumber());
  const ackCoverage = hmoBilled ? sum(hmo.filter((c) => ackByPayer.has(c.payerId)), (c) => c.billedAmount.toNumber()) / hmoBilled : 0;
  const payoutsDue = receipts.filter((r) => r.toHospital.gt(0) && !r.hospitalPaidAt);

  return (
    <div className="flex h-full flex-col">
      <TopBar title={`Desk: ${account.hospital.name}`} />
      <div className="flex-1 space-y-8 overflow-y-auto p-6">
        <Link href="/admin/claims-recovery/desk" className="text-sm text-slate-500 hover:underline">All hospitals on the desk</Link>

        <AccountBar id={account.id} status={account.status} signed={account.agreementSignedAt?.toISOString().slice(0, 10) ?? null} advanceRate={account.advanceRate.toNumber()} fundingLive={ADVANCE_LIVE} ackCoverage={ackCoverage} ackNeeded={ACK_COVERAGE} overdue={book.overdue} />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            { v: String(open.length), l: "open claims" },
            { v: naira(sum(open, (c) => c.billedAmount.toNumber())), l: "billed, open" },
            { v: naira(sum(open, (c) => c.vetPayable?.toNumber() ?? 0)), l: "expected payable" },
            { v: naira(sum(claims, (c) => c.recoveredAmount.toNumber())), l: "recovered" },
            { v: naira(sum(claims, (c) => c.acceptedAmount?.toNumber() ?? 0)), l: "accepted by payors" },
          ].map((x) => (
            <div key={x.l} className={card}>
              <p className="text-xl font-semibold text-[#0B3C5D]">{x.v}</p>
              <p className="text-xs text-slate-500">{x.l}</p>
            </div>
          ))}
        </div>

        <section>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">The book with Carbon</h2>
            <span className="flex gap-3 text-xs">
              <a className="text-[#0B3C5D] hover:underline" href={`/api/recovery/export?accountId=${account.id}&kind=book`}>Download the book (CSV)</a>
              <a className="text-[#0B3C5D] hover:underline" href={`/api/recovery/export?accountId=${account.id}&kind=receipts`}>Download receipts (CSV)</a>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {[
              { v: String(book.open), l: "advances open" },
              { v: naira(book.principal.toNumber()), l: "principal out" },
              { v: naira(book.interest.toNumber()), l: "interest beyond the minimum, owed today" },
              { v: book.overdue ? `${book.overdue} · ${naira(book.overdueAmount.toNumber())}` : "None", l: "overdue (recourse)", bad: book.overdue > 0 },
              { v: `${naira(book.withheld.toNumber())} / ${naira(book.released.toNumber())}`, l: "our fees withheld / released" },
            ].map((x) => (
              <div key={x.l} className={card}>
                <p className={`text-xl font-semibold ${"bad" in x && x.bad ? "text-red-700" : "text-[#0B3C5D]"}`}>{x.v}</p>
                <p className="text-xs text-slate-500">{x.l}</p>
              </div>
            ))}
          </div>
          {payoutsDue.length > 0 && (
            <div className={`${card} mt-3`}>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Owed to the hospital from the collection account</h3>
              <div className="space-y-2">
                {payoutsDue.map((r) => (
                  <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span>
                      {naira(r.toHospital.toNumber())} from {r.payer?.name ?? (r.source === "HOSPITAL" ? "the hospital" : "a payor")} ({r.receivedAt.toLocaleDateString("en-GB")}) ·{" "}
                      <span className={r.hospitalDueBy && r.hospitalDueBy < now ? "text-red-700" : "text-slate-500"}>due by {r.hospitalDueBy?.toLocaleString("en-GB", { timeZone: "Africa/Lagos", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    </span>
                    <PayoutButton receiptId={r.id} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <ReceiptBox accountId={account.id} payers={payers.map((p) => ({ id: p.id, name: p.name }))} />
          {receipts.length > 0 ? (
            <div className={card}>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Receipts and their split</h3>
              <div className="space-y-1 text-xs">
                {receipts.map((r) => (
                  <p key={r.id} className="text-slate-600">
                    <span className="text-slate-400">{r.receivedAt.toLocaleDateString("en-GB")}</span> {naira(r.amount.toNumber())} from {r.payer?.name ?? r.source.toLowerCase()}
                    {r.reference ? ` (${r.reference})` : ""}: {naira(r.toFunder.toNumber())} Carbon · {naira(r.toHospital.toNumber())} hospital{r.hospitalPaidAt ? " ✓" : ""}
                    {r.feesReleased.gt(0) ? ` · ${naira(r.feesReleased.toNumber())} fees released` : ""}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div className={card}><p className="text-sm text-slate-500">No money into the collection account yet.</p></div>
          )}
        </section>

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
                    payer={{ id: p.id, name: p.name, type: p.type, conflict: p.conflict, conflictNote: p.conflictNote, advanceEligible: p.advanceEligible, expectedDaysToPay: p.expectedDaysToPay, dueDays: p.dueDays }}
                    ack={ackByPayer.get(p.id) ?? null}
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
            {claims.map((c) => {
              const adv = advByClaim.get(c.id);
              const owed = adv ? owedNow(adv, now) : null;
              return (
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
                    {c.payerAcceptedAt && (
                      <p className="mt-1 text-xs text-green-800">
                        Payor accepted {naira(c.acceptedAmount?.toNumber())} on {c.payerAcceptedAt.toLocaleDateString("en-GB")}{c.acceptanceRef ? ` (${c.acceptanceRef})` : ""}
                      </p>
                    )}
                    {adv && owed && (
                      <p className={`mt-1 text-xs ${isOverdue(adv, now) ? "text-red-700" : "text-slate-700"}`}>
                        Advance {naira(adv.principal.toNumber())} on {adv.disbursedAt.toLocaleDateString("en-GB")}: {naira(adv.netDisbursed.toNumber())} to the hospital after {naira(adv.discount.toNumber())} discount ({adv.minDays} days) and {naira(adv.fee.toNumber())} fee ({adv.feeStatus.toLowerCase()}).{" "}
                        {adv.status === "OPEN"
                          ? `Owed today ${naira(owed.total.toNumber())}${owed.interest.gt(0) ? ` incl. ${naira(owed.interest.toNumber())} interest` : ""}; due ${adv.dueAt.toLocaleDateString("en-GB")}${isOverdue(adv, now) ? ", OVERDUE" : ""}.`
                          : `Repaid ${adv.repaidAt?.toLocaleDateString("en-GB")}.`}
                      </p>
                    )}
                    {c.nextAction && <p className="mt-1 text-xs font-medium text-[#0B3C5D]">Next: {c.nextAction}{c.nextActionAt ? ` (by ${c.nextActionAt.toLocaleDateString("en-GB")})` : ""}</p>}
                  </div>
                  <ClaimActions
                    claim={{ id: c.id, accountId: c.accountId, status: c.status, verdict: c.vetVerdict, confirmed: !!c.vetConfirmedAt, decision: c.decision, approved: !!c.approvedAt, accepted: !!c.payerAcceptedAt, advanced: !!adv, advanceOpen: adv?.status === "OPEN" }}
                  />
                </div>
              </div>
              );
            })}
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
