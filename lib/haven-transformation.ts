/**
 * Haven Paediatric Centre: the transformation register and the notification
 * programme that runs alongside it.
 *
 * Two separate jobs that are easy to confuse.
 *
 * The REGISTER is how the transformation is managed: every action, who owns it,
 * when it is due. It is the thing the weekly operating review works through.
 *
 * The PROGRAMME is how nineteen people are taught to expect a message from us
 * and to answer it. That is a behaviour, not a feature, and it is built the way
 * behaviours are built: start with something that takes one tap and costs the
 * respondent nothing, make the response visible, and only ask for more once
 * answering is normal. A staff app dropped on a team that has never answered a
 * work message gets a ten per cent response rate and is then declared a
 * failure. This is how that is avoided.
 *
 * Owners below are PROPOSED from the staff roster and job titles. Not one of
 * them has agreed to anything. They are confirmed with Benedict Ijehon and the
 * person themselves before any of this is sent anywhere.
 */

export type Workstream = "WS2_PEOPLE" | "WS3_OPERATIONS" | "WS4_REVENUE";

export const WORKSTREAMS: Record<Workstream, { title: string; lead: string; thesis: string }> = {
  WS2_PEOPLE: {
    title: "Culture, incentives and standards of work",
    lead: "Consult for Africa, with the Senior Registered Nurse and the Chief Medical Director",
    thesis:
      "The survey says the culture is the asset. The work is to build the systems that let it survive the hospital doubling, not to change it.",
  },
  WS3_OPERATIONS: {
    title: "Process reengineering and operations",
    lead: "Consult for Africa, with Head of Admin and Operations",
    thesis:
      "The forms were designed for a much smaller hospital. Rebuild capture, stock and the patient journey so the system carries weight the team is carrying by hand.",
  },
  WS4_REVENUE: {
    title: "Revenue and growth",
    lead: "Consult for Africa, with Finance and Billing",
    thesis:
      "Work is done and never billed, and what is billed is under-priced. Fix capture first, then the cash cycle, then fill the highest-yield beds.",
  },
};

export type ActionStatus = "NOT_STARTED" | "IN_PROGRESS" | "BLOCKED" | "DONE";

export interface TransformationAction {
  id: string;
  workstream: Workstream;
  action: string;
  /** Proposed owner from the roster. Confirm before use. */
  proposedOwner: string;
  /** Weeks from engagement restart, so the register survives dates slipping. */
  week: number;
  status: ActionStatus;
  /** Why this one matters, in the words we would use with the owner. */
  why: string;
}

