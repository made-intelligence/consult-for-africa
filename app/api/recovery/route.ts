import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/apiAuth";
import { DESK_ROLES, decideClaim, importBatch, logCall, openAccount, planForPayer, recordPayment, vetBatch } from "@/lib/recovery-desk";

// The claims recovery desk. One POST with an action, so the admin screens have
// a single place to call and every action shares the same role check.

export const maxDuration = 300; // vetting a batch makes several model calls

const id = z.string().min(1).max(40);
const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("openAccount"), hospitalId: id }),
  z.object({ action: z.literal("import"), accountId: id, kind: z.enum(["SAMPLE", "LIVE"]), text: z.string().min(10).max(2_000_000) }),
  z.object({ action: z.literal("vet"), batchId: id }),
  z.object({ action: z.literal("confirmVet"), claimId: id }),
  z.object({ action: z.literal("decide"), claimId: id }),
  z.object({ action: z.literal("approve"), claimId: id }),
  z.object({ action: z.literal("markAdvanced"), claimId: id }),
  z.object({ action: z.literal("plan"), accountId: id, payerId: id }),
  z.object({ action: z.literal("call"), accountId: id, payerId: id, notes: z.string().trim().min(10).max(20_000) }),
  z.object({ action: z.literal("payment"), claimId: id, amount: z.string().regex(/^\d+(\.\d{1,2})?$/), receivedAt: z.string(), reference: z.string().max(120).nullable() }),
  z.object({ action: z.literal("note"), accountId: id, claimId: id.nullable(), text: z.string().trim().min(2).max(4000) }),
  z.object({ action: z.literal("writeOff"), claimId: id, reason: z.string().trim().min(3).max(500) }),
  z.object({ action: z.literal("payerFlags"), payerId: id, conflict: z.boolean(), conflictNote: z.string().max(300).nullable(), advanceEligible: z.boolean() }),
  z.object({ action: z.literal("activate"), accountId: id, signedOn: z.string() }),
]);

export const POST = handler(async function POST(req: NextRequest) {
  const { error, session } = await requireAuth(DESK_ROLES);
  if (error) return error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  const b = parsed.data;
  const me = session.user.id;

  try {
    switch (b.action) {
      case "openAccount":
        return NextResponse.json(await openAccount(b.hospitalId));
      case "import":
        return NextResponse.json(await importBatch(b.accountId, b.kind, b.text, me));
      case "vet":
        return NextResponse.json(await vetBatch(b.batchId, me));
      case "confirmVet": {
        const c = await prisma.recoveryClaim.update({ where: { id: b.claimId }, data: { vetConfirmedAt: new Date(), vetConfirmedById: me } });
        await prisma.recoveryActivity.create({ data: { accountId: c.accountId, claimId: c.id, kind: "STATUS", summary: `Verification confirmed: ${c.vetVerdict}`, createdById: me } });
        return NextResponse.json({ ok: true });
      }
      case "decide":
        return NextResponse.json(await decideClaim(b.claimId, me));
      case "approve": {
        const c = await prisma.recoveryClaim.findUniqueOrThrow({ where: { id: b.claimId } });
        if (c.decision !== "ADVANCE") return NextResponse.json({ error: "Only an ADVANCE decision can be approved" }, { status: 409 });
        await prisma.$transaction([
          prisma.recoveryClaim.update({ where: { id: c.id }, data: { approvedAt: new Date(), approvedById: me } }),
          prisma.recoveryActivity.create({ data: { accountId: c.accountId, claimId: c.id, kind: "DECISION", summary: `Advance of ₦${c.decisionAmount?.toFixed(2)} approved for the funder`, amount: c.decisionAmount, createdById: me } }),
        ]);
        return NextResponse.json({ ok: true });
      }
      case "markAdvanced": {
        const c = await prisma.recoveryClaim.findUniqueOrThrow({ where: { id: b.claimId } });
        if (!c.approvedAt || !c.decisionAmount) return NextResponse.json({ error: "Approve the advance first" }, { status: 409 });
        await prisma.$transaction([
          prisma.recoveryClaim.update({ where: { id: c.id }, data: { status: "ADVANCED", advanceAmount: c.decisionAmount, advancedAt: new Date() } }),
          prisma.recoveryActivity.create({ data: { accountId: c.accountId, claimId: c.id, kind: "STATUS", summary: `Funder paid the advance of ₦${c.decisionAmount.toFixed(2)}`, amount: c.decisionAmount, createdById: me } }),
        ]);
        return NextResponse.json({ ok: true });
      }
      case "plan":
        return NextResponse.json(await planForPayer(b.accountId, b.payerId, me));
      case "call":
        return NextResponse.json(await logCall(b.accountId, b.payerId, b.notes, me));
      case "payment": {
        const at = new Date(b.receivedAt);
        if (isNaN(at.getTime())) return NextResponse.json({ error: "Bad date" }, { status: 400 });
        return NextResponse.json(await recordPayment(b.claimId, b.amount, at, b.reference, me));
      }
      case "note":
        await prisma.recoveryActivity.create({ data: { accountId: b.accountId, claimId: b.claimId, kind: "NOTE", summary: b.text, createdById: me } });
        return NextResponse.json({ ok: true });
      case "writeOff": {
        const c = await prisma.recoveryClaim.update({ where: { id: b.claimId }, data: { status: "WRITTEN_OFF", closedAt: new Date(), nextAction: null } });
        await prisma.recoveryActivity.create({ data: { accountId: c.accountId, claimId: c.id, kind: "STATUS", summary: `Written off: ${b.reason}`, createdById: me } });
        return NextResponse.json({ ok: true });
      }
      case "payerFlags":
        await prisma.recoveryPayer.update({ where: { id: b.payerId }, data: { conflict: b.conflict, conflictNote: b.conflictNote, advanceEligible: b.advanceEligible && !b.conflict } });
        return NextResponse.json({ ok: true });
      case "activate": {
        const at = new Date(b.signedOn);
        if (isNaN(at.getTime())) return NextResponse.json({ error: "Bad date" }, { status: 400 });
        const a = await prisma.recoveryAccount.update({ where: { id: b.accountId }, data: { status: "ACTIVE", agreementSignedAt: at } });
        await prisma.recoveryActivity.create({ data: { accountId: a.id, kind: "STATUS", summary: `Agreement signed ${b.signedOn}; account active`, createdById: me } });
        return NextResponse.json({ ok: true });
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed";
    console.error(`[recovery ${b.action}]`, err);
    return NextResponse.json({ error: msg }, { status: 422 });
  }
});
