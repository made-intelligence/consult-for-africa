import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/apiAuth";
import { DESK_ROLES } from "@/lib/recovery-desk";
import { isOverdue, owedNow } from "@/lib/recovery-ledger";

// The weekly statement until there is a portal: one hospital's advances (the
// book Carbon lends on) or its receipts and their split, as CSV. Interest is
// accrued to today without writing anything.

const cell = (v: unknown) => {
  const s = v == null ? "" : v instanceof Date ? v.toISOString().slice(0, 10) : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = (rows: unknown[][]) => rows.map((r) => r.map(cell).join(",")).join("\n") + "\n";

export const GET = handler(async function GET(req: NextRequest) {
  const { error } = await requireAuth(DESK_ROLES);
  if (error) return error;
  const accountId = req.nextUrl.searchParams.get("accountId") ?? "";
  const kind = req.nextUrl.searchParams.get("kind") === "receipts" ? "receipts" : "book";
  const account = await prisma.recoveryAccount.findUnique({ where: { id: accountId }, include: { hospital: { select: { name: true } } } });
  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const now = new Date();
  let body: string;

  if (kind === "book") {
    const advances = await prisma.recoveryAdvance.findMany({ where: { accountId }, orderBy: { disbursedAt: "asc" }, include: { claim: { select: { claimRef: true, acceptedAmount: true, acceptanceRef: true } }, payer: { select: { name: true } } } });
    body = csv([
      ["Claim ref", "Payor", "Accepted", "Acceptance ref", "Principal", "Discount", "Min days", "Fee", "Net to hospital", "Disbursed", "Due", "Principal repaid", "Principal out", "Interest beyond minimum, owed today", "Owed today", "Status", "Overdue", "Fee status"],
      ...advances.map((a) => {
        const o = owedNow(a, now);
        return [a.claim.claimRef, a.payer.name, a.claim.acceptedAmount?.toFixed(2), a.claim.acceptanceRef, a.principal.toFixed(2), a.discount.toFixed(2), a.minDays, a.fee.toFixed(2), a.netDisbursed.toFixed(2), a.disbursedAt, a.dueAt, a.principalRepaid.toFixed(2), o.principal.toFixed(2), o.interest.toFixed(2), o.total.toFixed(2), a.status, isOverdue(a, now) ? "YES" : "", a.feeStatus];
      }),
    ]);
  } else {
    const receipts = await prisma.recoveryReceipt.findMany({ where: { accountId }, orderBy: { receivedAt: "asc" }, include: { payer: { select: { name: true } }, _count: { select: { allocations: true } } } });
    body = csv([
      ["Received", "From", "Payor", "Reference", "Amount", "Claims covered", "To funder", "To hospital", "Hospital due by", "Paid to hospital", "Our fees released"],
      ...receipts.map((r) => [r.receivedAt, r.source, r.payer?.name, r.reference, r.amount.toFixed(2), r._count.allocations, r.toFunder.toFixed(2), r.toHospital.toFixed(2), r.hospitalDueBy, r.hospitalPaidAt, r.feesReleased.toFixed(2)]),
    ]);
  }

  const name = `${account.hospital.name.replace(/[^A-Za-z0-9]+/g, "-")}-${kind}-${now.toISOString().slice(0, 10)}.csv`;
  return new NextResponse(body, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${name}"` } });
});
