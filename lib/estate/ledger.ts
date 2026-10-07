import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * The unit ledger.
 *
 * Every tenant has two accounts: a prepaid diesel deposit that generator runs
 * draw down, and a service charge account. Both work the same way — positive
 * puts them in credit, negative draws it down, and the balance is the sum of the
 * rows and nothing else.
 *
 * There is no cached balance column. A cached balance is a second source of
 * truth, it drifts the first time a write fails halfway, and the tenant finds
 * the day it disagrees with the statement. Twelve units will not out-run a
 * SUM().
 */

export type EstateAccount = "DIESEL" | "SERVICE_CHARGE";

export interface UnitBalances {
  unitId: string;
  diesel: number;
  serviceCharge: number;
}

/** Balances for a set of units in one query. Units with no rows come back at 0. */
export async function balancesForUnits(unitIds: string[]): Promise<Map<string, UnitBalances>> {
  const out = new Map<string, UnitBalances>(
    unitIds.map((id) => [id, { unitId: id, diesel: 0, serviceCharge: 0 }]),
  );
  if (unitIds.length === 0) return out;

  const grouped = await prisma.estateLedgerEntry.groupBy({
    by: ["unitId", "account"],
    where: { unitId: { in: unitIds } },
    _sum: { amount: true },
  });

  for (const row of grouped) {
    const entry = out.get(row.unitId);
    if (!entry) continue;
    const value = Number(row._sum.amount ?? 0);
    if (row.account === "DIESEL") entry.diesel = value;
    else entry.serviceCharge = value;
  }
  return out;
}

export async function balanceForUnit(unitId: string, account: EstateAccount): Promise<number> {
  const agg = await prisma.estateLedgerEntry.aggregate({
    where: { unitId, account },
    _sum: { amount: true },
  });
  return Number(agg._sum.amount ?? 0);
}

export interface StatementLine {
  id: string;
  occurredAt: Date;
  kind: string;
  description: string;
  amount: number;
  litres: number | null;
  /** Balance after this line. Computed forwards from the opening figure. */
  balance: number;
}

/**
 * A statement a tenant can actually check.
 *
 * Running balance is computed forwards from an explicit opening figure rather
 * than backwards from today's. Backwards is one query cheaper and produces a
 * statement whose earlier rows change every time a new row is added at the end,
 * which is exactly the thing that makes people stop believing a statement.
 */
export async function statement(args: {
  unitId: string;
  account: EstateAccount;
  from?: Date;
  to?: Date;
}): Promise<{ opening: number; closing: number; lines: StatementLine[] }> {
  const opening = args.from
    ? Number(
        (
          await prisma.estateLedgerEntry.aggregate({
            where: { unitId: args.unitId, account: args.account, occurredAt: { lt: args.from } },
            _sum: { amount: true },
          })
        )._sum.amount ?? 0,
      )
    : 0;

  const rows = await prisma.estateLedgerEntry.findMany({
    where: {
      unitId: args.unitId,
      account: args.account,
      ...(args.from || args.to
        ? { occurredAt: { ...(args.from ? { gte: args.from } : {}), ...(args.to ? { lte: args.to } : {}) } }
        : {}),
    },
    orderBy: [{ occurredAt: "asc" }, { createdAt: "asc" }],
  });

  let balance = opening;
  const lines = rows.map((r) => {
    balance = round2(balance + Number(r.amount));
    return {
      id: r.id,
      occurredAt: r.occurredAt,
      kind: r.kind,
      description: r.description,
      amount: Number(r.amount),
      litres: r.litres === null ? null : Number(r.litres),
      balance,
    };
  });

  return { opening: round2(opening), closing: balance, lines };
}

/** What a unit has spent on fuel over a window. Feeds the days-of-cover figure. */
export async function dieselSpendOverWindow(unitId: string, days: number): Promise<number> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const agg = await prisma.estateLedgerEntry.aggregate({
    where: { unitId, account: "DIESEL", kind: "DIESEL_USAGE", occurredAt: { gte: since } },
    _sum: { amount: true },
  });
  // Usage rows are negative. Spend is the magnitude.
  return Math.abs(Number(agg._sum.amount ?? 0));
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** ₦1,234,567.89 — full precision, for statements and anything a tenant checks. */
export function naira(n: Prisma.Decimal | number | string): string {
  return `₦${Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** ₦1.2m — for tiles and headlines, where the exact kobo is noise. */
export function nairaShort(n: Prisma.Decimal | number | string): string {
  const v = Number(n);
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}₦${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}m`;
  if (abs >= 1_000) return `${sign}₦${(abs / 1_000).toFixed(abs >= 100_000 ? 0 : 1)}k`;
  return `${sign}₦${abs.toFixed(0)}`;
}

/** "4h 20m", the way a run gets read out loud. */
export function duration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
