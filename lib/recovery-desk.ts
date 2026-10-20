import * as XLSX from "xlsx";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { newToken } from "@/lib/hospital-sales";
import { ADVANCE_LIVE, FUNDABLE_PAYER_TYPES, MAX_DUE_DAYS } from "@/lib/claims-recovery";
import { recordReceipt } from "@/lib/recovery-ledger";
import { digestCall, planRecovery, vetClaims, type ClaimForVetting } from "@/lib/recovery-ai";
import { ageDays, decide } from "@/lib/recovery-rules";

/**
 * Server operations for the claims recovery desk. Routes stay thin; every
 * write that moves a claim also appends a RecoveryActivity, so the trail of
 * who did what, and what the model said, is never lost.
 */

export const DESK_ROLES = ["PARTNER", "ADMIN", "ASSOCIATE_DIRECTOR", "DIRECTOR"];
export const OPEN_STATUSES = ["RECEIVED", "VETTED", "ADVANCED", "IN_RECOVERY", "PART_PAID"];

const D = (n: number | string) => new Prisma.Decimal(n);

export async function openAccount(hospitalId: string) {
  return prisma.recoveryAccount.upsert({
    where: { hospitalId },
    create: { hospitalId, intakeToken: newToken() },
    update: {},
  });
}

// ── Claim import ─────────────────────────────────────────────────────────

const COLS: Record<string, string[]> = {
  claimRef: ["claim ref", "claim reference", "claim no", "claim number", "claim id", "reference", "ref"],
  payer: ["payer", "hmo", "company", "insurer", "plan", "health plan"],
  payerType: ["payer type", "type"],
  enrolleeRef: ["enrollee id", "enrollee", "member id", "member no", "enrollee number"],
  serviceDate: ["service date", "date of service", "encounter date", "date"],
  submittedAt: ["submitted", "date submitted", "submission date"],
  serviceSummary: ["service", "description", "procedure", "diagnosis", "treatment"],
  authCode: ["auth code", "authorisation code", "authorization code", "pa code", "approval code"],
  documents: ["documents", "documents held", "attachments"],
  billed: ["billed", "amount", "amount billed", "claim amount", "billed amount"],
  tariff: ["tariff", "tariff amount", "agreed tariff"],
  payerResponse: ["payer response", "status", "hmo response", "remark", "remarks"],
  accepted: ["accepted amount", "approved amount", "amount approved", "amount accepted", "vetted amount"],
  acceptedAt: ["date accepted", "accepted on", "approval date", "date approved"],
  acceptanceRef: ["acceptance ref", "approval ref", "batch approval", "remittance advice"],
};

