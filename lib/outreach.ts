/**
 * Outreach sprints: a time-boxed drive to get a list of hospitals to one
 * decision. The first is the Aman HMO signing sprint (CLIENT_SIGNING): callers
 * get providers to sign a client's agreement. The same machinery runs CFA's own
 * sales (CFA_SALES) once the sprint closes.
 *
 * Callers work a queue, not a spreadsheet. Every contact is one tap on an
 * outcome button; the outcome moves the stage and sets the next action, and the
 * chase cadence for an agreement that is out runs by itself. The 5pm check-in
 * and the 6pm roll-up are written from the record, so nobody counts by hand.
 *
 * Every touch asks what the provider said in their own words, and which needs
 * they mentioned. That is the listening: it is what we sell to them on later.
 */

export type SprintKind = "CLIENT_SIGNING" | "CFA_SALES";

export const LAGOS_TZ = "Africa/Lagos";

// ---------------------------------------------------------------- stages

export const STAGES = ["TARGET", "CONTACTED", "INTERESTED", "SENT", "SIGNED", "DOCS", "HANDED_OVER"] as const;
export const CLOSED = ["PARKED", "DECLINED", "ALREADY_SIGNED"] as const;
export type Stage = (typeof STAGES)[number] | (typeof CLOSED)[number];
export const ALL_STAGES: readonly Stage[] = [...STAGES, ...CLOSED];

/** Stages that count as a signature for the sprint's total. */
export const SIGNED_STAGES: readonly Stage[] = ["SIGNED", "DOCS", "HANDED_OVER"];

export function stageLabel(stage: string, clientName?: string | null): string {
  const c = clientName ?? "the client";
  const labels: Record<Stage, string> = {
    TARGET: "Target",
    CONTACTED: "Contacted",
    INTERESTED: "Interested",
    SENT: "SLA sent",
    SIGNED: "SLA signed",
    DOCS: "Docs complete",
    HANDED_OVER: `With ${c.replace(/ HMO$/, "")}`,
    PARKED: "Parked",
    DECLINED: "Declined",
    ALREADY_SIGNED: `Already with ${c.replace(/ HMO$/, "")}`,
  };
  return labels[stage as Stage] ?? stage;
}

const rank = (s: string) => STAGES.indexOf(s as (typeof STAGES)[number]);
export const isClosed = (s: string) => (CLOSED as readonly string[]).includes(s);
/** An outcome only ever moves a target forward; closing is explicit. */
export function forward(current: string, next: Stage): Stage {
  if ((CLOSED as readonly string[]).includes(next)) return next;
  if (isClosed(current)) return current as Stage;
  return rank(next) > rank(current) ? next : (current as Stage);
}

// ---------------------------------------------------------------- outcomes

export const CHANNELS = [
  { key: "CALL", label: "Call" },
  { key: "WHATSAPP", label: "WhatsApp" },
  { key: "EMAIL", label: "Email" },
  { key: "VISIT", label: "Visit" },
] as const;
export type Channel = (typeof CHANNELS)[number]["key"] | "NOTE";

export type OutcomeKey =
  | "NO_ANSWER"
  | "FRONT_DESK"
  | "SPOKE_SIGNATORY"
  | "INTERESTED"
  | "SENT"
  | "CHASED"
  | "CALLBACK"
  | "SIGNED"
  | "DOCS"
  | "HANDED_OVER"
  | "DECLINED"
  | "ALREADY_SIGNED";

type Outcome = {
  key: OutcomeKey;
  label: string;
  /** Shown under the button. */
  hint: string;
  stage?: Stage;
  /** Working days until the next action, when the outcome sets one. */
  nextIn?: number;
  next?: string;
  /** Counts as a contact for the check-in. NO_ANSWER does not. */
  contact: boolean;
  /** The caller must write what they said. */
  needsWords?: boolean;
  tone: "neutral" | "good" | "great" | "bad";
};

