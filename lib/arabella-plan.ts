/**
 * Arabella's plan, in trickles.
 *
 * The transformation toolkit holds dozens of systems. Handing all of them to a
 * team on day one teaches the team to ignore the app. So the plan reaches staff
 * a few tasks a week: each task goes live on its week's Monday (StaffTask
 * startsOn) and stays live after that. Until then it exists but nobody sees it.
 *
 * Weeks follow the daily view's phases in lib/arabella-daily.ts: week 1 is the
 * phase 1 items (on duty, opening, patients, wait, money), week 3 phase 2
 * (HMO, maternity, lab, stock), weeks 4-5 phase 3 (safety, next step, what is
 * waiting on Dr Chito).
 *
 * Roles match job titles loosely (lib/havenLearn.ts appliesTo): "Nurse"
 * matches every nurse, "Admin" the front desk and PA, "everybody" all staff.
 * To move the plan, change GO_LIVE and re-run scripts/seed-arabella-staff.ts.
 */

export const GO_LIVE = "2026-11-16"; // a Monday

export type Cadence = "EVERY_SHIFT" | "DAILY" | "WEEKLY" | "MONTHLY";

export interface PlanTask {
  code: string;
  week: number;
  title: string;
  roles: string[];
  cadence: Cadence;
  evidence: string;
  why: string;
}

