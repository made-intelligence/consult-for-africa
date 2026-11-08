import type { DailyConfig, DailySection, Metric } from "@/lib/dailyReturn";

/**
 * Arabella Women's Health: what Dr Chito sees about her practice every day.
 *
 * Twelve things, agreed from the people and process review. Each is recorded
 * once, at the step where it happens, by the role that does it. Nobody writes
 * a report. Where the live record does not exist yet, the owner enters the
 * numbers at the end of the day in about two minutes, and a missing return
 * shows on her page as a gap.
 *
 * Phasing: 1 to 5 from week one, 6 to 9 in weeks two and three, 10 to 12
 * after. Sections whose phase has not started show as "not started", never
 * as missing. To move a phase, change its date in PHASE_STARTS.
 *
 * Owners are roles. Until each role is mapped to a person, the role is
 * matched against job titles on the staff list.
 *
 * Change anything here freely: labels, metrics, owners, phases. Nothing in the
 * database depends on this shape. A metric taken out stays in old returns and
 * is simply not shown.
 */

export const PRINCIPAL = "Dr Chito";

/** Rename these to the practice's own accounts. Codes must stay stable once used. */
export const BANK_ACCOUNTS: { code: string; label: string }[] = [
  { code: "transfer_a", label: "Transfer, first bank account" },
  { code: "transfer_b", label: "Transfer, second bank account" },
];

const count = (code: string, label: string, hint?: string): Metric => ({ code, label, type: "count", hint });
const naira = (code: string, label: string, hint?: string): Metric => ({ code, label, type: "naira", hint });
const clock = (code: string, label: string, hint?: string): Metric => ({ code, label, type: "clock", hint });
const yesno = (code: string, label: string, hint?: string): Metric => ({ code, label, type: "yesno", hint });
const text = (code: string, label: string, hint?: string): Metric => ({ code, label, type: "text", hint });
const minutes = (code: string, label: string, hint?: string): Metric => ({ code, label, type: "minutes", hint });

