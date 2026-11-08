/**
 * The daily return: what a practice records about its own day, area by area.
 *
 * The rule it is built on: nobody writes a report. Each thing is recorded once,
 * by the person at the step where it happens, and a missing record shows up as
 * a gap rather than being chased into a document. In v1 most areas are an
 * end-of-day return from the person who runs them, because the live capture
 * (sign-in at the door, patient check-in, the till) does not exist yet. Each
 * section says where its numbers will come from once it does (`laterFrom`), so
 * a section can move from a return to a live event without the principal's
 * view changing shape.
 *
 * The definitions live in code, per client (lib/arabella-daily.ts), so the
 * principal can change what she asks for without a migration. A value that is
 * no longer asked for stays in the stored JSON and is simply not shown.
 *
 * Everything here is pure, so it can be tested without a database.
 */

export type MetricType = "count" | "naira" | "minutes" | "clock" | "yesno" | "text";

export interface Metric {
  code: string;
  label: string;
  type: MetricType;
  hint?: string;
}

/** Shown beside a section, from records the system already holds. */
export type LiveSource = "ROTA" | "SAFETY" | "DECISIONS";

/** Where a section's numbers will come from once live capture exists. */
export type FutureSource = "STAFF_SIGN_IN" | "PATIENT_CHECK_IN" | "BILLING" | "LAB_SYSTEM" | "PHARMACY_SYSTEM";

export type Phase = 1 | 2 | 3;

export interface Derived {
  code: string;
  label: string;
  /** "share" is a / b as a percentage; "sum" adds the listed metrics. */
  kind: "share" | "sum";
  of: string[];
  type?: MetricType;
}

export interface DailySection {
  code: string;
  /** Its number in the agreed list, so the page and the conversation match. */
  number: number;
  title: string;
  /** What it tells the principal, in one line. */
  asks: string;
  /** Roles, not people. Matched against StaffMember.position until mapped. */
  ownerRoles: string[];
  phase: Phase;
  /** FINANCIAL sections are shown only to LEADERSHIP and BOARD. */
  restricted?: "FINANCIAL";
  metrics: Metric[];
  derived?: Derived[];
  /** Up to three codes (metric or derived) for trend tables and the email. */
  headline: string[];
  live?: LiveSource[];
  laterFrom?: FutureSource[];
}

export interface DailyConfig {
  /** Day each phase goes live, YYYY-MM-DD in the practice's calendar. null: not started. */
  phaseStarts: Record<Phase, string | null>;
  /** Hour (practice time) after which today's missing returns are missing, not due. */
  closeHour: number;
  /** Hours the practice is ahead of UTC. Lagos and Abuja: 1. */
  utcOffsetHours: number;
  sections: DailySection[];
}

export type SectionStatus = "IN" | "DUE" | "MISSING" | "NOT_STARTED";

export type Values = Record<string, number | string | boolean>;

const DAY_MS = 864e5;

/** Midnight UTC of the practice's own calendar day. The key DailyReturn.day is stored under. */
export function practiceDay(config: Pick<DailyConfig, "utcOffsetHours">, now = new Date()): Date {
  const local = new Date(now.getTime() + config.utcOffsetHours * 3600e3);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()));
}

export function practiceHour(config: Pick<DailyConfig, "utcOffsetHours">, now = new Date()): number {
  return new Date(now.getTime() + config.utcOffsetHours * 3600e3).getUTCHours();
}

export function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function parseIsoDay(s: string | undefined | null): Date | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY_MS);
}

/** Has this section's phase started by this day? */
export function isLive(config: DailyConfig, section: DailySection, day: Date): boolean {
  const start = parseIsoDay(config.phaseStarts[section.phase]);
  return !!start && start.getTime() <= day.getTime();
}

export function sectionStatus(
  config: DailyConfig,
  section: DailySection,
  day: Date,
  hasReturn: boolean,
  now = new Date()
): SectionStatus {
  if (hasReturn) return "IN";
  if (!isLive(config, section, day)) return "NOT_STARTED";
  const today = practiceDay(config, now);
  if (day.getTime() > today.getTime()) return "DUE";
  if (day.getTime() === today.getTime() && practiceHour(config, now) < config.closeHour) return "DUE";
  return "MISSING";
}

/**
 * The sections with no return for the day that should have one. Not-started
 * sections are never missing: a gap is only a gap once the area was asked.
 */
export function missingSections(
  config: DailyConfig,
  day: Date,
  submitted: Iterable<string>,
  now = new Date()
): DailySection[] {
  const have = new Set(submitted);
  return config.sections.filter((s) => sectionStatus(config, s, day, have.has(s.code), now) === "MISSING");
}

/** What this viewer may see. Money only for LEADERSHIP and BOARD. */
export function visibleSections(config: DailyConfig, canSeeFinancials: boolean): DailySection[] {
  return config.sections.filter((s) => canSeeFinancials || s.restricted !== "FINANCIAL");
}

