import type { Prisma } from "@prisma/client";

/**
 * Diesel: costing a run, and splitting it fairly.
 *
 * The estate does not meter power per flat. What it has is a generator, a
 * switch, and somebody who writes down when the switch moved. Everything here
 * turns that into naira without pretending to a precision the equipment does
 * not have — and, just as importantly, without losing a kobo on the way.
 */

/** Minutes → hours, to the minute. Kept in one place so nothing rounds twice. */
export function runHours(minutes: number): number {
  return minutes / 60;
}

/**
 * Money is handled in kobo as whole numbers for the whole of this file.
 *
 * Floating point is fine for showing a figure and wrong for splitting one: a
 * twelfth of ₦100,000 in doubles does not add back up to ₦100,000, and the
 * missing kobo lands on whichever tenant happens to be last in the array. Ints
 * in, ints out, remainder distributed explicitly.
 */
type Kobo = number;

export function toKobo(naira: Prisma.Decimal | number | string): Kobo {
  return Math.round(Number(naira) * 100);
}

export function fromKobo(kobo: Kobo): number {
  return kobo / 100;
}

/** Centilitres, for the same reason and with the same rules. */
export function toCentilitres(litres: Prisma.Decimal | number | string): number {
  return Math.round(Number(litres) * 100);
}

export interface RunCost {
  runMinutes: number;
  litresUsed: number;
  costNaira: number;
}

/**
 * What a run cost, at the rates in force when it was stopped.
 *
 * Both rates are passed in rather than read from the building inside here, so
 * that the caller is forced to decide which rates apply and to write them onto
 * the run. A run costed against "whatever the building says right now" is a run
 * that silently re-prices itself the next time the pump price moves.
 */