function parseDate(v: string | null): Date | null {
  if (!v) return null;
  const s = v.trim();
  const dmY = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/); // Nigerian day-first
  if (dmY) {
    const y = dmY[3].length === 2 ? 2000 + Number(dmY[3]) : Number(dmY[3]);
    const d = new Date(Date.UTC(y, Number(dmY[2]) - 1, Number(dmY[1])));
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function parseMoney(v: string | null): Prisma.Decimal | null {
  if (!v) return null;
  const c = v.replace(/[₦,\sNGN]/gi, "");
  return /^\d+(\.\d+)?$/.test(c) ? D(c) : null;
}

/** Parse a CSV or pasted spreadsheet into claim rows, reporting what it skipped. */
export function parseClaimsSheet(text: string) {
  const wb = XLSX.read(text, { type: "string", raw: false });
  const grid = XLSX.utils.sheet_to_json<(string | null)[]>(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: null, raw: false });
  const hi = grid.findIndex((r) => r.some((c) => COLS.claimRef.includes(String(c ?? "").trim().toLowerCase())));
  if (hi < 0) throw new Error("No header row with a claim reference column");
  const head = grid[hi].map((c) => String(c ?? "").trim().toLowerCase());
  const at = (k: string) => head.findIndex((h) => COLS[k].includes(h));
  const idx = Object.fromEntries(Object.keys(COLS).map((k) => [k, at(k)]));
  if (idx.payer < 0 || idx.billed < 0) throw new Error("The sheet needs a payer (HMO) column and an amount column");
  const get = (r: (string | null)[], k: string) => (idx[k] >= 0 && r[idx[k]] != null && String(r[idx[k]]).trim() !== "" ? String(r[idx[k]]).trim() : null);

  const rows = [];
  const skipped: string[] = [];
  for (const [n, r] of grid.slice(hi + 1).entries()) {
    const claimRef = get(r, "claimRef");
    if (!claimRef) continue;
    const payer = get(r, "payer");
    const billed = parseMoney(get(r, "billed"));
    if (!payer || !billed) {
      skipped.push(`Row ${hi + n + 2} (${claimRef}): ${!payer ? "no payer" : "amount not a number"}`);
      continue;
    }
    rows.push({
      claimRef,
      payer,
      payerType: get(r, "payerType")?.toUpperCase().replace(/\s+/g, "_") ?? "HMO",
      enrolleeRef: get(r, "enrolleeRef"),
      serviceDate: parseDate(get(r, "serviceDate")),
      submittedAt: parseDate(get(r, "submittedAt")),
      serviceSummary: get(r, "serviceSummary")?.slice(0, 300) ?? null,
      authCode: get(r, "authCode"),
      documentsHeld: (get(r, "documents") ?? "").split(/[,;/]/).map((x) => x.trim()).filter(Boolean),
      billedAmount: billed,
      tariffAmount: parseMoney(get(r, "tariff")),
      payerResponse: get(r, "payerResponse"),
      acceptedAmount: parseMoney(get(r, "accepted")),
      payerAcceptedAt: parseDate(get(r, "acceptedAt")),
      acceptanceRef: get(r, "acceptanceRef"),
    });
  }
  return { rows, skipped };
}

export async function importBatch(accountId: string, kind: "SAMPLE" | "LIVE", text: string, userId: string) {
  const { rows, skipped } = parseClaimsSheet(text);
  if (!rows.length) throw new Error("No usable claims in that sheet");
  const ref = `${kind === "SAMPLE" ? "S" : "B"}-${new Date().toISOString().slice(0, 10)}-${newToken().slice(0, 4).toUpperCase()}`;
  return prisma.$transaction(async (tx) => {
    const batch = await tx.recoveryBatch.create({ data: { accountId, kind, reference: ref } });
    const payerIds = new Map<string, string>();
    let created = 0;
    let duplicates = 0;
    for (const r of rows) {
      const name = r.payer.replace(/\s+/g, " ");
      let payerId = payerIds.get(name.toLowerCase());
      if (!payerId) {
        const p = await tx.recoveryPayer.upsert({ where: { name }, create: { name, type: r.payerType }, update: {} });
        payerId = p.id;
        payerIds.set(name.toLowerCase(), payerId);
      }
      const exists = await tx.recoveryClaim.findUnique({ where: { accountId_payerId_claimRef: { accountId, payerId, claimRef: r.claimRef } }, select: { id: true } });
      if (exists) {
        duplicates++;
        continue;
      }
      await tx.recoveryClaim.create({
        data: {
          batchId: batch.id, accountId, payerId,
          claimRef: r.claimRef, enrolleeRef: r.enrolleeRef, serviceDate: r.serviceDate, submittedAt: r.submittedAt,
          serviceSummary: r.serviceSummary, authCode: r.authCode, documentsHeld: r.documentsHeld,
          billedAmount: r.billedAmount, tariffAmount: r.tariffAmount, payerResponse: r.payerResponse,
          // The sheet's acceptance is the hospital's word; a person checks it before approving.
          ...(r.acceptedAmount ? { acceptedAmount: r.acceptedAmount, payerAcceptedAt: r.payerAcceptedAt ?? new Date(), acceptanceRef: r.acceptanceRef } : {}),
        },
      });
      created++;
    }
    await tx.recoveryActivity.create({
      data: { accountId, kind: "STATUS", summary: `Batch ${ref} received: ${created} claims${duplicates ? `, ${duplicates} already on file` : ""}${skipped.length ? `, ${skipped.length} rows skipped` : ""}`, createdById: userId },
    });
    return { batchId: batch.id, reference: ref, created, duplicates, skipped };
  });
}