export const REGISTER: TransformationAction[] = [
  {
    id: "cap-01",
    workstream: "WS4_REVENUE",
    action: "Price the unpriced tariff lines against a peer schedule, twenty lines a day",
    proposedOwner: "Francis Kadiri, Admin and Billing Officer",
    week: 1,
    status: "NOT_STARTED",
    why: "Four tariff lines in five carry no price, so the work is done and never billed. This is the fastest money in the building and it needs no equipment and no hire.",
  },
  {
    id: "cap-02",
    workstream: "WS4_REVENUE",
    action: "Wire the agreed prices into billing so a recorded procedure reaches the bill without anyone remembering",
    proposedOwner: "Francis Kadiri, Admin and Billing Officer",
    week: 3,
    status: "NOT_STARTED",
    why: "A price in a spreadsheet and not in the billing system is not a price. The repricing is only half done until this is true.",
  },
  {
    id: "cash-01",
    workstream: "WS4_REVENUE",
    action: "Reconcile the two largest payer accounts to the line, then call them",
    proposedOwner: "Moshood Saliu, Head of Finance",
    week: 2,
    status: "NOT_STARTED",
    why: "Close to a period of revenue is sitting in two ledgers. The sentence that moves money is 'I have reconciled to the line', and almost nobody calling an insurer has.",
  },
  {
    id: "cash-02",
    workstream: "WS4_REVENUE",
    action: "Put the monthly receivables discipline in place so the balance cannot rebuild quietly",
    proposedOwner: "Moshood Saliu, Head of Finance",
    week: 5,
    status: "NOT_STARTED",
    why: "Receivables rebuild the moment the discipline lapses. The dullness of doing it monthly is the point.",
  },
  {
    id: "stock-01",
    workstream: "WS3_OPERATIONS",
    action: "Set reorder points and minimum levels on the fast-moving pharmacy items",
    proposedOwner: "Blessing Onuche and Janet Ogah, Pharmacy",
    week: 2,
    status: "NOT_STARTED",
    why: "A stockout in a children's hospital is a clinical event, not an admin one. Most of the volume sits in a small number of items, and those are the ones that get attention.",
  },
  {
    id: "stock-02",
    workstream: "WS3_OPERATIONS",
    action: "Open the consignment conversation with the pharmacy supplier",
    proposedOwner: "Consult for Africa, with Head of Finance",
    week: 4,
    status: "NOT_STARTED",
    why: "Under consignment the supplier owns the stock on the shelf and carries the expiry risk, which releases the cash standing in it.",
  },
  {
    id: "flow-01",
    workstream: "WS3_OPERATIONS",
    action: "Walk the patient journey end to end with a stopwatch on a busy afternoon, unannounced",
    proposedOwner: "Toyin Asagidingbi, Head of Customer Service",
    week: 1,
    status: "NOT_STARTED",
    why: "Every point where a parent has to ask what is happening is a defect. You cannot find them from a desk and you cannot find them on a quiet morning.",
  },
  {
    id: "flow-02",
    workstream: "WS3_OPERATIONS",
    action: "Install the daily huddle: fifteen minutes, standing, same time, three questions",
    proposedOwner: "Benedict Ijehon, Head of Admin and Operations",
    week: 2,
    status: "NOT_STARTED",
    why: "A hospital that decides at nine who is going home has the bed by noon. One that decides at four has the same patient overnight.",
  },
  {
    id: "std-01",
    workstream: "WS2_PEOPLE",
    action: "Write the first six standards of work with the people who do the work",
    proposedOwner: "Chioma Agomuo, Senior Registered Nurse",
    week: 3,
    status: "NOT_STARTED",
    why: "Care should not depend on who is on shift. Start by asking people to show how they do it now; most of the time the standard is a recording rather than a reform.",
  },
  {
    id: "std-02",
    workstream: "WS2_PEOPLE",
    action: "Open the near miss register and handle the first three reports visibly and without blame",
    proposedOwner: "Dr Adegbajo Odedina, Chief Medical Director",
    week: 1,
    status: "NOT_STARTED",
    why: "The first few set whether anyone ever reports again. A single investigation that feels like a hunt costs a year of reports.",
  },
  {
    id: "ppl-01",
    workstream: "WS2_PEOPLE",
    action: "Model the nursing and medical establishment against the beds actually being run",
    proposedOwner: "Consult for Africa, with the Chief Medical Director",
    week: 2,
    status: "NOT_STARTED",
    why: "Six nurses and three medical officers cannot cover two people on duty around the clock once leave and sickness are counted. The growth plan assumes beds that the current establishment cannot staff.",
  },
  {
    id: "ppl-02",
    workstream: "WS2_PEOPLE",
    action: "Rework job descriptions and targets so they reward care and ownership rather than activity",
    proposedOwner: "Benedict Ijehon, Head of Admin and Operations",
    week: 6,
    status: "NOT_STARTED",
    why: "People do what is measured. Never couple a clinician's income to admissions, length of stay or tests ordered; that is a safety risk before it is a commercial one.",
  },
  {
    id: "ppl-03",
    workstream: "WS2_PEOPLE",
    action: "Publish the roster four weeks ahead and keep it published",
    proposedOwner: "Chioma Agomuo, Senior Registered Nurse",
    week: 4,
    status: "NOT_STARTED",
    why: "People have children and lives. A hospital that tells staff their shifts on Friday for Monday loses good people to hospitals that do not, whatever it pays.",
  },
  {
    id: "gov-01",
    workstream: "WS3_OPERATIONS",
    action: "Build the licence register: every registration and practising licence, expiry dated, reminder at ninety days",
    proposedOwner: "Benedict Ijehon, Head of Admin and Operations",
    week: 1,
    status: "NOT_STARTED",
    why: "Nothing here grows revenue and all of it can stop the hospital. It is the most common thing a new operator finds has quietly expired.",
  },
  {
    id: "gov-02",
    workstream: "WS3_OPERATIONS",
    action: "Confirm the pharmacy's superintendent arrangement and record it",
    proposedOwner: "Consult for Africa, with Head of Admin and Operations",
    week: 1,
    status: "NOT_STARTED",
    why: "The staff list shows two pharmacy technicians and no pharmacist. If there is no superintendent arrangement this is a regulatory exposure rather than a staffing gap, and it is cheap to fix before somebody else finds it.",
  },
  {
    id: "gov-03",
    workstream: "WS3_OPERATIONS",
    action: "Move staff off personal email for anything carrying patient information",
    proposedOwner: "Benedict Ijehon, Head of Admin and Operations",
    week: 5,
    status: "NOT_STARTED",
    why: "Eighteen of nineteen staff are on personal gmail or yahoo. Under the Nigeria Data Protection Act that becomes a real problem the moment patient information starts moving around.",
  },
];