export const ARABELLA_SECTIONS: DailySection[] = [
  {
    code: "on_duty",
    number: 1,
    title: "On duty",
    asks: "Who is in the building against who was on the rota.",
    ownerRoles: ["Head of Nursing"],
    phase: 1,
    live: ["ROTA"],
    laterFrom: ["STAFF_SIGN_IN"],
    metrics: [
      text("doctor_on", "Doctor on duty"),
      count("nurses_rostered", "Nurses on the rota"),
      count("nurses_in", "Nurses who came in"),
      text("consultant_on_call", "Consultant on call (labour and theatre)"),
      yesno("lab_scientist_in", "Lab scientist in"),
      text("not_in", "On the rota but not in", "Names, and why if known"),
    ],
    headline: ["nurses_in", "nurses_rostered", "doctor_on"],
  },
  {
    code: "opening",
    number: 2,
    title: "Ready at opening",
    asks: "Whether a doctor and a nurse were in before the first patient.",
    ownerRoles: ["Head of Operations"],
    phase: 1,
    laterFrom: ["STAFF_SIGN_IN", "PATIENT_CHECK_IN"],
    metrics: [
      clock("opened_at", "Doors opened"),
      clock("first_doctor_at", "First doctor in"),
      clock("first_nurse_at", "First nurse in"),
      clock("first_patient_at", "First patient arrived"),
      clock("closed_at", "Closed"),
      yesno("cash_reconciled", "Cash counted and matched at close"),
    ],
    headline: ["first_doctor_at", "first_patient_at", "cash_reconciled"],
  },
  {
    code: "patients",
    number: 3,
    title: "Patients today",
    asks: "How many came, how many were seen, and for what.",
    ownerRoles: ["Front desk", "Front office", "Receptionist"],
    phase: 1,
    laterFrom: ["PATIENT_CHECK_IN"],
    metrics: [
      count("booked", "Booked"),
      count("arrived", "Arrived"),
      count("seen", "Seen"),
      count("no_show", "Booked but did not come"),
      count("new_patients", "New patients"),
      count("returning", "Returning patients"),
      count("svc_consult", "Consultations"),
      count("svc_anc", "Antenatal visits"),
      count("svc_scan", "Scans"),
      count("svc_lab", "Lab only"),
      count("svc_gynae", "Gynae procedures"),
      count("svc_fertility", "Fertility"),
      count("svc_postnatal", "Postnatal"),
      count("enquiries", "Calls and enquiries"),
    ],
    headline: ["seen", "new_patients", "no_show"],
  },
  {
    code: "wait",
    number: 4,
    title: "Wait",
    asks: "How long patients waited from arrival to being seen.",
    ownerRoles: ["Front desk", "Front office", "Receptionist"],
    phase: 1,
    laterFrom: ["PATIENT_CHECK_IN"],
    metrics: [
      minutes("median_wait", "Typical wait (median)", "Minutes from arrival to being seen"),
      minutes("longest_wait", "Longest wait", "Minutes"),
      count("over_60", "Waited over an hour"),
    ],
    headline: ["median_wait", "longest_wait", "over_60"],
  },
  {
    code: "money",
    number: 5,
    title: "Money",
    asks: "What was billed against what was collected, by channel, and any visit with no bill.",
    ownerRoles: ["Cashier", "Head of Operations"],
    phase: 1,
    restricted: "FINANCIAL",
    laterFrom: ["BILLING"],
    metrics: [
      naira("billed", "Billed today"),
      naira("cash", "Collected in cash"),
      naira("pos", "Collected by POS"),
      ...BANK_ACCOUNTS.map((a) => naira(a.code, a.label)),
      naira("hmo_billed", "Billed to HMOs"),
      count("hmo_encounters", "HMO visits"),
      naira("refunds", "Refunds"),
      naira("discounts", "Discounts given"),
      count("unbilled_visits", "Visits with no bill"),
      yesno("day_closed", "Day closed by the Head of Operations"),
    ],
    derived: [
      { code: "collected", label: "Collected", kind: "sum", type: "naira", of: ["cash", "pos", ...BANK_ACCOUNTS.map((a) => a.code)] },
    ],
    headline: ["billed", "collected", "unbilled_visits"],
  },
  {
    code: "hmo",
    number: 6,
    title: "HMO",
    asks: "Authorisation codes asked for, received and still waiting, and claims sent.",
    ownerRoles: ["Front desk", "Front office", "HMO"],
    phase: 2,
    metrics: [
      count("codes_requested", "Codes requested"),
      count("codes_received", "Codes received"),
      count("codes_waiting_2h", "Waiting over two hours for a code"),
      count("claims_submitted_week", "Claims submitted this week"),
    ],
    headline: ["codes_waiting_2h", "codes_requested", "claims_submitted_week"],
  },
  {
    code: "maternity",
    number: 7,
    title: "Maternity and ward",
    asks: "Who is in, who delivered, who was moved out, and antenatal visits kept.",
    ownerRoles: ["Ward nurse", "Head of Nursing", "Midwife"],
    phase: 2,
    metrics: [
      count("admissions", "Admissions"),
      count("in_labour", "In labour now"),
      count("deliveries", "Deliveries"),
      count("transfers_out", "Transferred out"),
      text("transfer_reasons", "Why they were transferred"),
      count("anc_due", "Antenatal visits due today"),
      count("anc_missed_week", "Antenatal visits missed this week"),
    ],
    headline: ["deliveries", "admissions", "transfers_out"],
  },
  {
    code: "lab",
    number: 8,
    title: "Laboratory",
    asks: "Samples in, results out, and anything late or critical.",
    ownerRoles: ["Lab scientist", "Laboratory"],
    phase: 2,
    laterFrom: ["LAB_SYSTEM"],
    metrics: [
      count("samples_in", "Samples in"),
      count("results_out", "Results out"),
      count("past_tat", "Results past their turnaround time"),
      count("sent_out_waiting", "Sent out, waiting to come back"),
      count("critical_phoned", "Critical results phoned to the doctor"),
    ],
    headline: ["samples_in", "results_out", "past_tat"],
  },
  {
    code: "stock",
    number: 9,
    title: "Stock",
    asks: "What was needed and not there, what is low, and what is about to expire.",
    ownerRoles: ["Pharmacy", "Pharmacist", "Head of Nursing"],
    phase: 2,
    laterFrom: ["PHARMACY_SYSTEM"],
    metrics: [
      count("not_there", "Needed but not there"),
      text("not_there_items", "Which items"),
      count("below_reorder", "Below reorder level"),
      count("expiring_30", "Expiring within 30 days"),
    ],
    headline: ["not_there", "below_reorder", "expiring_30"],
  },
  {
    code: "safety",
    number: 10,
    title: "Safety checks",
    asks: "Emergency kit checked on every shift, and anything that went wrong or nearly did.",
    ownerRoles: ["Nurse"],
    phase: 3,
    live: ["SAFETY"],
    metrics: [
      yesno("trolley_checked", "Emergency trolley checked"),
      yesno("haemorrhage_kit_checked", "Haemorrhage kit checked"),
      yesno("resus_checked", "Newborn resuscitation checked"),
      count("incidents", "Incidents or near misses today"),
    ],
    headline: ["trolley_checked", "resus_checked", "incidents"],
  },
  {
    code: "next_step",
    number: 11,
    title: "Next step booked",
    asks: "How many patients left with their follow-up or next antenatal visit booked.",
    ownerRoles: ["Front desk", "Front office", "Receptionist"],
    phase: 3,
    laterFrom: ["PATIENT_CHECK_IN"],
    metrics: [
      count("leaving", "Patients who left today"),
      count("booked_next", "Left with the next visit booked"),
    ],
    derived: [{ code: "booked_share", label: "Next visit booked", kind: "share", of: ["booked_next", "leaving"] }],
    headline: ["booked_share", "leaving"],
  },
  {
    code: "waiting_on_principal",
    number: 12,
    title: `Waiting on ${PRINCIPAL}`,
    asks: "Decisions and approvals waiting on you, and open complaints.",
    ownerRoles: ["Head of Operations"],
    phase: 3,
    live: ["DECISIONS"],
    metrics: [
      count("complaints_new", "New complaints today"),
      count("complaints_open", "Complaints still open"),
    ],
    headline: ["complaints_open", "complaints_new"],
  },
];

export const ARABELLA_DAILY: DailyConfig = {
  phaseStarts: {
    1: "2026-11-09",
    2: "2026-11-16",
    3: null,
  },
  closeHour: 20,
  utcOffsetHours: 1,
  sections: ARABELLA_SECTIONS,
};