// ── Verification ─────────────────────────────────────────────────────────

const CHUNK = 10;
/** Claims verified per request, so one press stays inside a 300s function. */
export const VET_PER_RUN = 20;

export async function vetBatch(batchId: string, userId: string) {
  const claims = await prisma.recoveryClaim.findMany({
    where: { batchId, status: "RECEIVED" },
    include: { payer: { select: { name: true, type: true } } },
    orderBy: { billedAmount: "desc" },
    take: VET_PER_RUN,
  });
  await prisma.recoveryBatch.update({ where: { id: batchId }, data: { status: "VETTING" } });
  let vetted = 0;
  let unreadable = 0;
  for (let i = 0; i < claims.length; i += CHUNK) {
    const slice = claims.slice(i, i + CHUNK);
    const input: ClaimForVetting[] = slice.map((c) => ({
      id: c.id,
      claimRef: c.claimRef,
      payer: c.payer.name,
      payerType: c.payer.type,
      serviceDate: c.serviceDate?.toISOString().slice(0, 10) ?? null,
      submittedAt: c.submittedAt?.toISOString().slice(0, 10) ?? null,
      ageDays: ageDays(c.serviceDate, c.submittedAt),
      serviceSummary: c.serviceSummary,
      authCode: c.authCode,
      documentsHeld: c.documentsHeld,
      billedAmount: c.billedAmount.toNumber(),
      tariffAmount: c.tariffAmount?.toNumber() ?? null,
      payerResponse: c.payerResponse,
    }));
    const { data, model, refused } = await vetClaims(input);
    const byId = new Map((data?.claims ?? []).map((x) => [x.id, x]));
    for (const c of slice) {
      const v = byId.get(c.id);
      if (!v) {
        unreadable++;
        await prisma.recoveryActivity.create({ data: { accountId: c.accountId, claimId: c.id, kind: "AI_VET", summary: refused ? "Automatic verification declined this claim. Vet by hand." : "Automatic verification returned nothing for this claim. Vet by hand.", createdById: userId } });
        continue;
      }
      const payable = D(Math.round(v.expectedPayable * 100) / 100);
      await prisma.$transaction([
        prisma.recoveryClaim.update({
          where: { id: c.id },
          data: {
            status: "VETTED",
            vetVerdict: v.verdict,
            vetLikelihood: v.likelihood,
            vetPayable: payable.gt(c.billedAmount) ? c.billedAmount : payable,
            vetIssues: v.issues,
            vetRepairs: v.repairs,
            vetRationale: v.rationale,
            vetModel: model,
            vettedAt: new Date(),
            vetConfirmedAt: null,
            vetConfirmedById: null,
          },
        }),
        prisma.recoveryActivity.create({
          data: { accountId: c.accountId, claimId: c.id, kind: "AI_VET", summary: `${v.verdict} at ${v.likelihood}%: ${v.rationale}`, detail: { issues: v.issues, repairs: v.repairs, model }, createdById: userId },
        }),
      ]);
      vetted++;
    }
  }
  const left = await prisma.recoveryClaim.count({ where: { batchId, status: "RECEIVED" } });
  if (!left) await prisma.recoveryBatch.update({ where: { id: batchId }, data: { status: "VETTED", vettedAt: new Date() } });
  return { vetted, unreadable, left };
}

// ── Decisioning ──────────────────────────────────────────────────────────