export const OUTCOMES: Outcome[] = [
  { key: "NO_ANSWER", label: "No answer", hint: "Try again tomorrow", nextIn: 1, next: "Call again", contact: false, tone: "neutral" },
  { key: "FRONT_DESK", label: "Front desk only", hint: "Get the signatory's name and number", stage: "CONTACTED", nextIn: 1, next: "Call the signatory by name", contact: true, tone: "neutral" },
  { key: "SPOKE_SIGNATORY", label: "Spoke to signatory", hint: "Not decided yet", stage: "CONTACTED", nextIn: 2, next: "Follow up with the signatory", contact: true, tone: "neutral" },
  { key: "CALLBACK", label: "Call back later", hint: "Pick the day", nextIn: 1, next: "Call back as agreed", contact: true, tone: "neutral" },
  { key: "INTERESTED", label: "Interested", hint: "Send the SLA today", stage: "INTERESTED", nextIn: 0, next: "Send the SLA today", contact: true, tone: "good" },
  { key: "SENT", label: "SLA sent", hint: "Starts the chase", stage: "SENT", contact: true, tone: "good" },
  { key: "CHASED", label: "Chased, still waiting", hint: "Next step of the chase", contact: true, tone: "neutral" },
  { key: "SIGNED", label: "Signed", hint: "Collect the documents next", stage: "SIGNED", nextIn: 2, next: "Collect the documents", contact: true, tone: "great" },
  { key: "DOCS", label: "Docs complete", hint: "Ready to hand over", stage: "DOCS", nextIn: 0, next: "Hand over the signed pack", contact: true, tone: "great" },
  { key: "HANDED_OVER", label: "Handed over", hint: "Done", stage: "HANDED_OVER", contact: false, tone: "great" },
  { key: "DECLINED", label: "Declined", hint: "Write down why", stage: "DECLINED", contact: true, needsWords: true, tone: "bad" },
  { key: "ALREADY_SIGNED", label: "Already signed", hint: "Take off the list", stage: "ALREADY_SIGNED", contact: true, tone: "neutral" },
];
export const outcome = (k: string) => OUTCOMES.find((o) => o.key === k);

/** Which buttons a target shows, given where it is. */
export function outcomesFor(stage: string): Outcome[] {
  const keys: Record<string, OutcomeKey[]> = {
    TARGET: ["NO_ANSWER", "FRONT_DESK", "SPOKE_SIGNATORY", "CALLBACK", "INTERESTED", "SENT", "DECLINED", "ALREADY_SIGNED"],
    CONTACTED: ["NO_ANSWER", "FRONT_DESK", "SPOKE_SIGNATORY", "CALLBACK", "INTERESTED", "SENT", "DECLINED", "ALREADY_SIGNED"],
    INTERESTED: ["NO_ANSWER", "CALLBACK", "SENT", "DECLINED"],
    SENT: ["CHASED", "NO_ANSWER", "CALLBACK", "SIGNED", "DECLINED"],
    SIGNED: ["DOCS", "CHASED", "NO_ANSWER"],
    DOCS: ["HANDED_OVER"],
  };
  return (keys[stage] ?? []).map((k) => outcome(k)!);
}

// ---------------------------------------------------------------- listening

export const NEEDS = [
  { key: "HMO_PAYMENTS", label: "HMOs pay late" },
  { key: "TARIFF", label: "Tariff too low" },
  { key: "PATIENT_VOLUME", label: "Wants more patients" },
  { key: "STAFFING", label: "Staffing or hiring" },
  { key: "RECORDS", label: "Records or software" },
  { key: "CASH_FLOW", label: "Cash flow" },
  { key: "EXPANSION", label: "Expanding or new site" },
  { key: "QUALITY", label: "Quality or accreditation" },
] as const;
export const needLabel = (k: string) => NEEDS.find((n) => n.key === k)?.label ?? k;

// ---------------------------------------------------------------- the chase

/**
 * From the sprint brief: an SLA that is out is chased at the signatory on
 * working days 2, 3 and 5, visited from day 6, and escalated to the runner on
 * day 8. `day` counts working days from the day it was sent.
 */
export const CHASE = [
  { day: 2, channel: "CALL", action: "Call the admin: has the MD seen the SLA?" },
  { day: 3, channel: "WHATSAPP", action: "WhatsApp the MD: one line, the signing options, a fresh copy attached" },
  { day: 5, channel: "CALL", action: "Call the MD: ask what is stopping them, and log it word for word" },
  { day: 6, channel: "VISIT", action: "Visit to collect the signature (group by area)" },
] as const;
export const ESCALATE_ON_DAY = 8;

// ---------------------------------------------------------------- Lagos time

/** Lagos is UTC+1 all year, with no daylight saving. */
const OFFSET_MS = 60 * 60 * 1000;
const lagosDay = (d: Date) => new Date(d.getTime() + OFFSET_MS).toISOString().slice(0, 10);
export const todayInLagos = (now = new Date()) => lagosDay(now);

