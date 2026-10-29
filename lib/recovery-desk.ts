import * as XLSX from "xlsx";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { newToken } from "@/lib/hospital-sales";
import { ADVANCE_LIVE } from "@/lib/claims-recovery";
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
  const advanced = { status: { in: ["ADVANCED", "IN_RECOVERY", "PART_PAID"] }, advanceAmount: { not: null } };
  const [tot, pay] = await Promise.all([
    prisma.recoveryClaim.aggregate({ where: { accountId: c.accountId, ...advanced }, _sum: { advanceAmount: true } }),
    prisma.recoveryClaim.aggregate({ where: { accountId: c.accountId, payerId: c.payerId, ...advanced }, _sum: { advanceAmount: true } }),
  ]);
  const d = decide({
    status: c.status,
    vetVerdict: c.vetVerdict,
    vetLikelihood: c.vetLikelihood,
    vetConfirmed: !!c.vetConfirmedAt,
    vetPayable: c.vetPayable,
    billedAmount: c.billedAmount,
    tariffAmount: c.tariffAmount,
    ageDays: ageDays(c.serviceDate, c.submittedAt),
    payer: { advanceEligible: c.payer.advanceEligible, conflict: c.payer.conflict },
    account: { status: c.account.status, advanceRate: c.account.advanceRate, maxClaimAgeDays: c.account.maxClaimAgeDays, payerCap: c.account.payerCap, facilityLimit: c.account.facilityLimit, agreementSigned: !!c.account.agreementSignedAt },
    outstandingTotal: tot._sum.advanceAmount ?? D(0),
    outstandingPayer: pay._sum.advanceAmount ?? D(0),
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

export async function recordPayment(claimId: string, amount: string, receivedAt: Date, reference: string | null, userId: string) {
  const amt = D(amount);
  if (amt.lte(0)) throw new Error("Amount must be positive");
  return prisma.$transaction(async (tx) => {
    const c = await tx.recoveryClaim.findUniqueOrThrow({ where: { id: claimId } });
    const recovered = c.recoveredAmount.add(amt);
    const target = c.vetPayable ?? c.tariffAmount ?? c.billedAmount;
    const status = recovered.gte(target) ? "PAID" : "PART_PAID";
    await tx.recoveryPayment.create({ data: { claimId, amount: amt, receivedAt, reference, recordedById: userId } });
    await tx.recoveryClaim.update({ where: { id: claimId }, data: { recoveredAmount: recovered, status, closedAt: status === "PAID" ? new Date() : null, nextAction: status === "PAID" ? null : c.nextAction } });
    await tx.recoveryActivity.create({ data: { accountId: c.accountId, claimId, payerId: c.payerId, kind: "PAYMENT", summary: `₦${amt.toFixed(2)} received${reference ? ` (${reference})` : ""}. ${status === "PAID" ? "Claim paid in full." : `₦${recovered.toFixed(2)} of ₦${target.toFixed(2)} so far.`}`, amount: amt, createdById: userId } });
    return { status, recovered: recovered.toFixed(2) };
  });
}