export async function decideClaim(claimId: string, userId: string) {
  const c = await prisma.recoveryClaim.findUniqueOrThrow({ where: { id: claimId }, include: { payer: true, account: true } });
  const [open, ack, overdueCount, billing] = await Promise.all([
    prisma.recoveryAdvance.findMany({ where: { accountId: c.accountId, status: "OPEN" }, select: { payerId: true, principal: true, principalRepaid: true } }),
    prisma.recoveryAcknowledgment.findMany({ where: { accountId: c.accountId }, select: { payerId: true } }),
    prisma.recoveryAdvance.count({ where: { accountId: c.accountId, status: "OPEN", dueAt: { lt: new Date() } } }),
    prisma.recoveryClaim.groupBy({ by: ["payerId"], where: { accountId: c.accountId, payer: { type: { in: FUNDABLE_PAYER_TYPES } } }, _sum: { billedAmount: true } }),
  ]);
  const out = (xs: typeof open) => xs.reduce((s, a) => s.add(a.principal.sub(a.principalRepaid)), D(0));
  const signed = new Set(ack.map((a) => a.payerId));
  const allBilled = billing.reduce((s, b) => s.add(b._sum.billedAmount ?? 0), D(0));
  const signedBilled = billing.filter((b) => signed.has(b.payerId)).reduce((s, b) => s.add(b._sum.billedAmount ?? 0), D(0));
  const d = decide({
    status: c.status,
    vetVerdict: c.vetVerdict,
    vetLikelihood: c.vetLikelihood,
    vetConfirmed: !!c.vetConfirmedAt,
    vetPayable: c.vetPayable,
    billedAmount: c.billedAmount,
    tariffAmount: c.tariffAmount,
    ageDays: ageDays(c.serviceDate, c.submittedAt),
    acceptedAmount: c.payerAcceptedAt ? c.acceptedAmount : null,
    payer: { advanceEligible: c.payer.advanceEligible, conflict: c.payer.conflict, type: c.payer.type, acknowledged: signed.has(c.payerId) },
    ackCoverage: allBilled.gt(0) ? signedBilled.div(allBilled).toNumber() : 0,
    overdueCount,
    account: { status: c.account.status, advanceRate: c.account.advanceRate, maxClaimAgeDays: c.account.maxClaimAgeDays, payerCap: c.account.payerCap, facilityLimit: c.account.facilityLimit, agreementSigned: !!c.account.agreementSignedAt },
    outstandingTotal: out(open),
    outstandingPayer: out(open.filter((a) => a.payerId === c.payerId)),
    fundingLive: ADVANCE_LIVE,
  });
  await prisma.$transaction([
    prisma.recoveryClaim.update({ where: { id: claimId }, data: { decision: d.decision, decisionAmount: d.amount, decisionReasons: d.reasons, decidedAt: new Date(), approvedAt: null, approvedById: null } }),
    prisma.recoveryActivity.create({ data: { accountId: c.accountId, claimId, kind: "DECISION", summary: `${d.decision}${d.decision === "ADVANCE" ? ` ₦${d.amount.toFixed(2)}` : ""}: ${d.reasons.join("; ")}`, amount: d.amount, createdById: userId } }),
  ]);
  return d;
}

// ── Recovery planning and calls ──────────────────────────────────────────