export function costRun(args: {
  startedAt: Date;
  endedAt: Date;
  litresPerHour: number;
  pricePerLitre: number;
}): RunCost {
  const ms = args.endedAt.getTime() - args.startedAt.getTime();
  if (ms <= 0) throw new Error("A run must end after it started.");

  const runMinutes = Math.round(ms / 60000);
  const litresUsed = round2(runHours(runMinutes) * args.litresPerHour);
  const costNaira = round2(litresUsed * args.pricePerLitre);

  return { runMinutes, litresUsed, costNaira };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** A unit as the splitter needs to see it. */
export interface SplitUnit {
  id: string;
  dieselShare: number;
  /** False for vacant, family-occupied and out-of-service units. */
  billable: boolean;
  /** Out-of-service units leave the denominator entirely. */
  inService: boolean;
}

export interface SplitLine {
  unitId: string;
  /** Naira, exact to the kobo. */
  amount: number;
  litres: number;
}

export interface RunSplit {
  lines: SplitLine[];
  /** The share of the bill no tenant carries. The family's own cost. */
  ownerAmount: number;
  ownerLitres: number;
}

/**
 * Split a run across the units of its building.
 *
 * Shares are weights, not percentages: every unit on 1 is an equal split, and a
 * four-bedroom on 1.5 against a two-bedroom's 1 follows size. Out-of-service
 * units are out of the denominator altogether — a flat stripped back for works
 * is not consuming anything, and charging the others a twelfth each when only
 * eleven are live is the kind of quiet unfairness that ends a tenancy.
 *
 * Vacant and family-occupied units stay in the denominator and their share goes
 * to the owner bucket. That is the honest arrangement: a vacancy is the
 * landlord's cost, not a surcharge spread over whoever is still paying.
 *
 * The remainder from the division is handed out by largest fractional part, and
 * ties break on unit id so the same run always splits the same way. The lines
 * plus the owner bucket always sum to the run exactly.
 */
export function splitRun(args: {
  costNaira: number;
  litresUsed: number;
  units: SplitUnit[];
}): RunSplit {
  const live = args.units.filter((u) => u.inService && u.dieselShare > 0);
  if (live.length === 0) {
    return { lines: [], ownerAmount: round2(args.costNaira), ownerLitres: round2(args.litresUsed) };
  }

  const costKobo = toKobo(args.costNaira);
  const litresCl = toCentilitres(args.litresUsed);

  const money = apportion(costKobo, live);
  const fuel = apportion(litresCl, live);

  const lines: SplitLine[] = [];
  let ownerKobo = 0;
  let ownerCl = 0;

  live.forEach((u, i) => {
    if (u.billable) {
      lines.push({ unitId: u.id, amount: fromKobo(money[i]), litres: fuel[i] / 100 });
    } else {
      ownerKobo += money[i];
      ownerCl += fuel[i];
    }
  });

  return { lines, ownerAmount: fromKobo(ownerKobo), ownerLitres: ownerCl / 100 };
}

/**
 * Largest-remainder apportionment. Give everyone their floor, then hand the
 * leftover units out one at a time to whoever was rounded down hardest.
 */
function apportion(total: number, units: SplitUnit[]): number[] {
  const weights = units.map((u) => u.dieselShare);
  const totalWeight = weights.reduce((s, w) => s + w, 0);

  const exact = weights.map((w) => (total * w) / totalWeight);
  const base = exact.map((e) => Math.floor(e));
  let remainder = total - base.reduce((s, b) => s + b, 0);

  const order = exact
    .map((e, i) => ({ i, frac: e - Math.floor(e) }))
    .sort((a, b) => b.frac - a.frac || units[a.i].id.localeCompare(units[b.i].id));

  for (let k = 0; remainder > 0; k++, remainder--) {
    base[order[k % order.length].i] += 1;
  }
  return base;
}

// ─── Rate setting ────────────────────────────────────────────────────────────

/**
 * What the fuel in the tank actually cost, averaged over the deliveries that
 * put it there.
 *
 * The office sets a rate by hand and the tenancies are written against it, so
 * this does not overrule anything. It is here to be shown next to that rate,
 * because the manual rate is the one number in this system that can be wrong
 * for months without anything breaking: bill at ₦1,800 while paying ₦1,900 and
 * the shortfall comes quietly out of the family's pocket, one run at a time.
 */
export function weightedAverageCost(
  deliveries: Array<{ litres: number; pricePerLitre: number }>,
): number | null {
  const litres = deliveries.reduce((s, d) => s + d.litres, 0);
  if (litres <= 0) return null;
  const spend = deliveries.reduce((s, d) => s + d.litres * d.pricePerLitre, 0);
  return round2(spend / litres);
}

/**
 * A starting litres-per-hour for a set whose burn nobody has measured yet.
 *
 * kW = kVA × 0.8, and a diesel set burns roughly 0.25 litres per kWh produced,
 * so litres/hour ≈ kVA × 0.8 × 0.25 × load. Load is the term that matters and
 * the one nobody knows: the same 100 kVA set burns about 11 l/h at half load and
 * about 21 l/h flat out. Treat the answer as somewhere to start and replace it
 * with `calibratedLitresPerHour` as soon as there are dips to fit against.
 */
export function suggestedLitresPerHour(kva: number, loadFactor = 0.5): number {
  return round2(kva * 0.8 * 0.25 * loadFactor);
}

/**
 * The litres-per-hour the tank actually implies.
 *
 * Fitted from what left the tank over what the log says the set ran. Needs a
 * decent window — a week of dips against a week of runs, not one evening — and
 * it inherits every error in the dips, so it is offered to the office as a
 * suggestion to accept, never applied on its own.
 */
export function calibratedLitresPerHour(args: {
  physicalDrawLitres: number;
  loggedMinutes: number;
}): number | null {
  const hours = runHours(args.loggedMinutes);
  if (hours <= 0 || args.physicalDrawLitres <= 0) return null;
  return round2(args.physicalDrawLitres / hours);
}

// ─── Reconciliation ──────────────────────────────────────────────────────────
//
// Two different questions get asked of the same numbers, and running them
// together is the mistake that makes a fuel report useless.
//
//   Did the fuel we paid for arrive?   Waybill litres against the dip rise
//                                      across the discharge. A tight number,
//                                      because both sides are measured. A gap
//                                      here is short delivery, and it is worth
//                                      an argument with the supplier.
//
//   Does the tariff match the tank?    What left the tank against what the run
//                                      log says should have left it. A loose
//                                      number, because one side is an assumed
//                                      10 l/hr against a set whose load swings
//                                      between an empty Tuesday afternoon and a
//                                      full Saturday night. A gap here is
//                                      usually the tariff needing a retune, and
//                                      only a persistent one-directional gap is
//                                      worth treating as fuel walking off.
//
// Wetstock practice puts a measured reconciliation's tolerance under 1%. That
// belongs on the delivery check and nowhere near the consumption check, where
// applying it would raise an alarm every single week and teach everyone to
// ignore alarms.

export type Verdict = "OK" | "WATCH" | "INVESTIGATE" | "NO_DATA";

export interface DeliveryCheck {
  waybillLitres: number;
  dipRiseLitres: number | null;
  shortfallLitres: number | null;
  shortfallPct: number | null;
  shortfallNaira: number | null;
  verdict: Verdict;
}

/**
 * Did the truck deliver what the waybill says?
 *
 * Both sides of this are measured, so the tolerance is tight: under 1% is
 * normal, over 2% is worth a phone call before the driver's next run.
 */
export function checkDelivery(args: {
  waybillLitres: number;
  tankBeforeL: number | null;
  tankAfterL: number | null;
  pricePerLitre: number;
}): DeliveryCheck {
  if (args.tankBeforeL === null || args.tankAfterL === null) {
    return {
      waybillLitres: round2(args.waybillLitres),
      dipRiseLitres: null,
      shortfallLitres: null,
      shortfallPct: null,
      shortfallNaira: null,
      verdict: "NO_DATA",
    };
  }

  const rise = round2(args.tankAfterL - args.tankBeforeL);
  const shortfall = round2(args.waybillLitres - rise);
  const pct = args.waybillLitres > 0 ? shortfall / args.waybillLitres : 0;

  return {
    waybillLitres: round2(args.waybillLitres),
    dipRiseLitres: rise,
    shortfallLitres: shortfall,
    shortfallPct: round2(pct * 100),
    shortfallNaira: round2(shortfall * args.pricePerLitre),
    // One-directional on purpose. A tank that gained more than the waybill is
    // the supplier's problem, not the estate's.
    verdict: pct <= 0.01 ? "OK" : pct <= 0.02 ? "WATCH" : "INVESTIGATE",
  };
}

export interface ConsumptionCheck {
  /** Hours × the agreed litres per hour. What the tenants were billed for. */
  theoreticalLitres: number;
  /** Opening dip + deliveries − closing dip. What left the tank. */
  physicalDrawLitres: number | null;
  varianceLitres: number | null;
  variancePct: number | null;
  varianceNaira: number | null;
  /** The litres-per-hour the tank implies, offered against the one in force. */
  impliedLitresPerHour: number | null;
  verdict: Verdict;
  /** Plain English, because this is the figure that gets read out in a meeting. */
  reading: string;
}

export function checkConsumption(args: {
  loggedMinutes: number;
  litresPerHour: number;
  openingDipL: number | null;
  closingDipL: number | null;
  deliveredLitres: number;
  pricePerLitre: number;
  /** Fractions. Defaults are wide because one side of this is an assumption. */
  watchThreshold?: number;
  investigateThreshold?: number;
}): ConsumptionCheck {
  const watch = args.watchThreshold ?? 0.1;
  const investigate = args.investigateThreshold ?? 0.2;
  const theoretical = round2(runHours(args.loggedMinutes) * args.litresPerHour);

  if (args.openingDipL === null || args.closingDipL === null) {
    return {
      theoreticalLitres: theoretical,
      physicalDrawLitres: null,
      varianceLitres: null,
      variancePct: null,
      varianceNaira: null,
      impliedLitresPerHour: null,
      verdict: "NO_DATA",
      reading: "No tank dips for this window, so the run log has nothing to be checked against.",
    };
  }

  const physical = round2(args.openingDipL + args.deliveredLitres - args.closingDipL);
  const variance = round2(physical - theoretical);
  const pct = theoretical > 0 ? variance / theoretical : 0;
  const abs = Math.abs(pct);
  const implied = calibratedLitresPerHour({
    physicalDrawLitres: physical,
    loggedMinutes: args.loggedMinutes,
  });

  const verdict: Verdict = abs <= watch ? "OK" : abs <= investigate ? "WATCH" : "INVESTIGATE";

  return {
    theoreticalLitres: theoretical,
    physicalDrawLitres: physical,
    varianceLitres: variance,
    variancePct: round2(pct * 100),
    varianceNaira: round2(variance * args.pricePerLitre),
    impliedLitresPerHour: implied,
    verdict,
    reading: readConsumption(verdict, variance, implied, args.litresPerHour),
  };
}

function readConsumption(
  verdict: Verdict,
  variance: number,
  implied: number | null,
  inForce: number,
): string {
  const impliedText =
    implied === null
      ? ""
      : ` The tank implies ${implied} l/hr against the ${inForce} l/hr being billed.`;

  if (verdict === "OK") {
    return `The run log and the tank agree within tolerance.${impliedText}`;
  }
  if (variance > 0) {
    return (
      `More fuel left the tank than the run log accounts for. Either the set is ` +
      `running heavier than ${inForce} l/hr, or it ran at times nobody logged.` +
      impliedText
    );
  }
  return (
    `Less fuel left the tank than the tenants were billed for, so the rate in ` +
    `force is over-recovering and should come down.` + impliedText
  );
}

/**
 * Hours the generator's own meter says it ran, against hours the log says.
 *
 * Where a set has an hour meter this is the cheapest control in the building:
 * the meter cannot be talked to and it does not care whose shift it was. A log
 * that reads consistently longer than the meter is somebody padding hours.
 */
export function meterDrift(args: {
  startMeterHours: number | null;
  endMeterHours: number | null;
  loggedMinutes: number;
}): { meterHours: number; loggedHours: number; driftHours: number } | null {
  if (args.startMeterHours === null || args.endMeterHours === null) return null;
  const meterHours = round2(args.endMeterHours - args.startMeterHours);
  const loggedHours = round2(runHours(args.loggedMinutes));
  return { meterHours, loggedHours, driftHours: round2(loggedHours - meterHours) };
}

// ─── Burn rate ───────────────────────────────────────────────────────────────

/**
 * How long a unit's deposit lasts at the rate it has been going.
 *
 * Deliberately backward-looking over a window rather than projected off the last
 * few days: fuel use here is seasonal and grid-dependent, and a tenant told
 * "four days left" on the back of one heavy weekend stops trusting the number.
 * Null when there is no history to average.
 */
export function daysOfCoverRemaining(args: {
  balanceNaira: number;
  spentNaira: number;
  overDays: number;
}): number | null {
  if (args.overDays <= 0 || args.spentNaira <= 0) return null;
  const perDay = args.spentNaira / args.overDays;
  if (perDay <= 0) return null;
  return Math.max(0, Math.floor(args.balanceNaira / perDay));
}

/**
 * Should this unit be asked to top up?
 *
 * A naira floor on its own is wrong in both directions: it nags a light user
 * sitting on three months of cover and it lets a heavy one run dry with the
 * threshold still comfortably clear. Either test firing is enough.
 */
export function needsTopUp(args: {
  balanceNaira: number;
  floorNaira: number;
  daysOfCover: number | null;
  minDays: number;
}): { due: boolean; reason: string | null } {
  if (args.balanceNaira <= 0) {
    return { due: true, reason: "The deposit is exhausted." };
  }
  if (args.balanceNaira < args.floorNaira) {
    return { due: true, reason: "The deposit is below the building's floor." };
  }
  if (args.daysOfCover !== null && args.daysOfCover < args.minDays) {
    return { due: true, reason: `About ${args.daysOfCover} days of cover left at the recent rate.` };
  }
  return { due: false, reason: null };
}