export const ARABELLA_PLAN: PlanTask[] = [
  // Week 1: the day has a shape
  {
    code: "AR-OPEN", week: 1, cadence: "DAILY",
    title: "Opening checklist done by 7:45",
    roles: ["Head of Nursing", "Nurse"],
    evidence: "Opening section of the daily return: time the first doctor and nurse were in, rooms ready, emergency trolley seen.",
    why: "A woman who arrives at 8 should find the practice ready for her, every day, without Dr Chito checking.",
  },
  {
    code: "AR-HUDDLE", week: 1, cadence: "DAILY",
    title: "Run the 7:45 huddle (ten minutes)",
    roles: ["Head of Operations"],
    evidence: "Tick when done. Who is on, who is booked, anything broken, anything waiting on Dr Chito.",
    why: "Ten minutes at the start saves the day's interruptions. Everyone hears the same plan once.",
  },
  {
    code: "AR-ROTA", week: 1, cadence: "WEEKLY",
    title: "Post next week's rota by Friday",
    roles: ["Head of Nursing"],
    evidence: "Next week's rota entered on the rota page.",
    why: "The rota tells the app who is on and who is resting, so nobody off duty is chased.",
  },
  {
    code: "AR-PATIENTS", week: 1, cadence: "DAILY",
    title: "Enter today's patients before close",
    roles: ["Admin"],
    evidence: "Patients section of the daily return: booked, arrived, seen, no-shows, new, by service.",
    why: "This is the number Dr Chito looks at first each morning.",
  },
  {
    code: "AR-CASH-CLOSE", week: 1, cadence: "DAILY",
    title: "Close the day's money",
    roles: ["Head of Operations"],
    evidence: "Money section of the daily return: billed and collected by cash, POS and each account; any visit with no bill.",
    why: "One close a day, across every account, is how the takings stop being a guess.",
  },

  // Week 2: the day closes properly
  {
    code: "AR-CLOSE", week: 2, cadence: "DAILY",
    title: "Closing checklist done",
    roles: ["Facility", "Nurse"],
    evidence: "Opening and closing section: building secured, fridges and generator checked, rooms reset.",
    why: "Tomorrow's opening starts with tonight's close.",
  },
  {
    code: "AR-WAIT", week: 2, cadence: "EVERY_SHIFT",
    title: "Log arrival and seen times",
    roles: ["Admin"],
    evidence: "Wait section: median and longest wait from arrival to seen.",
    why: "How long a woman waits is the first thing she judges us on.",
  },
  {
    code: "AR-DECISIONS", week: 2, cadence: "DAILY",
    title: "Put anything waiting on Dr Chito into Decisions",
    roles: ["Head of Operations"],
    evidence: "Each open question raised in the app's Decisions list, with what is needed and by when.",
    why: "She sees everything waiting on her in one place, and everything else gets decided below her.",
  },

  // Week 3: the services report themselves
  {
    code: "AR-HMO", week: 3, cadence: "DAILY",
    title: "Request HMO codes at registration",
    roles: ["Admin"],
    evidence: "HMO section: codes requested, received, any waiting over 2 hours.",
    why: "An HMO patient kept waiting for a code is our wait, not the HMO's, in her eyes.",
  },
  {
    code: "AR-MATERNITY", week: 3, cadence: "DAILY",
    title: "Update the antenatal register",
    roles: ["Head of Nursing"],
    evidence: "Maternity section: antenatal visits due and seen, admissions, deliveries, transfers out.",
    why: "Every woman who books with us should be followed through to delivery.",
  },
  {
    code: "AR-LAB", week: 3, cadence: "DAILY",
    title: "Log samples, results and critical results phoned",
    roles: ["Laboratory"],
    evidence: "Lab section: samples in, results out, past turnaround, sent out awaiting return, critical results phoned.",
    why: "The laboratory is our largest service. A late result is a patient chasing us.",
  },
  {
    code: "AR-STOCK", week: 3, cadence: "DAILY",
    title: "Record stock-outs and expiries",
    roles: ["Nurse"],
    evidence: "Stock section: anything a patient needed that was not there, below reorder, expiring within 30 days.",
    why: "Nothing a patient needs should run out without someone having seen it coming.",
  },

  // Week 4: safety is checked, not assumed
  {
    code: "AR-SAFETY-CHECKS", week: 4, cadence: "EVERY_SHIFT",
    title: "Check the emergency trolley, haemorrhage kit and newborn resuscitation",
    roles: ["Nurse"],
    evidence: "Safety section: each check done this shift, with anything missing.",
    why: "These are used rarely and must work the first time.",
  },
  {
    code: "AR-INCIDENT-REVIEW", week: 4, cadence: "WEEKLY",
    title: "Review the week's incidents and near misses",
    roles: ["Head of Nursing"],
    evidence: "Every report this week read, with an action or a reason for none.",
    why: "Staff report when they see reports lead somewhere, and never lead to blame.",
  },

  // Week 5: every visit ends with a next step
  {
    code: "AR-NEXT-STEP", week: 5, cadence: "DAILY",
    title: "Book the next visit before she leaves",
    roles: ["General Practitioner", "Admin"],
    evidence: "Next step section: patients leaving with a follow-up or next antenatal visit booked.",
    why: "Care that continues is better care, and it is how the practice grows.",
  },
  {
    code: "AR-WEEKLY-REVIEW", week: 5, cadence: "WEEKLY",
    title: "Weekly numbers with Dr Chito (30 minutes)",
    roles: ["Head of Operations"],
    evidence: "The week's daily view reviewed with her; three actions agreed.",
    why: "A weekly look keeps small slips from becoming habits.",
  },

  // Week 6: the money cycle
  {
    code: "AR-HMO-CLAIMS", week: 6, cadence: "WEEKLY",
    title: "Submit the week's HMO claims",
    roles: ["Head of Operations"],
    evidence: "Claims submitted this week, by HMO, in the HMO section.",
    why: "A claim submitted weekly is paid sooner, and nothing is lost to the time limit.",
  },
  {
    code: "AR-MONTHLY", week: 6, cadence: "MONTHLY",
    title: "Monthly business review pack for Dr Chito",
    roles: ["Head of Operations"],
    evidence: "One page: income by service and payer, costs, the daily view trends, decisions for her.",
    why: "One monthly page is how the business is run on numbers rather than memory.",
  },
];

/** The Monday a week's tasks go live, at 06:00 Lagos (05:00 UTC). */
export function weekStart(week: number, goLive: string = GO_LIVE): Date {
  const d = new Date(`${goLive}T05:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + (week - 1) * 7);
  return d;
}