export async function planForPayer(accountId: string, payerId: string, userId: string) {
  const [account, payer, claims, history] = await Promise.all([
    prisma.recoveryAccount.findUniqueOrThrow({ where: { id: accountId }, include: { hospital: { select: { name: true } } } }),
    prisma.recoveryPayer.findUniqueOrThrow({ where: { id: payerId } }),
    prisma.recoveryClaim.findMany({ where: { accountId, payerId, status: { in: OPEN_STATUSES }, NOT: { vetVerdict: "FAIL" } }, include: { activities: { orderBy: { createdAt: "desc" }, take: 1 } } }),
    prisma.recoveryActivity.findMany({ where: { accountId, payerId, kind: { in: ["CALL", "PROMISE", "EMAIL", "LETTER", "ESCALATION", "PAYMENT"] } }, orderBy: { createdAt: "desc" }, take: 12 }),
  ]);
  if (!claims.length) throw new Error("No open claims with this payer");
  const { data, model, refused } = await planRecovery({
    hospital: account.hospital.name,
    payer: payer.name,
    payerType: payer.type,
    payerContact: payer.claimsContact,
    history: history.map((h) => `${h.createdAt.toISOString().slice(0, 10)} ${h.kind}: ${h.summary}`),
    claims: claims.map((c) => ({
      id: c.id,
      claimRef: c.claimRef,
      ageDays: ageDays(c.serviceDate, c.submittedAt),
      billedAmount: c.billedAmount.toNumber(),
      vetPayable: c.vetPayable?.toNumber() ?? null,
      vetVerdict: c.vetVerdict,
      payerResponse: c.payerResponse,
      lastActivity: c.activities[0] ? `${c.activities[0].createdAt.toISOString().slice(0, 10)}: ${c.activities[0].summary}` : null,
    })),
  });
  if (!data) throw new Error(refused ? "The plan request was declined. Plan this payer by hand." : "No plan came back. Try again.");
  const now = Date.now();
  const valid = new Set(claims.map((c) => c.id));
  await prisma.$transaction([
    ...data.queue.filter((q) => valid.has(q.id)).map((q) =>
      prisma.recoveryClaim.update({ where: { id: q.id }, data: { priority: q.priority, nextAction: q.nextAction, nextActionAt: new Date(now + q.dueInDays * 86_400_000) } }),
    ),
    prisma.recoveryActivity.create({
      data: { accountId, payerId, kind: "AI_DRAFT", summary: `Recovery plan drafted for ${payer.name}: ${data.queue.length} claims ranked. Letter and call script ready to review.`, detail: { ...data, model }, createdById: userId },
    }),
  ]);
  return data;
}

export async function logCall(accountId: string, payerId: string, notes: string, userId: string) {
  const [account, payer, claims] = await Promise.all([
    prisma.recoveryAccount.findUniqueOrThrow({ where: { id: accountId }, include: { hospital: { select: { name: true } } } }),
    prisma.recoveryPayer.findUniqueOrThrow({ where: { id: payerId } }),
    prisma.recoveryClaim.findMany({ where: { accountId, payerId, status: { in: OPEN_STATUSES } }, select: { id: true, claimRef: true } }),
  ]);
  const { data, model } = await digestCall({ payer: payer.name, hospital: account.hospital.name, today: new Date().toISOString().slice(0, 10), notes, knownClaimRefs: claims.map((c) => c.claimRef) });
  const byRef = new Map(claims.map((c) => [c.claimRef.toLowerCase(), c.id]));
  // The raw note is always kept, even if the digest fails.
  const ops: Prisma.PrismaPromise<unknown>[] = [
    prisma.recoveryActivity.create({ data: { accountId, payerId, kind: "CALL", summary: data?.summary ?? notes.slice(0, 500), detail: { notes, digest: data ?? null, model }, createdById: userId } }),
  ];
  for (const p of data?.promises ?? []) {
    const due = p.byDate ? new Date(p.byDate) : null;
    ops.push(prisma.recoveryActivity.create({
      data: { accountId, payerId, kind: "PROMISE", summary: `${payer.name} promised ${p.amount ? `₦${p.amount.toLocaleString("en-NG")}` : "payment"}${p.claimRefs.length ? ` on ${p.claimRefs.join(", ")}` : ""}${p.byDate ? ` by ${p.byDate}` : ""}${p.who ? ` (${p.who})` : ""}`, amount: p.amount != null ? D(p.amount) : null, promisedFor: due && !isNaN(due.getTime()) ? due : null, createdById: userId },
    }));
  }
  for (const a of data?.nextActions ?? []) {
    const id = a.claimRef ? byRef.get(a.claimRef.toLowerCase()) : undefined;
    if (id) ops.push(prisma.recoveryClaim.update({ where: { id }, data: { nextAction: a.action, nextActionAt: new Date(Date.now() + a.dueInDays * 86_400_000) } }));
  }
  for (const d of data?.disputes ?? []) {
    const id = byRef.get(d.claimRef.toLowerCase());
    if (id) ops.push(prisma.recoveryClaim.update({ where: { id }, data: { payerResponse: `Disputed: ${d.reason}`.slice(0, 300) } }));
  }
  await prisma.$transaction(ops);
  return data;
}