/**
 * The notification programme. One message a week, each one answerable in a
 * single tap until answering is a habit. `ask` is what the staff member is
 * actually asked to do; `why` is for us, not for them.
 *
 * The metric is response rate, not sentiment. Publish it back to the team every
 * week, because a team that can see seventeen of nineteen answered will answer
 * again, and that is the whole mechanism.
 */
export interface Nudge {
  week: number;
  subject: string;
  ask: string;
  effort: "ONE_TAP" | "ONE_LINE" | "SHORT_FORM";
  why: string;
}

export const PROGRAMME: Nudge[] = [
  {
    week: 1,
    subject: "One question, and it takes a second",
    ask: "On your last shift, did you have what you needed? Yes, mostly, or no.",
    effort: "ONE_TAP",
    why: "The first message must be answerable without thinking and must not feel like work. Nothing is being measured yet except whether people answer at all.",
  },
  {
    week: 2,
    subject: "Did anything nearly go wrong this week?",
    ask: "Tell us about a near miss, or tap 'nothing this week'. Anonymous unless you put your name.",
    effort: "ONE_TAP",
    why: "Introduces the near miss channel with an easy exit, so answering 'nothing' still counts as answering and the habit holds.",
  },
  {
    week: 3,
    subject: "What wastes your time?",
    ask: "One thing in this hospital that wastes your time. One line is enough.",
    effort: "ONE_LINE",
    why: "First message that asks for words rather than a tap. People answer this one because it is about their own frustration rather than our agenda.",
  },
  {
    week: 4,
    subject: "We wrote down how you do it. Did we get it right?",
    ask: "Read the draft standard for your area and tell us what is wrong with it.",
    effort: "SHORT_FORM",
    why: "Turns the standards work into something done with them. Also the first message where their answer visibly changes a document.",
  },
  {
    week: 5,
    subject: "The shelf: was it ever empty this week?",
    ask: "Did you reach for something that was not there? Which item?",
    effort: "ONE_TAP",
    why: "Gives the stock work a live signal from the ward instead of from the stock sheet, and proves the earlier answers led somewhere.",
  },
  {
    week: 6,
    subject: "Here is what changed because you answered",
    ask: "Nothing to answer. Read what moved.",
    effort: "ONE_TAP",
    why: "The one that makes the whole programme work. A team that never sees a consequence stops replying by week eight. Send this even if little changed, and say so honestly if so.",
  },
  {
    week: 7,
    subject: "Going into the season",
    ask: "What are you most worried about for November to February?",
    effort: "ONE_LINE",
    why: "Surfaces the operational risks that only the people on shift can see, while there is still time to act on them.",
  },
  {
    week: 8,
    subject: "The pulse, from now on",
    ask: "Same question every month: did you have what you needed, and did anything nearly go wrong.",
    effort: "ONE_TAP",
    why: "Where the programme lands: a standing monthly pulse that the staff app inherits rather than introduces.",
  },
];

/** Response rate is the only number that says whether this is working. */
export const TARGET_RESPONSE_RATE = 0.7;
export const HEADCOUNT = 19;