export function findSection(config: DailyConfig, code: string): DailySection | undefined {
  return config.sections.find((s) => s.code === code);
}

/**
 * Turn what the form sent into stored values. Blank is left out rather than
 * stored as zero: "nobody counted" and "none" are different answers.
 */
export function cleanValues(section: DailySection, raw: unknown): { values: Values; errors: string[] } {
  const values: Values = {};
  const errors: string[] = [];
  const input = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  for (const m of section.metrics) {
    const v = input[m.code];
    if (v === undefined || v === null || v === "") continue;
    switch (m.type) {
      case "count":
      case "minutes": {
        const n = typeof v === "number" ? v : Number(String(v).replace(/,/g, "").trim());
        if (!Number.isInteger(n) || n < 0 || n > 100000) errors.push(`${m.label}: a whole number, please.`);
        else values[m.code] = n;
        break;
      }
      case "naira": {
        const n = typeof v === "number" ? v : Number(String(v).replace(/[,₦\s]/g, ""));
        if (!Number.isFinite(n) || n < 0 || n > 1e10) errors.push(`${m.label}: an amount in naira, please.`);
        else values[m.code] = Math.round(n * 100) / 100;
        break;
      }
      case "clock": {
        const s = String(v).trim();
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(s)) errors.push(`${m.label}: a time such as 08:15.`);
        else values[m.code] = s;
        break;
      }
      case "yesno": {
        if (v === true || v === "yes" || v === "true") values[m.code] = true;
        else if (v === false || v === "no" || v === "false") values[m.code] = false;
        else errors.push(`${m.label}: yes or no.`);
        break;
      }
      case "text": {
        const s = String(v).trim().slice(0, 400);
        if (s) values[m.code] = s;
        break;
      }
    }
  }
  return { values, errors };
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/** A derived figure (a share or a total) from one day's values. null when it cannot be worked out. */
export function derivedValue(d: Derived, values: Values): number | null {
  if (d.kind === "sum") {
    const parts = d.of.map((c) => num(values[c]));
    if (parts.every((p) => p === null)) return null;
    return parts.reduce<number>((a, p) => a + (p ?? 0), 0);
  }
  const [a, b] = d.of.map((c) => num(values[c]));
  if (a === null || b === null || b === 0) return null;
  return Math.round((a / b) * 100);
}

/** A headline code's value for a day: a metric, or a derived figure. */
export function headlineValue(section: DailySection, code: string, values: Values): number | string | boolean | null {
  const d = section.derived?.find((x) => x.code === code);
  if (d) return derivedValue(d, values);
  return values[code] ?? null;
}

export function headlineLabel(section: DailySection, code: string): string {
  return section.metrics.find((m) => m.code === code)?.label ?? section.derived?.find((d) => d.code === code)?.label ?? code;
}

export function headlineType(section: DailySection, code: string): MetricType | "percent" {
  const m = section.metrics.find((x) => x.code === code);
  if (m) return m.type;
  const d = section.derived?.find((x) => x.code === code);
  return d?.kind === "share" ? "percent" : d?.type ?? "count";
}

export function formatValue(type: MetricType | "percent", v: number | string | boolean | null | undefined): string {
  if (v === null || v === undefined || v === "") return "-";
  if (type === "yesno") return v === true ? "Yes" : v === false ? "No" : String(v);
  if (type === "naira" && typeof v === "number") return `₦${v.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
  if (type === "minutes" && typeof v === "number") return `${v} min`;
  if (type === "percent" && typeof v === "number") return `${v}%`;
  if (typeof v === "number") return v.toLocaleString("en-NG");
  return String(v);
}

/**
 * Who owns a section, from the roles in the config matched against job titles.
 * Loose on purpose, as the task matching is: "Head of Nursing" finds "Head of
 * Nursing Services", "Front desk" finds "Front Desk Officer".
 */
export function ownersFor<T extends { position: string; department?: string | null }>(section: DailySection, staff: T[]): T[] {
  return staff.filter((p) => {
    const hay = `${p.position} ${p.department ?? ""}`.toLowerCase();
    return section.ownerRoles.some((r) => hay.includes(r.toLowerCase()));
  });
}

/** Totals and averages over a run of days, for the 30-day table. */
export function summarise(
  section: DailySection,
  code: string,
  days: Values[]
): { total: number | null; average: number | null; daysIn: number } {
  const type = headlineType(section, code);
  const nums = days.map((v) => headlineValue(section, code, v)).filter((x): x is number => typeof x === "number");
  if (type === "clock" || type === "text" || type === "yesno" || nums.length === 0) {
    return { total: null, average: null, daysIn: days.length };
  }
  const total = nums.reduce((a, b) => a + b, 0);
  const average = Math.round((total / nums.length) * 10) / 10;
  // A total of percentages or of minutes means nothing; the average does.
  return { total: type === "percent" || type === "minutes" ? null : total, average, daysIn: days.length };
}