/** 5pm Lagos on the given Lagos calendar day. */
function at5pm(day: string): Date {
  return new Date(`${day}T17:00:00+01:00`);
}
export function startOfLagosDay(day: string): Date {
  return new Date(`${day}T00:00:00+01:00`);
}
export function endOfLagosDay(day: string): Date {
  return new Date(`${day}T23:59:59.999+01:00`);
}

function isWeekend(day: string): boolean {
  const dow = new Date(`${day}T12:00:00Z`).getUTCDay();
  return dow === 0 || dow === 6;
}
function nextDay(day: string): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** `n` working days after `from`, at 5pm Lagos. 0 means today (or Monday at a weekend). */
export function addWorkingDays(from: Date, n: number): Date {
  let day = lagosDay(from);
  while (isWeekend(day)) day = nextDay(day);
  for (let i = 0; i < n; i++) {
    day = nextDay(day);
    while (isWeekend(day)) day = nextDay(day);
  }
  return at5pm(day);
}

/** Working days from a to b, counting b but not a. */
export function workingDaysBetween(a: Date, b: Date): number {
  let day = lagosDay(a);
  const end = lagosDay(b);
  let n = 0;
  while (day < end) {
    day = nextDay(day);
    if (!isWeekend(day)) n++;
  }
  return n;
}

// ---------------------------------------------------------------- applying a touch

export type TargetState = {
  stage: string;
  chaseStep: number;
  sentAt: Date | null;
  signedAt: Date | null;
  docsAt: Date | null;
  handedOverAt: Date | null;
  escalatedAt: Date | null;
};

export type TouchEffect = {
  stage: Stage;
  nextAction: string | null;
  nextActionAt: Date | null;
  chaseStep: number;
  sentAt?: Date;
  signedAt?: Date;
  docsAt?: Date;
  handedOverAt?: Date;
  escalatedAt?: Date | null;
  escalationNote?: string;
};

/**
 * What a touch does to a target. A caller can override the next action date
 * (a callback on a day the provider chose); otherwise the outcome and the chase
 * cadence decide it.
 */
export function applyTouch(t: TargetState, key: OutcomeKey, now = new Date(), nextOn?: Date | null): TouchEffect {
  const o = outcome(key);
  if (!o) throw new Error(`Unknown outcome ${key}`);
  const stage = o.stage ? forward(t.stage, o.stage) : (t.stage as Stage);
  const eff: TouchEffect = { stage, nextAction: o.next ?? null, nextActionAt: o.nextIn != null ? addWorkingDays(now, o.nextIn) : null, chaseStep: t.chaseStep };

  if (key === "SENT") {
    eff.sentAt = now;
    eff.chaseStep = 0;
    eff.nextAction = CHASE[0].action;
    eff.nextActionAt = addWorkingDays(now, CHASE[0].day);
    eff.escalatedAt = null;
  }
  if (key === "CHASED" || ((key === "NO_ANSWER" || key === "CALLBACK") && t.stage === "SENT")) {
    // Each chase moves the cadence on a step; past the visit it goes to the runner.
    const sent = t.sentAt ?? now;
    const step = key === "CHASED" ? t.chaseStep + 1 : t.chaseStep;
    eff.chaseStep = step;
    const due = CHASE[step];
    if (due) {
      eff.nextAction = due.action;
      const onCadence = addWorkingDays(sent, due.day);
      // A chase never schedules the next one in the past.
      eff.nextActionAt = onCadence > now ? onCadence : addWorkingDays(now, 1);
    } else if (workingDaysBetween(sent, now) < ESCALATE_ON_DAY) {
      // The visit window runs to day 8; only then does it leave the caller.
      eff.nextAction = "Last try before day 8: get the signature, or it goes to the runner";
      eff.nextActionAt = addWorkingDays(sent, ESCALATE_ON_DAY);
    } else {
      eff.nextAction = "With the runner: escalate or park";
      eff.nextActionAt = addWorkingDays(now, 0);
      eff.escalatedAt = now;
      eff.escalationNote = `Chase finished ${workingDaysBetween(sent, now)} working days after the SLA went out, still unsigned.`;
    }
    if (key === "CALLBACK" && nextOn) eff.nextActionAt = nextOn;
  }
  if (key === "SIGNED") eff.signedAt = now;
  if (key === "DOCS") eff.docsAt = now;
  if (key === "HANDED_OVER") {
    eff.handedOverAt = now;
    eff.nextAction = null;
    eff.nextActionAt = null;
  }
  if (isClosed(stage)) {
    eff.nextAction = null;
    eff.nextActionAt = null;
  }
  if (key === "CALLBACK" && nextOn && t.stage !== "SENT") eff.nextActionAt = nextOn;
  return eff;
}