// ── Money ────────────────────────────────────────────────────────────────

/** One payment against one claim: a receipt with a single line, through the same waterfall. */
export async function recordPayment(claimId: string, amount: string, receivedAt: Date, reference: string | null, userId: string) {
  const c = await prisma.recoveryClaim.findUniqueOrThrow({ where: { id: claimId }, select: { accountId: true, payerId: true, claimRef: true } });
  return recordReceipt({ accountId: c.accountId, payerId: c.payerId, source: "HMO", amount, receivedAt, reference, lines: [{ claimRef: c.claimRef, amount }], userId });
}

// ── Acceptance, letters and payor terms ──────────────────────────────────

export async function markAccepted(claimId: string, amount: string, acceptedOn: Date, ref: string | null, userId: string) {
  const amt = D(amount);
  if (amt.lte(0)) throw new Error("Amount must be positive");
  const c = await prisma.recoveryClaim.findUniqueOrThrow({ where: { id: claimId }, include: { advance: { select: { id: true } } } });
  if (c.advance) throw new Error("Already advanced: the accepted amount is fixed");
  if (amt.gt(c.billedAmount)) throw new Error("Accepted amount is more than was billed");
  await prisma.$transaction([
    prisma.recoveryClaim.update({ where: { id: claimId }, data: { acceptedAmount: amt, payerAcceptedAt: acceptedOn, acceptanceRef: ref, decision: null, decisionAmount: null, approvedAt: null, approvedById: null } }),
    prisma.recoveryActivity.create({ data: { accountId: c.accountId, claimId, payerId: c.payerId, kind: "STATUS", amount: amt, createdById: userId, summary: `Payor accepted ₦${amt.toFixed(2)} of ₦${c.billedAmount.toFixed(2)}${ref ? ` (${ref})` : ""}` } }),
  ]);
}

export async function recordAcknowledgment(accountId: string, payerId: string, signedOn: Date, documentUrl: string | null, notes: string | null, userId: string) {
  const payer = await prisma.recoveryPayer.findUniqueOrThrow({ where: { id: payerId } });
  if (!FUNDABLE_PAYER_TYPES.includes(payer.type)) throw new Error(`Private HMOs only: ${payer.name} is ${payer.type}`);
  await prisma.$transaction([
    prisma.recoveryAcknowledgment.upsert({
      where: { accountId_payerId: { accountId, payerId } },
      create: { accountId, payerId, signedOn, documentUrl, notes, createdById: userId },
      update: { signedOn, documentUrl, notes },
    }),
    prisma.recoveryActivity.create({ data: { accountId, payerId, kind: "LETTER", createdById: userId, summary: `${payer.name} signed the acknowledgment letter on ${signedOn.toISOString().slice(0, 10)}` } }),
  ]);
}

export async function setPayerTerms(payerId: string, type: string, expectedDaysToPay: number, dueDays: number) {
  if (dueDays > MAX_DUE_DAYS) throw new Error(`Due days cannot exceed ${MAX_DUE_DAYS}`);
  if (expectedDaysToPay > dueDays) throw new Error("Expected days to pay cannot be longer than the due days");
  return prisma.recoveryPayer.update({ where: { id: payerId }, data: { type, expectedDaysToPay, dueDays } });
}