/** A target still in the chase on or after day 8 goes to the runner even if nobody logged it. */
export function isOverdueForEscalation(t: { stage: string; sentAt: Date | null; escalatedAt: Date | null }, now = new Date()): boolean {
  return t.stage === "SENT" && !!t.sentAt && !t.escalatedAt && workingDaysBetween(t.sentAt, now) >= ESCALATE_ON_DAY;
}

// ---------------------------------------------------------------- scripts

export function whatsappOpener(o: { clientName: string; caller: string; signatory?: string | null; hospital: string }): string {
  const hi = o.signatory ? `Good day ${o.signatory}` : "Good day";
  return `${hi}, this is ${o.caller}, calling for ${o.clientName}'s Lagos provider network. We would like ${o.hospital} in the network: more insured patients from ${o.clientName}'s members and corporate clients nearby. Can I send you the agreement today, and who signs for the facility?`;
}

export function slaEmail(o: { clientName: string; caller: string; signatory?: string | null; hospital: string }): { subject: string; body: string } {
  const to = o.signatory ? `Dear ${o.signatory},` : "Good day,";
  return {
    subject: `${o.clientName} provider agreement for ${o.hospital}`,
    body: `${to}

Thank you for your time today. As discussed, I have attached ${o.clientName}'s provider agreement for ${o.hospital}, with the documents checklist.

You can sign electronically, return a scanned copy, or I can collect it in person, whichever is quickest for you.

I will call on ${new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: LAGOS_TZ }).format(addWorkingDays(new Date(), 2))} to confirm.

Kind regards,
${o.caller}
For ${o.clientName}`,
  };
}

// ---------------------------------------------------------------- check-ins

type TouchRow = { channel: string; outcome: string; createdAt: Date; userId: string | null; target: { hospital: { name: string } } };

export function checkInText(o: {
  touchesToday: TouchRow[];
  sentToday: number;
  signedToday: string[];
  out: number;
  dueTomorrow: number;
  blocked?: string;
}): string {
  const contacts = o.touchesToday.filter((t) => outcome(t.outcome)?.contact);
  const by = (c: string) => contacts.filter((t) => t.channel === c).length;
  const parts = [["calls", by("CALL")], ["WhatsApp", by("WHATSAPP")], ["emails", by("EMAIL")], ["visits", by("VISIT")]]
    .filter(([, n]) => n)
    .map(([l, n]) => `${l} ${n}`);
  return [
    `- Contacts today: ${contacts.length}${parts.length ? ` (${parts.join(", ")})` : ""}`,
    `- SLAs sent today: ${o.sentToday}`,
    `- Signed today: ${o.signedToday.length}${o.signedToday.length ? ` (${o.signedToday.join(", ")})` : ""}`,
    `- SLAs out, awaiting signature: ${o.out}`,
    `- Follow-ups due tomorrow: ${o.dueTomorrow}`,
    `- Blocked: ${o.blocked?.trim() || "nothing"}`,
  ].join("\n");
}

export function weekOf(targets: { from: string; label: string; target: number }[] | null | undefined, now = new Date()) {
  if (!targets?.length) return null;
  const today = todayInLagos(now);
  const sorted = [...targets].sort((a, b) => a.from.localeCompare(b.from));
  let cur = sorted[0];
  for (const w of sorted) if (w.from <= today) cur = w;
  const i = sorted.indexOf(cur);
  const to = sorted[i + 1]?.from;
  return { ...cur, start: startOfLagosDay(cur.from), end: to ? startOfLagosDay(to) : null };
}

export const fmtDay = (d: Date) => new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: LAGOS_TZ }).format(d);
export const fmtTime = (d: Date) => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: LAGOS_TZ }).format(d);

// ---------------------------------------------------------------- access

export const SPRINT_ADMIN_ROLES = ["PARTNER", "ADMIN"];
export type MemberRole = "LEAD" | "RUNNER" | "CALLER";
/** LEAD and RUNNER can reassign, park and work any target; a CALLER works their own. */
export const canSteer = (r: MemberRole | null) => r === "LEAD" || r === "RUNNER";
