/**
 * Arabella's training, as short modules in the staff app.
 *
 * Source: the transformation toolkit (scripts/build-arabella-toolkit.py in the
 * main repo). Section 6 is the curriculum, T01 to T21, with a role-by-module
 * grid; the SOP annex holds the 16 procedures the modules teach. Each body
 * below is that SOP's own content, cut down so it reads on a phone in ten to
 * fifteen minutes, in the practice's own role names (Head of Operations for the
 * toolkit's Practice manager, Head of Nursing for the Nursing and midwifery
 * lead, the Medical Director for the Medical lead).
 *
 * T01 is a full induction day in the toolkit, too much for one phone module,
 * so it is two: AR-T01A in week 1 and AR-T01B in week 2. That makes 22.
 *
 * Nothing here reaches staff until Dr Chito (canApproveClinical) approves it
 * in the app: approvedAt is NULL on seed. Clinical modules (from SOPs 06 to
 * 10, 13 and 14) carry no doses; where a dose or threshold matters the body
 * says "as the signed protocol directs".
 *
 * The trickle: each module has a week of the first 12 weeks at the new site
 * (lib/arabella-plan.ts GO_LIVE, weekStart). It reaches staff on that week's
 * Monday, and only once approved. Core modules are weeks 1 and 2; role modules
 * follow the toolkit's week-by-week plan (section 5), spread so nobody gets
 * more than three in a week.
 *
 * Who: roles are needles for the loose matcher (lib/havenLearn.ts appliesTo)
 * against "position department", taken from scripts/seed-arabella-staff.ts;
 * departments match exactly. Empty roles and departments means everybody.
 * Seeded by scripts/seed-arabella-modules.ts.
 */

import type { SopModule, SopQuestion } from "./haven-sop-modules";

export type { SopQuestion };

export interface ArabellaModule extends SopModule {
  /** Week of the first 12 at the new site. Goes live on that week's Monday. */
  week: number;
  /** From a clinical SOP: the approver checks thresholds and kit lists. */
  clinical: boolean;
}

const M = "QUESTIONS" as const;
const F = "ON_INDUCTION_THEN_ANNUAL" as const;

// Role needles, as positions appear on the staff list.
const HOO = "Head of Operations";
const MD = "Medical Director";
const HON = "Head of Nursing";
const HOC = "Head of Clinicals";
const GP = "General Practitioner";

// Departments, exactly as seeded.
const NURSING = "Nursing";
const FRONT = "Front desk";
const LAB = "Laboratory";
const FACILITY = "Facility";

const src = (s: string) => `Arabella transformation toolkit (Nov 2026): ${s}`;

export const ARABELLA_MODULES: ArabellaModule[] = [
  // -------------------------------------------------------------------------
  // Week 1
  // -------------------------------------------------------------------------
  {
    code: "AR-T01A",
    week: 1,
    clinical: false,
    domain: "Core",
    title: "The day at Arabella",
    summary: "How the practice opens, runs and closes every day, and what is expected of you in it.",
    roles: [],
    departments: [],
    method: M,
    frequency: F,
    source: src("T01 induction; SOP 01 opening and closing; SOP 15 rota and sign-in"),
    body: `WHY THIS MATTERS
A woman who arrives at 8:00 should find the practice ready for her, every day, whoever is on duty. That only happens if everyone does their part of the day the same way.

SIGNING IN
1. Sign in on the staff app when you arrive and sign out when you leave.
2. The shift senior compares sign-in with the rota by 7:30 and calls anyone missing.
3. The shift senior is the most senior nurse or doctor on that shift.

OPENING
1. 7:15: the facility team unlocks, disarms the alarm, and checks power, water and generator fuel. Lights and cooling on in patient areas.
2. 7:30: doors and phones live. The front desk is signed in with today's list open and the POS terminals on.
3. By 7:40: the nurse on shift checks the emergency kits. The laboratory runs its quality control.
4. 7:45: the huddle. Ten minutes, standing, at the board. It starts on time whoever is missing.
5. 8:00: the first patient is seen.

THE OPENING CHECKLIST
The shift senior signs it by 7:45. Anything not done is written down with the reason. It is never left blank.

CLOSING
1. Every patient on today's list is checked out or admitted.
2. The day's money is closed and countersigned.
3. Controlled drugs are counted by two people and the cabinet locked.
4. Paper records are filed and locked, screens logged out. No patient papers are left in consulting rooms.
5. Doors, keys and alarm are handed to night security and the key log signed.

WHO TO CALL
1. A clinical worry: the doctor on shift, then the consultant on call.
2. A staffing gap: the shift senior, then the Head of Nursing.
3. Power, water or security: the facility lead, then the Head of Operations.
4. Money, billing or HMO: the Head of Operations.`,
    questions: [
      {
        question: "When do you sign in on the staff app?",
        options: ["When you arrive", "At the huddle", "Before you leave", "Only on weekdays"],
        correct: 0,
        because: "Everyone signs in on arrival and signs out on leaving. The shift senior checks sign-in against the rota by 7:30.",
      },
      {
        question: "It is 7:45 and two people are not yet in. What happens to the huddle?",
        options: ["It waits for them", "It starts on time", "It is cancelled for the day", "It moves to 8:00"],
        correct: 1,
        because: "The huddle starts at 7:45 whoever is missing. Latecomers join; it does not restart.",
      },
      {
        question: "One item on the opening checklist could not be done. What do you write?",
        options: ["Nothing, leave it blank", "A tick, and fix it later", "The item as an exception, with the reason", "Only tell the doctor"],
        correct: 2,
        because: "Anything not done is written as an exception with the reason. A checklist item is never left blank.",
      },
      {
        question: "What time should the first patient be seen?",
        options: ["7:30", "7:45", "8:00", "9:00"],
        correct: 2,
        because: "Doors open at 7:30, the huddle is at 7:45 and the first patient is seen at 8:00.",
      },
      {
        question: "At close, where do patient papers go?",
        options: ["Left on the consulting room desk for tomorrow", "Filed and locked away", "Given to security", "Taken home by the doctor"],
        correct: 1,
        because: "Paper records are filed and locked and screens logged out. No patient papers are left in consulting rooms.",
      },
      {
        question: "The generator has no fuel at opening. Who do you tell first?",
        options: ["The doctor on shift", "The facility lead", "The front desk", "The Medical Director"],
        correct: 1,
        because: "Power, water and security go to the facility lead first, then the Head of Operations.",
      },
    ],
  },
  {
    code: "AR-T02",
    week: 1,
    clinical: false,
    domain: "Daily running",
    title: "The 7:45 huddle and the daily view",
    summary: "Ten minutes at the board every morning, and the one page of facts the practice is run from.",
    roles: [HOO, MD, GP],
    departments: [NURSING, FRONT],
    method: M,
    frequency: F,
    source: src("T02; Module 1 huddle script and daily view"),
    body: `WHY THIS MATTERS
Ten minutes at the start saves the day's interruptions. Everyone hears the same plan once, and problems are written down with one owner instead of being carried round in heads.

THE HUDDLE: SAME TIME, SAME PLACE, SAME AGENDA
1. Minute 0 to 1, yesterday: patients, money, waits, anything red on the daily view. Led by the Head of Operations.
2. Minute 1 to 3, today's list and risks: who is booked, women due or in labour, procedures, higher risk patients. Led by the doctor on shift.
3. Minute 3 to 5, cover: who is on, who is missing, the consultant on call for labour and theatre. Led by the Head of Nursing.
4. Minute 5 to 6, stock and equipment: anything short, broken or expiring.
5. Minute 6 to 8, safety: "What could go wrong today?" Incidents and near misses since yesterday, without names.
6. Minute 8 to 9, actions: each issue logged with one owner and a date.
7. Minute 9 to 10, recognition: one person thanked by name for something specific.

HUDDLE RULES
1. It starts at 7:45 whoever is missing.
2. Problems are logged in the huddle and solved after it by the owner.
3. Raising a problem is always welcome.
4. Praise is given in the huddle. Correction is given in private.
5. The Head of Operations runs it, even when Dr Chito attends.

THE DAILY VIEW
One page of facts, recorded once by the person doing the step. Nobody writes a separate report.
1. Who is on duty, against the rota.
2. Ready at opening: first doctor and nurse signed in by 7:45, first patient seen by 8:00.
3. Patients today: booked, arrived, seen, no-shows.
4. Wait: arrival to seen. The target is under 30 minutes, and nobody over 45 minutes without a word from a supervisor.
5. Money: billed against collected, and any visit with no bill.
Later items add HMO codes, maternity, laboratory, stock, safety checks, next step booked and what is waiting on Dr Chito.

A BLANK IS A RED
If an item is blank, the step did not produce its record. Treat a blank as off target until it is filled.`,
    questions: [
      {
        question: "A problem is raised at the huddle. What happens to it there?",
        options: ["It is solved on the spot", "It is logged with one owner and a date", "It waits for Dr Chito", "It is noted only if serious"],
        correct: 1,
        because: "Problems are logged in the huddle with one owner and a date, then solved after it by the owner.",
      },
      {
        question: "Where is correction given?",
        options: ["At the huddle, so everyone learns", "On the staff group chat", "In private", "In the daily report"],
        correct: 2,
        because: "Praise is given in the huddle. Correction is given in private.",
      },
      {
        question: "Dr Chito attends the huddle. Who runs it?",
        options: ["Dr Chito", "The Head of Operations", "The doctor on shift", "Whoever arrives first"],
        correct: 1,
        because: "The Head of Operations still runs the huddle when Dr Chito attends.",
      },
      {
        question: "An item on the daily view is blank. How is it read?",
        options: ["As on target", "As not applicable", "As red, off target", "As amber"],
        correct: 2,
        because: "A blank is a red: the step did not produce its record.",
      },
      {
        question: "What is the target wait from arrival to being seen?",
        options: ["Under 15 minutes", "Under 30 minutes", "Under 60 minutes", "There is no target"],
        correct: 1,
        because: "The target is under 30 minutes, and nobody waits over 45 minutes without a word from a supervisor.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Week 2
  // -------------------------------------------------------------------------
  {
    code: "AR-T01B",
    week: 2,
    clinical: false,
    domain: "Core",
    title: "Privacy, speaking up and clean hands",
    summary: "Three things everyone at Arabella does: keep patients' details private, report what goes wrong, and keep hands and spaces clean.",
    roles: [],
    departments: [],
    method: M,
    frequency: F,
    source: src("T01 induction; SOP 02 privacy (NDPA 2023); SOP 11 incidents; SOP 14 infection basics"),
    body: `PRIVACY
A woman's health is her own business. Under the Nigeria Data Protection Act 2023 health details are sensitive personal data, and the practice must protect them.
1. Clinical questions are asked and answered only at the private desk or in a consulting room.
2. No clinical detail is said within hearing of the waiting area.
3. Call a patient by name only. Never call out why she is here.
4. If you are not clinical staff, do not ask what a patient came for beyond the service booked.
5. Screens and papers never face the waiting area. Log out when you step away.
6. Never post, forward or photograph anything about a patient. That includes the staff group chat and social media.

SPEAKING UP: INCIDENTS AND NEAR MISSES
An incident is anything that harmed, or could have harmed, a patient, a visitor or a colleague. A near miss is one that was caught in time. Both are reported.
1. Make the person safe first. Get help.
2. Tell the shift senior.
3. Report it on the staff app before the end of your shift: what happened, where, when, and what was done. Use the record number, not the patient's name. You can report without giving your name.
4. The owner tells the team what changed within 14 days.

THE RULE
Reporting is never punished. Hiding a mistake is. The question after an incident is "what in our system allowed this?", not "who do we blame?".

CLEAN HANDS AND SAFE SPACES
1. Clean your hands before and after touching a patient or her surroundings. Use alcohol rub, or soap and water when hands are visibly dirty.
2. Sharps go into a sharps box straight away. Never re-cap a needle.
3. A needle-stick or splash: wash it, report it, and see the doctor on shift within the hour.
4. Spills are cleaned at once.
5. Waste goes in the bin by the colour code posted on each bin.`,
    questions: [
      {
        question: "A patient at the main desk starts describing her symptoms. What do you do?",
        options: [
          "Listen and note it down quickly",
          "Ask her to lower her voice",
          "Take her to the private desk or a consulting room",
          "Tell her to wait for the doctor and say nothing",
        ],
        correct: 2,
        because: "Clinical questions are asked and answered only at the private desk or in a consulting room, never in hearing of the waiting area.",
      },
      {
        question: "Can you share a patient's photo or details on the staff group chat?",
        options: ["Yes, if it is only staff", "Yes, if her name is removed", "No, never", "Only with the doctor's permission"],
        correct: 2,
        because: "Never post, forward or photograph anything about a patient, including on the staff group chat.",
      },
      {
        question: "You nearly gave a patient the wrong form but caught it. Should you report it?",
        options: ["No, nothing happened", "Yes, it is a near miss", "Only if the patient noticed", "Only if it happens twice"],
        correct: 1,
        because: "A near miss is an incident caught in time. Both incidents and near misses are reported.",
      },
      {
        question: "When must an incident be reported on the staff app?",
        options: ["Within a week", "Before the end of your shift", "At the next huddle", "Only if someone was hurt"],
        correct: 1,
        because: "Report it on the staff app before the end of the shift, after making the person safe and telling the shift senior.",
      },
      {
        question: "What happens to a person who reports their own mistake?",
        options: ["They are disciplined", "Nothing is held against them for reporting", "They lose their bonus", "They must retrain first"],
        correct: 1,
        because: "Reporting is never punished. Hiding a mistake is.",
      },
      {
        question: "You get a needle-stick injury. What do you do?",
        options: [
          "Wash it, report it and see the doctor on shift within the hour",
          "Cover it and carry on",
          "Wait until the end of the shift",
          "Only report it if it bleeds",
        ],
        correct: 0,
        because: "A needle-stick or splash: wash it, report it, and be seen by the doctor on shift within the hour.",
      },
    ],
  },
  {
    code: "AR-T04",
    week: 2,
    clinical: false,
    domain: "Front desk",
    title: "Registration, check-in and privacy at the desk",
    summary: "Registering every patient once and correctly, logging her arrival, and keeping her details private.",
    roles: [],
    departments: [FRONT],
    method: M,
    frequency: F,
    source: src("T04; SOP 02 patient registration and check-in"),
    body: `WHY THIS MATTERS
Every patient is identified once and correctly, with her contact details and payer, in privacy. Her arrival time is recorded so the wait can be measured.

ARRIVAL
1. Greet her within 1 minute.
2. If a pregnant woman has bleeding, a severe headache, reduced baby movements, is in labour, or looks unwell: call the nurse at once. Register her afterwards.
3. Record the arrival time in the check-in log at the moment she arrives.

RETURNING PATIENT (UNDER 3 MINUTES)
1. Find her record by record number or phone.
2. Confirm name, date of birth and phone. Update anything that has changed.

NEW PATIENT (UNDER 10 MINUTES)
1. Search by phone and date of birth first, so you do not make a duplicate.
2. Create one record: full name, date of birth, phone, email, address, next of kin, payer.
3. Check the phone number works by calling or texting it while she is at the desk.
4. If she knew the practice as Tabitha, tell her in one sentence that Tabitha is now Arabella and her record has carried over.
5. Give her the privacy notice. Record her consent to be contacted by phone, SMS or email.

PAYER AND PRICE
1. Record the payer: cash, HMO or corporate. HMO patients go through the HMO checks before seeing the clinician.
2. State the price of the consultation, and any deposit, before the service. For HMO patients, say what the plan covers and any top-up.

PRIVACY AND FLOW
1. Clinical questions only at the private desk.
2. Send her to triage: vitals within 15 minutes of arrival.
3. Tell her the expected wait. At 45 minutes the shift senior speaks to her and records it.
4. Emergency: she goes straight to the clinician. Finish registration afterwards, with her family if needed.

IF SOMETHING GOES WRONG
1. Duplicate record found: tell the Head of Operations to merge it the same day.
2. An aggressive or distressed visitor: the facility lead and the shift senior, at once.
3. A privacy concern raised: log it as a complaint the same day.`,
    questions: [
      {
        question: "A new patient arrives. What do you do before creating her record?",
        options: ["Take payment", "Search by phone and date of birth", "Call the doctor", "Ask what she came for"],
        correct: 1,
        because: "Search by phone and date of birth first, so you do not create a duplicate record.",
      },
      {
        question: "A pregnant woman at the desk says she is bleeding. What do you do?",
        options: [
          "Register her quickly, then call the nurse",
          "Call the nurse at once and register her afterwards",
          "Ask her to take a seat",
          "Check her HMO first",
        ],
        correct: 1,
        because: "Bleeding, severe headache, reduced baby movements, labour or looking unwell: call the nurse at once and register afterwards.",
      },
      {
        question: "When is the arrival time recorded?",
        options: ["When she is called in", "At the moment she arrives", "At checkout", "At the end of the day"],
        correct: 1,
        because: "The arrival time goes in the check-in log at the moment she arrives, so the wait can be measured.",
      },
      {
        question: "How do you check a new patient's phone number?",
        options: ["Ask her to repeat it", "Call or text it while she is at the desk", "Copy it from her HMO card", "There is no need to check"],
        correct: 1,
        because: "The phone is verified by a call or text while she is still at the desk.",
      },
      {
        question: "When is the price of the consultation stated?",
        options: ["After the consultation", "Before the service", "Only if she asks", "At checkout"],
        correct: 1,
        because: "The price, and any deposit, is stated before the service. For HMO patients, what the plan covers and any top-up.",
      },
      {
        question: "A patient has waited 45 minutes. What happens?",
        options: ["Nothing, the doctor is busy", "The shift senior speaks to her and records it", "She is moved to the next day", "She is offered a refund"],
        correct: 1,
        because: "At 45 minutes the shift senior speaks to her and records it.",
      },
    ],
  },
  {
    code: "AR-T05",
    week: 2,
    clinical: false,
    domain: "Front desk",
    title: "HMO checks and authorisation codes",
    summary: "Checking every HMO patient is covered, and getting the code for each service before it is given.",
    roles: [],
    departments: [FRONT],
    method: M,
    frequency: F,
    source: src("T05; SOP 03 HMO verification and authorisation codes (NHIA Operational Guidelines 2023)"),
    body: `WHY THIS MATTERS
A visit without a code cannot be claimed, so it is never paid. Every HMO patient is checked as covered, and every service has its code before she sees the clinician. No emergency ever waits for a code.

THE DAY BEFORE
For each booked HMO patient, check she is covered on the HMO portal or by phone, and request codes for the booked services.

ON ARRIVAL
1. Check the enrollee ID and her photo ID against the HMO card.
2. Confirm her plan and its benefit limits.
3. Request the code for the consultation and any service already ordered. Name the service as it appears on the tariff.
4. Record the HMO, enrollee ID, plan, code, service, time requested and time received.

WHEN A CODE IS SLOW
1. No code in 30 minutes: call the HMO.
2. No code at 2 hours: it shows on the daily view and the Head of Operations escalates to the HMO's provider desk.
3. Tell her the wait and her options: wait, pay cash and be refunded when the code arrives, or rebook. Record her choice.

OUTSIDE THE PLAN
A service outside her plan, or above its limit: explain before the service, give the cash price of the top-up, and record her agreement on the bill.

EMERGENCIES AND LABOUR
Treat first. Tell the HMO within the time the contract sets and request the code after.

AFTER THE CONSULTATION
1. Any extra service ordered gets its code before it is done.
2. Check every service given has a code.
3. Hand the day's HMO encounters, one line per patient with codes, to billing for the daily close and the weekly claim.`,
    questions: [
      {
        question: "When are codes requested for a booked HMO patient?",
        options: ["The day before", "After she sees the doctor", "At the end of the week", "Only if she asks"],
        correct: 0,
        because: "For booked HMO patients, cover is checked and codes requested the day before.",
      },
      {
        question: "You have waited 30 minutes for a code. What next?",
        options: ["Send her in anyway", "Call the HMO", "Send her home", "Wait until 2 hours"],
        correct: 1,
        because: "No code in 30 minutes: call the HMO. At 2 hours it is escalated to the HMO's provider desk.",
      },
      {
        question: "A woman in labour arrives with an HMO card. What comes first?",
        options: ["Getting the code", "Checking her benefit limit", "Treating her", "Taking a deposit"],
        correct: 2,
        because: "Emergency or labour: treat first. Tell the HMO in the time the contract sets and request the code after.",
      },
      {
        question: "A service is above her plan's limit. When do you tell her?",
        options: ["After the service", "Before the service, with the cash price of the top-up", "When the claim is declined", "Only if she asks"],
        correct: 1,
        because: "Outside the plan or above its limit: explain before the service, give the top-up price and record her agreement on the bill.",
      },
      {
        question: "The code is delayed. What options does she get?",
        options: [
          "Wait, or go home",
          "Wait, pay cash and be refunded when the code arrives, or rebook",
          "Pay cash with no refund",
          "None, she must wait",
        ],
        correct: 1,
        because: "She is told the wait and her options: wait, pay cash and be refunded when the code arrives, or rebook. Her choice is recorded.",
      },
    ],
  },
  {
    code: "AR-T18",
    week: 2,
    clinical: false,
    domain: "Daily running",
    title: "The rota, signing in and SBAR handover",
    summary: "How the rota works, how swaps and leave are agreed, and how nothing about a patient is lost between shifts.",
    roles: [GP],
    departments: [NURSING, LAB],
    method: M,
    frequency: F,
    source: src("T18; SOP 15 rota and handover"),
    body: `WHY THIS MATTERS
Every post is filled by a licensed, signed-in person, and nothing about a patient is lost between shifts.

THE ROTA
1. The rota is posted on the staff app 2 weeks ahead, with every post filled, a shift senior named and the consultant on call for labour and theatre.
2. Your availability is collected before the rota is drafted, so second jobs are planned for, not discovered.
3. Nobody is rostered for back-to-back 24-hour shifts.
4. Swaps are requested on the app and approved by your lead. No swap without approval.
5. Leave is requested 2 weeks ahead.
6. Sign in when you arrive and sign out when you leave. The app compares sign-in with the rota.
7. Tasks and messages go only to people on duty. Off duty, you are contacted only for an emergency call-in.

HANDOVER
1. Handover happens at the 7:45 huddle, and at the bedside for inpatients and women in labour.
2. Use SBAR for each patient, written on the handover sheet:
S, situation: what is happening now.
B, background: the history that matters.
A, assessment: what you think is going on.
R, recommendation: what needs to happen next.
3. Cover: inpatients, women in labour, pending results, patients expected back, equipment faults, stock short, incidents.
4. The incoming person signs to accept. The outgoing person does not leave until handover is complete.
5. Doctor to doctor handover for any patient who needs review. Tell the consultant on call of any change.

IF A POST IS EMPTY
1. Unfilled 24 hours ahead: the lead arranges cover.
2. Unfilled at shift start: the shift senior calls the lead at once.
3. Consultant on call unreachable: the next on the roster, then the Medical Director, within 15 minutes.`,
    questions: [
      {
        question: "How far ahead is the rota posted?",
        options: ["1 week", "2 weeks", "1 month", "The day before"],
        correct: 1,
        because: "The rota is posted on the staff app 2 weeks ahead, every post filled and a shift senior named.",
      },
      {
        question: "You want to swap a shift with a colleague. What do you do?",
        options: [
          "Agree it between you and turn up",
          "Request it on the app and wait for your lead to approve it",
          "Tell the front desk",
          "Post it on the group chat",
        ],
        correct: 1,
        because: "Swaps are requested on the app and approved by the lead. No swap without approval.",
      },
      {
        question: "What does the R in SBAR stand for?",
        options: ["Result", "Recommendation", "Record", "Risk"],
        correct: 1,
        because: "SBAR is situation, background, assessment, recommendation.",
      },
      {
        question: "When can the outgoing person leave?",
        options: ["At the end of the shift time", "Once the incoming person has signed to accept the handover", "Once the huddle starts", "When the doctor arrives"],
        correct: 1,
        because: "The incoming person signs to accept. The outgoing person does not leave until handover is complete.",
      },
      {
        question: "You are off duty. When should the practice contact you?",
        options: ["For any task", "Only for an emergency call-in", "For the daily return", "Never"],
        correct: 1,
        because: "Tasks and messages go only to people on duty. Off-duty staff are contacted only for an emergency call-in.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Week 3
  // -------------------------------------------------------------------------
  {
    code: "AR-T06",
    week: 3,
    clinical: false,
    domain: "Money",
    title: "Bills, receipts and the daily close",
    summary: "A bill for every visit, a receipt for every naira, and the day's money matched before close.",
    roles: [HOO],
    departments: [FRONT],
    method: M,
    frequency: F,
    source: src("T06; SOP 04 cashier and daily cash close"),
    body: `WHY THIS MATTERS
Every visit carries a bill, every naira received is receipted, and every receipt is matched to a bill and to a bank by close of day.

DURING THE DAY
1. Raise a bill for every patient seen, at the price on the current list. HMO patients are billed at N0 cash with the HMO named.
2. Issue a numbered receipt for every payment, whatever the channel. Record the channel and the account.
3. Transfers: confirm the money has arrived before releasing the receipt, or mark it "pending confirmation".
4. Package payments: label which package, which patient, which instalment.
5. Deposits for a delivery or admission: take against the estimated bill and record the balance due.
6. Discounts and refunds: only within the limits Dr Chito has set, with the reason and the approver recorded.

AT CLOSE
1. Compare today's list with the bills. Every patient seen has a bill. Any visit without one is billed before close or listed as an exception.
2. Count cash with a second person. Match it to cash receipts. Seal it in the safe with both signatures. Bank it the next working day.
3. Print each POS terminal's settlement and match it to the POS receipts.
4. Check each bank account's credits for the day and match each to a bill. List any credit you cannot match.
5. Enter billed against collected, by channel, and any exceptions in the daily return.
6. The Head of Operations countersigns the close.

IF IT DOES NOT BALANCE
Cash short or over: tell the Head of Operations the same day. Recount and record it. Never adjust the figures to make it balance.`,
    questions: [
      {
        question: "How is an HMO patient billed?",
        options: ["Not billed at all", "At N0 cash with the HMO named", "At the full cash price", "At half price"],
        correct: 1,
        because: "Every patient seen has a bill. HMO patients are billed at N0 cash with the HMO named.",
      },
      {
        question: "A patient says she has paid by transfer. When do you release the receipt?",
        options: [
          "Straight away",
          "Once the money has arrived, or mark it pending confirmation",
          "Next working day",
          "Only if she shows a screenshot",
        ],
        correct: 1,
        because: "Confirm the credit has arrived before releasing the receipt, or mark it \"pending confirmation\".",
      },
      {
        question: "Who counts the cash at close?",
        options: ["The cashier alone", "Two people", "Security", "The doctor on shift"],
        correct: 1,
        because: "Cash is counted with a second person, matched to receipts and sealed in the safe with both signatures.",
      },
      {
        question: "The cash is N2,000 short. What do you do?",
        options: [
          "Add N2,000 from the float",
          "Change the figure so it balances",
          "Recount, record it and tell the Head of Operations the same day",
          "Leave it for tomorrow",
        ],
        correct: 2,
        because: "Cash short or over is recounted and recorded, and the Head of Operations told the same day. Never adjusted.",
      },
      {
        question: "At close you find a patient who was seen but has no bill. What happens?",
        options: [
          "Ignore it, she has left",
          "Bill it before close or list it as an exception",
          "Wait for her next visit",
          "Ask the doctor to pay",
        ],
        correct: 1,
        because: "Every patient seen has a bill. A visit without one is billed before close or listed as an exception.",
      },
    ],
  },
  {
    code: "AR-T07",
    week: 3,
    clinical: false,
    domain: "Patient journey",
    title: "From consultation to checkout, with the next step booked",
    summary: "Every woman leaves knowing what happens next, with it booked, billed and recorded.",
    roles: [GP],
    departments: [NURSING, FRONT],
    method: M,
    frequency: F,
    source: src("T07; SOP 05 consultation to checkout"),
    body: `WHY THIS MATTERS
Every patient leaves knowing what happens next, with it booked, billed and recorded. A woman who leaves without a next step often does not come back when she needs to.

IN THE CONSULTING ROOM
1. Call the patient by name from the waiting area, without saying why she is here. Record the "seen" time on the staff app.
2. A chaperone is present for any intimate examination.
3. Complete the note during or straight after the consultation: history, findings, plan, chaperone named.
4. Enter orders for tests, scans, medicines and procedures. Flag them for HMO patients so codes are requested before the service.
5. Record the next step: a follow-up date, the next antenatal contact, a results review, a referral, or "no follow-up needed".
6. Explain the plan in plain language. Ask her to repeat back the key points: medicines, warning signs, when to return.
7. Results pending: tell her how she will hear and by when. Add her to the results-to-review list.

AT CHECKOUT
1. Book the next step before she leaves. For antenatal care, the next contact on the eight-contact schedule.
2. Bill every service given and tell her the price of the next step.
3. Record the checkout time. Set a reminder for the day before her next appointment. Send the feedback SMS the same day.

REFERRAL OUT
The referral letter is signed and copied, and the receiving clinician named. Call her within 7 days to confirm she was seen.

IF SOMETHING GOES WRONG
1. She declines to book: record the reason. An antenatal patient is called by a nurse within 2 days.
2. She leaves before checkout: the front desk calls her the same day.`,
    questions: [
      {
        question: "How do you call a patient in from the waiting area?",
        options: ["By name and the reason for her visit", "By name only", "By record number only", "By her HMO"],
        correct: 1,
        because: "Call her by name without saying the reason for the visit.",
      },
      {
        question: "When is the next step booked?",
        options: ["Before she leaves", "When she calls back", "At her next visit", "Only for antenatal patients"],
        correct: 0,
        because: "The next step is booked at checkout before she leaves. For antenatal care, the next contact on the schedule.",
      },
      {
        question: "How do you check she has understood the plan?",
        options: ["Ask if she has questions", "Ask her to repeat back the key points", "Give her a leaflet", "Ask her partner"],
        correct: 1,
        because: "Explain in plain language and ask her to repeat back the key points: medicines, warning signs, when to return.",
      },
      {
        question: "A patient leaves before checkout. What happens?",
        options: ["Nothing", "The front desk calls her the same day", "She is billed double next time", "She is removed from the list"],
        correct: 1,
        because: "A patient who leaves before checkout is called by the front desk the same day.",
      },
      {
        question: "After a referral out, when do we call to confirm she was seen?",
        options: ["Within 24 hours", "Within 7 days", "Within a month", "We do not"],
        correct: 1,
        because: "A call within 7 days confirms she was seen by the receiving clinician.",
      },
    ],
  },
  {
    code: "AR-T11",
    week: 3,
    clinical: true,
    domain: "Clinical safety",
    title: "Emergency kits: haemorrhage, eclampsia and newborn resuscitation",
    summary: "The checks every shift that make sure the kit for the emergencies that cannot wait is complete, working and in date.",
    roles: [GP],
    departments: [NURSING],
    method: M,
    frequency: F,
    source: src("T11; SOP 08 readiness checks (WHO Safe Childbirth Checklist, Helping Babies Breathe, BEmONC)"),
    body: `WHY THIS MATTERS
A haemorrhage, a fit or a baby who does not breathe will not wait while someone looks for a mask. The kit is checked at the start of every shift and after every use. Kit lists are set and signed by the Medical Director.

HAEMORRHAGE KIT (SEALED, IN THE LABOUR ROOM)
1. Check the seal is intact and record its number.
2. If the seal is broken, open the kit and check every item against the signed kit list.
3. The earliest expiry date is written on the seal tag.
4. Check the fridge holding oxytocin: temperature logged and in range.
5. How to get blood, and the phone number, are on the protocol card.

ECLAMPSIA BOX
Magnesium sulphate and everything the signed protocol needs to give and monitor it: present, in date, sealed.

NEWBORN RESUSCITATION AREA
1. Warm surface or resuscitaire on and warm. Two dry cloths and a hat. A clock with a second hand.
2. Bag and mask tested: squeeze, seal, valve. Newborn masks in both sizes, present and clean.
3. Suction clean and working. Cord ties or clamps and a sterile blade.
4. Oxygen, if held: cylinder full or concentrator working.

EMERGENCY TROLLEY
Seal intact. Defibrillator charged and self-test passed. Oxygen full. Airway equipment. Emergency drugs as on the list signed by the Medical Director.

AFTER THE CHECKS
1. Sign each check on the staff app with the seal numbers.
2. A missing or failed item is replaced before the first delivery of the shift, and within 1 hour at most. Tell the Head of Nursing at once.
3. After every use: restock, re-seal and check within 1 hour. Record the new seal number.

BEING READY YOURSELF
Every nurse and doctor on the rota completes newborn resuscitation training and the haemorrhage and eclampsia drill before working alone on a labour shift. Drills are held each quarter, unannounced and timed, with a 10-minute debrief.`,
    questions: [
      {
        question: "When are the emergency kits checked?",
        options: ["Once a week", "At the start of every shift and after every use", "When a woman is in labour", "Once a month"],
        correct: 1,
        because: "The nurse on shift checks at the start of every shift and after every use.",
      },
      {
        question: "The haemorrhage kit seal is broken. What do you do?",
        options: [
          "Re-seal it and sign",
          "Open it and check every item against the signed kit list",
          "Leave it for the pharmacist",
          "Note it and check next shift",
        ],
        correct: 1,
        because: "If the seal is broken, open the kit and check every item against the signed kit list.",
      },
      {
        question: "How do you test the bag and mask?",
        options: ["Look at it", "Squeeze, seal and valve", "Check the expiry date only", "Ask the doctor"],
        correct: 1,
        because: "The bag and mask are tested by squeeze, seal and valve, with newborn masks in both sizes present and clean.",
      },
      {
        question: "An item is missing from the kit. By when must it be replaced?",
        options: [
          "By the end of the week",
          "Before the first delivery of the shift, and within 1 hour at most",
          "At the next order",
          "Before the next drill",
        ],
        correct: 1,
        because: "A missing or failed item is replaced before the first delivery of the shift, and within 1 hour at most.",
      },
      {
        question: "Who sets the kit lists?",
        options: ["The nurse on shift", "The Medical Director", "The Head of Operations", "The supplier"],
        correct: 1,
        because: "Kit lists, including the emergency drugs, are set and signed by the Medical Director.",
      },
      {
        question: "Before working alone on a labour shift, what must you have done?",
        options: [
          "Nothing extra",
          "Newborn resuscitation training and the haemorrhage and eclampsia drill",
          "A month of day shifts",
          "A written exam",
        ],
        correct: 1,
        because: "Every nurse and doctor completes newborn resuscitation training and the drill before working alone on a labour shift.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Week 4
  // -------------------------------------------------------------------------
  {
    code: "AR-T08",
    week: 4,
    clinical: false,
    domain: "Front desk",
    title: "Front desk service and payment conversations",
    summary: "What to say when greeting, when there is a wait, when talking about price, and when something has gone wrong.",
    roles: [],
    departments: [FRONT],
    method: M,
    frequency: F,
    source: src("T08; Module 3 front desk standards and scripts"),
    body: `WHY THIS MATTERS
The front desk is the first and last thing a woman sees. Staff already rate the desk's calls and payment explanations well. These are the standards that keep it that way at the new site.

THE STANDARDS
1. Doors and phones live at 7:30.
2. Calls answered within 4 rings. Missed calls returned within 1 hour. Messages answered the same day.
3. Greet every arrival within 1 minute, by name if you know her.
4. Price, and any HMO limit, explained before the service, not after.
5. Tell her the expected wait. Anyone waiting over 45 minutes gets a word from the shift senior.

GREETING
"Good morning, welcome to Arabella. Who are you here to see today?" Then her name and date of birth to find the record.

THE WAIT
Say it before she sits down: "The doctor is running about 20 minutes behind. I will let you know if that changes." If it changes, go and tell her. Do not wait for her to ask.

PRICE AND HMO LIMITS
1. Say the price plainly, before the service: "Today's consultation is N(price). Would you like to pay by card, cash or transfer?"
2. For HMO patients: "Your plan covers the consultation. The scan is above your plan's limit, so there is a top-up of N(amount). Would you like to go ahead?"
3. Record her agreement on the bill.

WHEN SOMETHING HAS GONE WRONG
1. Listen without interrupting.
2. Apologise for her experience. Do not argue or blame a colleague.
3. Fix it now if you can. If you cannot, say who will and by when.
4. Log it as a complaint the same day.

THE NAME CHANGE
"Tabitha is now Arabella. Same team, and your records have come with you."`,
    questions: [
      {
        question: "Within how many rings should the phone be answered?",
        options: ["2", "4", "6", "Whenever possible"],
        correct: 1,
        because: "Calls are answered within 4 rings, and missed calls returned within 1 hour.",
      },
      {
        question: "The doctor is running late. When do you tell the patient?",
        options: ["Only if she asks", "Before she sits down, and again if it changes", "When she is called in", "After 45 minutes"],
        correct: 1,
        because: "Say the expected wait before she sits down, and go and tell her if it changes.",
      },
      {
        question: "A patient is upset about a delay. What do you do first?",
        options: ["Explain it was the doctor's fault", "Listen without interrupting", "Offer a discount", "Call security"],
        correct: 1,
        because: "Listen without interrupting, apologise for her experience, and fix it or say who will and by when.",
      },
      {
        question: "A scan is above her HMO plan's limit. What do you do?",
        options: [
          "Do the scan and bill her after",
          "Tell her the top-up before the scan and record her agreement on the bill",
          "Refuse the scan",
          "Send the bill to the HMO anyway",
        ],
        correct: 1,
        because: "Price and any HMO limit are explained before the service, and her agreement recorded on the bill.",
      },
      {
        question: "A missed call came in during a busy hour. By when is it returned?",
        options: ["Within 1 hour", "By end of day", "The next morning", "Only if they call again"],
        correct: 0,
        because: "Missed calls are returned within 1 hour.",
      },
    ],
  },
  {
    code: "AR-T09",
    week: 4,
    clinical: true,
    domain: "Clinical: maternity",
    title: "The antenatal pathway and defaulter calls",
    summary: "The eight antenatal contacts, what happens at each, the red flags that cannot wait, and calling every woman who misses one.",
    roles: [GP],
    departments: [NURSING],
    method: M,
    frequency: F,
    source: src("T09; SOP 06 ANC booking and the eight-contact schedule (WHO ANC 2016)"),
    body: `WHY THIS MATTERS
Every pregnant woman booked at Arabella completes the eight contacts the World Health Organization recommends. Red flags are acted on the same day. Her place of delivery is recorded by 36 weeks.

THE EIGHT CONTACTS
The first by 12 weeks, then at 20, 26, 30, 34, 36, 38 and 40 weeks. Routine contacts are nurse-led. A doctor sees her at booking, at 30 and 36 weeks, and for any red flag.

BOOKING (UP TO 12 WEEKS)
1. Book the first contact as early as possible. A woman first seen later is booked at once and joins at the next contact due.
2. The doctor takes the history and records her risk as routine or higher. Higher risk gets a consultant review within 2 weeks.
3. Booking bloods and an early scan to date the pregnancy, as the signed protocol sets. Her EDD goes in the antenatal register.
4. All eight contact dates are booked in advance.
5. Register entry: record number, booking date, gestation, EDD, package, risk, consultant, planned place of delivery.

EVERY CONTACT
1. Blood pressure, urine, weight, the baby's growth, and danger-sign counselling.
2. The next contact booked before she leaves.
3. At 36 weeks the doctor records the delivery plan, the place of delivery and the named consultant.

RED FLAGS: A DOCTOR SEES HER THE SAME VISIT
Bleeding, severe headache or blurred vision, blood pressure at or above the threshold on the signed protocol, reduced baby movements, fever, leaking fluid, fits, or severe abdominal pain.
Severe high blood pressure or a fit: call the consultant on call and start the emergency protocol at once.

DEFAULTER CALLS
1. A missed contact goes on the defaulter list that day.
2. She is called the same day and rebooked within 7 days.
3. Two failed calls: send an SMS, then a nurse reviews.
4. Not reached by day 7: tell the Head of Nursing.

OUTCOME
Record an outcome for every woman: delivered here, planned elsewhere, transferred, chose another facility (with the reason), or lost to follow-up.`,
    questions: [
      {
        question: "By when should the first antenatal contact happen?",
        options: ["By 12 weeks", "By 20 weeks", "By 24 weeks", "Whenever she is ready"],
        correct: 0,
        because: "The first of the eight contacts is by 12 weeks, ideally, and a woman first seen later is booked at once.",
      },
      {
        question: "At a routine contact she reports reduced baby movements. What happens?",
        options: ["Book her for next week", "A doctor sees her the same visit", "Tell her to count kicks at home", "Note it for the 36-week review"],
        correct: 1,
        because: "Reduced baby movements is a red flag. A doctor sees her the same visit.",
      },
      {
        question: "A woman misses her contact. When is she called?",
        options: ["The same day", "Within a week", "At the next contact", "Only if she has an HMO"],
        correct: 0,
        because: "A missed contact goes on the defaulter list that day and she is called the same day.",
      },
      {
        question: "By when is the place of delivery recorded?",
        options: ["At booking", "By 30 weeks", "By 36 weeks", "When she arrives in labour"],
        correct: 2,
        because: "At 36 weeks the doctor records the delivery plan, the place of delivery and the named consultant.",
      },
      {
        question: "Two calls to a defaulter have failed. What next?",
        options: ["Stop trying", "Send an SMS, then a nurse reviews", "Remove her from the register", "Wait for her to call"],
        correct: 1,
        because: "Two failed calls: SMS, then a nurse reviews. Not reached by day 7, the Head of Nursing is told.",
      },
      {
        question: "When is the next contact booked?",
        options: ["Before she leaves", "By phone the week before", "At the front desk on the day", "When she remembers"],
        correct: 0,
        because: "At every contact, the next contact is booked before she leaves.",
      },
    ],
  },
  {
    code: "AR-T17",
    week: 4,
    clinical: true,
    domain: "Clinical safety",
    title: "Infection prevention in practice",
    summary: "Hand hygiene at the five moments, protection and sharps, sterile instruments, cleaning and waste.",
    roles: [GP],
    departments: [NURSING, LAB, FACILITY],
    method: M,
    frequency: F,
    source: src("T17; SOP 14 infection prevention basics (WHO five moments)"),
    body: `WHY THIS MATTERS
No patient or member of staff should pick up an infection here that we could have prevented. The labour room, theatre and sterile services come first.

HAND HYGIENE: THE FIVE MOMENTS
1. Before touching a patient.
2. Before a clean or aseptic procedure.
3. After any risk of contact with body fluids.
4. After touching a patient.
5. After touching her surroundings.
Use alcohol rub at every bed and room. Use soap and water when hands are visibly dirty. The Head of Nursing audits hand hygiene monthly and the score goes on the board.

PROTECTION AND SHARPS
1. Gloves for contact with blood and body fluids. Apron or gown and eye protection where splashing is likely. Change them between patients.
2. Sharps into a sharps box at the point of use. Never re-capped. Close the box at three-quarters full.
3. Needle-stick or splash: wash, report, and be seen by the doctor on shift within the hour.

INSTRUMENTS
1. Clean, pack, autoclave.
2. Log every load: date, cycle, indicator result, operator.
3. A failed indicator: that load is not used. It is reprocessed, and the Head of Nursing is told at once.
4. Packs are labelled with the date and load number, stored dry, and checked before use.

CLEANING AND WASTE
1. Housekeeping signs the cleaning schedule for the labour room, theatre, consulting rooms and toilets.
2. Spills are cleaned at once.
3. Waste is separated at the point of use by the colour code posted on each bin. It is collected by a licensed contractor.
4. Soiled linen is bagged at the bedside.

WATCHING FOR INFECTION
Infections after a birth or a procedure are recorded and reviewed at the monthly clinical review. A possible cluster goes to the Medical Director the same day.`,
    questions: [
      {
        question: "Which of these is one of the five moments for hand hygiene?",
        options: ["After touching her surroundings", "Before answering the phone", "After writing a note", "Before lunch only"],
        correct: 0,
        because: "The five moments: before touching a patient, before a clean procedure, after body fluid risk, after touching a patient, after touching her surroundings.",
      },
      {
        question: "Your hands are visibly dirty. What do you use?",
        options: ["Alcohol rub", "Soap and water", "Gloves", "A paper towel"],
        correct: 1,
        because: "Alcohol rub is used routinely. Soap and water when hands are visibly soiled.",
      },
      {
        question: "When is a sharps box closed?",
        options: ["When completely full", "At three-quarters full", "Every day", "Every week"],
        correct: 1,
        because: "The sharps box is closed at three-quarters full. Sharps are never re-capped.",
      },
      {
        question: "The autoclave indicator for a load has failed. What happens to that load?",
        options: ["Used if it looks clean", "Not used, and reprocessed", "Used for non-urgent cases", "Thrown away"],
        correct: 1,
        because: "A failed indicator: the load is not used and is reprocessed.",
      },
      {
        question: "Where is soiled linen bagged?",
        options: ["In the laundry room", "At the bedside", "In the corridor", "At the end of the shift"],
        correct: 1,
        because: "Soiled linen is bagged at the bedside.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Week 5
  // -------------------------------------------------------------------------
  {
    code: "AR-T12",
    week: 5,
    clinical: true,
    domain: "Laboratory and pharmacy",
    title: "Samples, results and critical results",
    summary: "Getting every sample identified, tracked and resulted on time, and every critical result to a clinician within 30 minutes.",
    roles: [GP],
    departments: [NURSING, LAB],
    method: M,
    frequency: F,
    source: src("T12; SOP 09 laboratory sample to result (MLSCN guidelines)"),
    body: `WHY THIS MATTERS
Every sample is identified, tracked and resulted within the turnaround standard. Every critical result reaches a clinician within 30 minutes.

COLLECTION
1. The clinician orders the test. For HMO patients the code is requested first.
2. Identify the patient with two identifiers before collection: name and date of birth, or record number.
3. Label at the point of collection, in front of the patient: two identifiers, date, time and your initials.

IN THE LABORATORY
1. Log the time the sample is received.
2. Reject a sample that is unlabelled, mislabelled, haemolysed or in the wrong tube. Tell the clinician and arrange a new sample.
3. Run quality control before patient samples each day. If quality control fails, no patient result is released and the Medical Director is told at once.
4. Turnaround: routine blood counts and urine tests within 1 hour. Booking bloods the same day.
5. Send-outs: log the outside laboratory, the date sent and the expected return date. Chase the day after the expected date.

RESULTS
1. The laboratory scientist checks and authorises each result and releases it to the clinician who asked.
2. Every result is reviewed and signed by a clinician.

CRITICAL RESULTS
1. A result on the signed critical value list: phone the clinician who asked, or the doctor on shift, within 30 minutes.
2. The person receiving it reads the result back.
3. Log the time, who was told, and the read-back.
4. The clinician records the action in the note. If the patient has left, she is contacted the same day.
5. Not acknowledged in 30 minutes: the doctor on shift, then the Medical Director.

QUALITY RECORDS
External quality assessment results are kept. Calibration and maintenance are logged for each analyser.`,
    questions: [
      {
        question: "How many identifiers are checked before taking a sample?",
        options: ["One", "Two", "Three", "None if you know her"],
        correct: 1,
        because: "Two identifiers, such as name and date of birth or record number, before collection and on the label.",
      },
      {
        question: "Where is the sample labelled?",
        options: ["In the laboratory", "At the point of collection, in front of the patient", "At the front desk", "After the result is out"],
        correct: 1,
        because: "Label at the point of collection, in the patient's presence.",
      },
      {
        question: "A sample arrives without a label. What does the laboratory do?",
        options: ["Guess from the request form", "Reject it and arrange a new sample", "Run it and label later", "Hold it until someone claims it"],
        correct: 1,
        because: "An unlabelled or mislabelled sample is rejected, the clinician told and a new sample arranged.",
      },
      {
        question: "A critical result comes out. Within how long must a clinician be told?",
        options: ["30 minutes", "2 hours", "End of the day", "Next visit"],
        correct: 0,
        because: "A critical result is phoned to the clinician who asked, or the doctor on shift, within 30 minutes.",
      },
      {
        question: "You phone a critical result to the doctor. What must the doctor do on the call?",
        options: ["Nothing", "Read the result back", "Sign the form", "Call the patient first"],
        correct: 1,
        because: "The receiver reads the result back, and the time, person and read-back are logged.",
      },
      {
        question: "Quality control has failed this morning. What happens to patient results?",
        options: ["Released with a note", "None released", "Released if urgent", "Released after lunch"],
        correct: 1,
        because: "If QC fails, no patient result is released and the Medical Director is told.",
      },
    ],
  },
  {
    code: "AR-T13",
    week: 5,
    clinical: true,
    domain: "Laboratory and pharmacy",
    title: "Dispensing and controlled drugs",
    summary: "Dispensing safely against a prescription, and accounting for every controlled drug under two signatures.",
    roles: [GP],
    departments: [NURSING],
    method: M,
    frequency: F,
    source: src("T13; SOP 10 pharmacy dispensing and the controlled drug register (PCN Act 2022; NAFDAC Controlled Medicines Regulations 2019)"),
    body: `WHY THIS MATTERS
Every medicine goes to the right patient against a prescription. Every controlled drug is accounted for under two signatures. The critical list never runs out. Until a pharmacist is in post, the nurse in charge holds the pharmacist's duties below.

DISPENSING
1. Dispense only against a signed prescription that states the patient, medicine, dose, route, how often and for how long.
2. Check the patient with two identifiers. Check the dose, allergies, pregnancy status and interactions. If anything is unclear, ask the prescriber.
3. Label: patient name, medicine, strength, directions, date, quantity.
4. Counsel her: how and when to take it, and side effects to report. She repeats it back.
5. Record the issue on the stock card.

CONTROLLED DRUGS
1. Stored in a double-locked cabinet. The keys are held by the nurse in charge and the pharmacist, never left in a drawer.
2. The controlled drug register is a bound book with numbered pages, one page per drug and strength.
3. Every receipt and every dose is entered at the time: date, time, record number, prescriber, quantity, balance.
4. Two signatures: the person giving and a witness.
5. A part dose is discarded in front of the witness and recorded.
6. Counted by two people at every shift change. The balance is agreed and signed.

IF THE COUNT IS WRONG
Stop. Recount. Report it the same day to the pharmacist and the Medical Director, and file an incident. Never alter an entry. Write a dated correction signed by both people.

RESTRICTED ITEMS AND STOCK
1. Misoprostol and mifepristone are held only in the pharmacy and the haemorrhage kit, issued against a prescription and logged.
2. Every stock card has a reorder level. The critical list is checked daily.
3. First to expire, first out. Items expiring within 30 days are listed each month.
4. Fridge temperature logged twice daily. Buy only from NAFDAC-registered suppliers.`,
    questions: [
      {
        question: "Can a medicine be dispensed on a verbal request?",
        options: ["Yes, if the doctor is busy", "No, only against a signed prescription", "Yes, for regular patients", "Yes, if it is cheap"],
        correct: 1,
        because: "Dispense only against a signed prescription stating the patient, medicine, dose, route, frequency and duration.",
      },
      {
        question: "How many signatures does each controlled drug entry need?",
        options: ["One", "Two: the giver and a witness", "Three", "None if the pharmacist is present"],
        correct: 1,
        because: "Every controlled drug entry has two signatures: the person giving and a witness.",
      },
      {
        question: "When are controlled drugs counted?",
        options: ["Once a week", "At every shift change, by two people", "Monthly", "Only when something is missing"],
        correct: 1,
        because: "Controlled drugs are counted by two people at every shift change, and the balance agreed and signed.",
      },
      {
        question: "You made a mistake in the controlled drug register. What do you do?",
        options: [
          "Cross it out neatly",
          "Use correction fluid",
          "Leave it and write a dated correction signed by both people",
          "Tear out the page",
        ],
        correct: 2,
        because: "Never alter an entry. Write a dated correction signed by both.",
      },
      {
        question: "Where are misoprostol and mifepristone kept?",
        options: ["In any ward cupboard", "Only in the pharmacy and the haemorrhage kit", "At the front desk", "In the doctor's office"],
        correct: 1,
        because: "Misoprostol and mifepristone are held only in the pharmacy and the haemorrhage kit, issued against a prescription and logged.",
      },
      {
        question: "Where are the controlled drug cabinet keys kept?",
        options: ["In the top drawer", "With the nurse in charge and the pharmacist", "At the front desk", "With security"],
        correct: 1,
        because: "The keys are held by the nurse in charge and the pharmacist, never left in a drawer.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Week 6
  // -------------------------------------------------------------------------
  {
    code: "AR-T15",
    week: 6,
    clinical: false,
    domain: "Patient journey",
    title: "Handling a complaint",
    summary: "Every complaint reaches someone who can fix it, is acknowledged the same day and closed within 5 working days.",
    roles: [HOO, MD, HON],
    departments: [FRONT],
    method: M,
    frequency: F,
    source: src("T15; SOP 12 complaints"),
    body: `WHY THIS MATTERS
A complaint handled well often keeps a patient for life. Every complaint reaches someone who can fix it, is acknowledged the same day and is closed within 5 working days. Then the practice learns from it.

RECEIVE IT
1. Listen. Thank her. Apologise for her experience without arguing.
2. Fix it on the spot if you can.
3. Log it on the staff app the same day: who, what, when, and what she wants.
4. Acknowledge it the same day, with the owner's name and when she will hear back.

WHO OWNS IT
1. Service and billing: the front desk, with the Head of Operations.
2. A refund above the limit: the Head of Operations takes it to Dr Chito.
3. Anything clinical: the Medical Director, the same day.
4. A threat of a claim, a lawyer's letter or the media: Dr Chito, the same day.
5. About a colleague's conduct: that person's lead.

RESOLVE IT
1. Investigate within 3 working days: records, staff accounts, any recording.
2. Respond within 5 working days: what happened, what we have done, an apology where it is due, and any refund within the limits.
3. Close it in the log with the outcome.
4. If she is not satisfied, offer a meeting with the Head of Operations or the Medical Director.

SOCIAL MEDIA
Reply once in public, with an offer to take it private. Never discuss anything clinical in public.

LEARN FROM IT
At the weekly review: complaints opened and closed, the themes, and one action.`,
    questions: [
      {
        question: "When is a complaint acknowledged?",
        options: ["The same day", "Within 3 days", "Within 5 days", "When it is resolved"],
        correct: 0,
        because: "It is acknowledged the same day, with the owner's name and when she will hear back.",
      },
      {
        question: "Within how many working days is a complaint closed?",
        options: ["2", "5", "10", "30"],
        correct: 1,
        because: "Investigate within 3 working days and respond within 5.",
      },
      {
        question: "A patient complains about her treatment by a doctor. Who owns it?",
        options: ["The front desk", "The Head of Operations", "The Medical Director", "The doctor concerned"],
        correct: 2,
        because: "Anything clinical goes to the Medical Director the same day.",
      },
      {
        question: "A patient posts a complaint on Instagram. How do we reply?",
        options: [
          "Explain the clinical facts publicly",
          "Ignore it",
          "Reply once in public, offering to take it private",
          "Ask her to delete it",
        ],
        correct: 2,
        because: "Reply once in public with an offer to take it private. Never discuss clinical detail in public.",
      },
      {
        question: "What is the first thing you do when a patient complains to you?",
        options: ["Defend the practice", "Listen, thank her and apologise for her experience", "Call security", "Send her to the Head of Operations"],
        correct: 1,
        because: "Listen, thank her and apologise for the experience without arguing. Fix it on the spot if you can.",
      },
    ],
  },
  {
    code: "AR-T16",
    week: 6,
    clinical: true,
    domain: "Clinical safety",
    title: "Chaperone and consent",
    summary: "A chaperone for every intimate examination, and informed, recorded consent for every procedure that needs it.",
    roles: [GP],
    departments: [NURSING],
    method: M,
    frequency: F,
    source: src("T16; SOP 13 chaperone and consent (ACOG Committee Opinion 796)"),
    body: `WHY THIS MATTERS
A chaperone and proper consent protect the patient and the clinician alike. This applies to every clinician, including visiting consultants, in outpatients, on the ward and in labour.

CHAPERONE
1. A chaperone is present for every breast, genital and rectal examination, whatever the examiner's gender. That includes transvaginal scans and examinations in labour.
2. The chaperone is trained clinical staff, a nurse or midwife. Not a relative and not front desk staff. A family member may also be there if she wishes.
3. Explain the examination and why, before starting. Get her verbal agreement. She may stop it at any time.
4. The chaperone stays in the room, with a line of sight, for the whole examination.
5. Record the chaperone's name and role in the note.
6. If she declines a chaperone, explain why one is offered, record it, and decide whether to go ahead or rebook.
7. Privacy: door closed or curtain drawn, cover her, no interruptions.
8. No chaperone available: rebook or wait, unless it is an emergency.

CONSENT
1. Written consent is needed for: procedures under anaesthesia or sedation, operative delivery, transvaginal scans, HIV testing, blood transfusion, fertility treatment, and photography.
2. The clinician doing it explains what, why, the benefits, the common and serious risks, and the alternatives, including doing nothing.
3. She can ask questions. It is in a language she understands, with an interpreter if needed.
4. A woman with capacity consents for herself. A partner or relative may be involved if she wishes, but does not consent for her.
5. Minors, emergencies and women without capacity: as the Medical Director's protocol directs.
6. The form is signed by her and the clinician, dated and timed, and filed. She may withdraw consent at any time. Record it.
7. If consent is unclear before a procedure, the procedure does not start.`,
    questions: [
      {
        question: "Who can act as a chaperone?",
        options: ["Her husband", "Any staff member", "A trained nurse or midwife", "The front desk"],
        correct: 2,
        because: "The chaperone is trained clinical staff, a nurse or midwife, not a relative or front desk staff.",
      },
      {
        question: "Is a chaperone needed if the examiner is female?",
        options: ["No", "Yes, whatever the examiner's gender", "Only for scans", "Only if the patient asks"],
        correct: 1,
        because: "A chaperone is present for every breast, genital and rectal examination, whatever the examiner's gender.",
      },
      {
        question: "Her husband wants to sign the consent form for her. She has capacity. What do you do?",
        options: [
          "Let him sign",
          "Both must sign",
          "She consents for herself; he may be involved if she wishes",
          "Ask the Medical Director to sign",
        ],
        correct: 2,
        because: "A woman with capacity consents for herself. A partner may be involved at her wish but does not consent for her.",
      },
      {
        question: "Which of these needs written consent?",
        options: ["Taking blood pressure", "HIV testing", "Weighing", "A routine conversation"],
        correct: 1,
        because: "Written consent is needed for HIV testing, procedures under sedation, transvaginal scans, transfusion and others on the list.",
      },
      {
        question: "No chaperone is available and it is not an emergency. What happens?",
        options: ["Go ahead without one", "Use a relative", "Rebook or wait", "Ask the front desk to stand in"],
        correct: 2,
        because: "No chaperone available: rebook or wait unless it is an emergency.",
      },
      {
        question: "Where is the chaperone recorded?",
        options: ["Nowhere", "In the note, by name and role", "On the rota", "In the daily return"],
        correct: 1,
        because: "The chaperone's name and role are recorded in the note.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Week 7
  // -------------------------------------------------------------------------
  {
    code: "AR-T03",
    week: 7,
    clinical: false,
    domain: "Leading the team",
    title: "Leading a team: feedback, lateness, decisions and the rota",
    summary: "For leads: giving feedback in private, handling lateness, deciding within your limits, and keeping the rota honest.",
    roles: [HOO, MD, HON, HOC],
    departments: [],
    method: M,
    frequency: F,
    source: src("T03; Module 2 decision rights and escalation; Module 7 people; SOP 15"),
    body: `WHY THIS MATTERS
Every person at Arabella has one named supervisor on site, and every recurring decision has an owner and a limit. Decisions get made below Dr Chito, so nothing waits for one person.

FEEDBACK
1. Thank people in public, by name, for something specific. The huddle has a minute for it every day.
2. Correct in private, soon, and about the behaviour, not the person.
3. Say what you saw, why it matters to the patient, and what you need next time.
4. Staff told us the hardest things are questioning a senior decision and what follows a mistake. Make both safe. Thank the person who raises a concern, even when the answer is no.

LATENESS AND ABSENCE
1. Sign-in shows who was late. Look at it weekly, person by person.
2. Talk to the person privately the first time. Ask what is getting in the way. Many staff also work elsewhere, so plan around second jobs instead of discovering them.
3. If it carries on, follow the correction ladder in the staff handbook: verbal, then written, then final. A final warning or dismissal goes to Dr Chito.

DECISIONS WITHIN YOUR LIMIT
1. Rota swaps and locum cover: the Head of Nursing for nurses, the Head of Clinicals for doctors, within the month's budget.
2. Leave: the person's lead, within entitlement, never two people from one post off together.
3. Admitting, calling the consultant, or transferring a patient out: the doctor on shift. A transfer never waits for approval.
4. Refunds, discounts and spending: the Head of Operations, up to the limits Dr Chito has set.
5. Prices, new services, hiring and contracts: always Dr Chito.
6. Record every decision in the decision log. Anything over a limit goes to Dr Chito with the days it has waited showing.

THE ROTA
1. Posted 2 weeks ahead, every post filled, a shift senior named.
2. Collect availability before you draft it.
3. No back-to-back 24-hour shifts.
4. Approve swaps on the app, never by word of mouth.`,
    questions: [
      {
        question: "Where do you correct a team member?",
        options: ["At the huddle", "In private", "On the group chat", "In front of the patient"],
        correct: 1,
        because: "Praise is given in public; correction is given in private, soon, and about the behaviour.",
      },
      {
        question: "A nurse has been late three times this month. What is your first step?",
        options: ["A written warning", "A private talk to ask what is getting in the way", "Report her to Dr Chito", "Take her off the rota"],
        correct: 1,
        because: "Talk privately the first time and ask what is getting in the way. Then the handbook ladder: verbal, written, final.",
      },
      {
        question: "The doctor on shift decides a woman must be transferred out. Who must approve it?",
        options: ["Dr Chito", "The Head of Operations", "Nobody: a transfer never waits for approval", "The HMO"],
        correct: 2,
        because: "Transfer out is the doctor on shift's decision, with no limit. It never waits for approval.",
      },
      {
        question: "Who decides a new price or a new hire?",
        options: ["The Head of Operations", "Any lead", "Always Dr Chito", "The front desk"],
        correct: 2,
        because: "Prices, new services, hiring and contracts are decided by nobody below Dr Chito.",
      },
      {
        question: "A decision is above your limit. What do you do?",
        options: [
          "Decide it anyway to save time",
          "Record it in the decision log and take it to Dr Chito",
          "Leave it until someone asks",
          "Ask a colleague to decide",
        ],
        correct: 1,
        because: "Every decision is recorded in the decision log. Anything over a limit goes to Dr Chito with the days waited showing.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Week 8
  // -------------------------------------------------------------------------
  {
    code: "AR-T10",
    week: 8,
    clinical: true,
    domain: "Clinical: maternity",
    title: "Labour, the Safe Childbirth Checklist and transfer out",
    summary: "Caring for every woman in labour to the Labour Care Guide and the four checklist pause points, and getting her out safely when she needs more.",
    roles: [GP],
    departments: [NURSING],
    method: M,
    frequency: F,
    source: src("T10; SOP 07 labour and delivery readiness, and transfer out (WHO Labour Care Guide 2020; WHO Safe Childbirth Checklist)"),
    body: `WHY THIS MATTERS
Every woman in labour is cared for to the WHO Labour Care Guide and Safe Childbirth Checklist, with the consultant on call reachable. Any woman or baby who needs care beyond our site leaves within 30 minutes of the decision, with a written handover.

READY EVERY SHIFT
1. Labour room ready: bed, sterile delivery pack in date, light, warmth, clock, hand hygiene supplies. Emergency kit checks done.
2. The consultant on call for labour and theatre is named on the board with a phone number.
3. Transfer ready: the receiving facility's number on the wall, a vehicle and driver available or arranged, and the transfer pack stocked.

ADMISSION
1. Assess: antenatal record, vitals, the baby's heart, contractions, cervical assessment. Review her risk and record the decision.
2. Pause point 1, on admission: does she need referral? Start the Labour Care Guide in active labour. Give treatments as the signed protocol directs. A birth companion is encouraged.
3. Tell the consultant on call of every admission in labour, and record the time.

DURING LABOUR
1. Record on the Labour Care Guide at the intervals printed on the form. The form governs.
2. Any value in the guide's alert column: the doctor reviews and records a plan. The consultant is called as the plan says.
3. Pause point 2, before pushing: the uterotonic drawn up for the mother, newborn resuscitation items at the bedside, and a second person identified to help.

BIRTH AND AFTER
1. Pause point 3, within an hour of birth: bleeding checked, uterotonic given as the protocol directs. The baby breathing, warm, skin to skin, breastfeeding started.
2. Pause point 4, before discharge: bleeding controlled, blood pressure checked, baby feeding well, danger signs explained, family planning discussed, postnatal follow-up booked.

TRANSFER OUT
1. The decision is made by the doctor on shift or the consultant. It never waits for approval. Record the time.
2. Phone the receiving facility with an SBAR handover. Confirm they accept and record who accepted.
3. A nurse or midwife escorts her, continuing care on the way, with the referral letter, a copy of the Labour Care Guide, the antenatal record and drugs given.
4. She leaves within 30 minutes of the decision. Record the time. Over 30 minutes is an incident report.
5. Dr Chito is told by phone within 1 hour.
6. Call within 24 hours to find out the outcome. Every transfer is reviewed at the monthly clinical review.`,
    questions: [
      {
        question: "When does a transfer out need approval?",
        options: ["Always, from Dr Chito", "Only for HMO patients", "Never: it never waits for approval", "Only at night"],
        correct: 2,
        because: "The decision is made by the doctor on shift or the consultant and never waits for approval.",
      },
      {
        question: "Within how long of the decision should she leave?",
        options: ["15 minutes", "30 minutes", "1 hour", "2 hours"],
        correct: 1,
        because: "Departure within 30 minutes of the decision, with the time recorded. Over 30 minutes is an incident report.",
      },
      {
        question: "How often do you record on the Labour Care Guide?",
        options: ["Every hour", "At the intervals printed on the form", "When something changes", "Once per stage"],
        correct: 1,
        because: "Record at the intervals printed on the form. The form governs.",
      },
      {
        question: "What happens at pause point 2, before pushing?",
        options: [
          "Discharge planning",
          "Uterotonic drawn up, newborn resuscitation items at the bedside, a second person identified",
          "HMO code requested",
          "The consultant leaves",
        ],
        correct: 1,
        because: "Before pushing: uterotonic drawn up for the mother, newborn resuscitation items at the bedside, a second helper identified.",
      },
      {
        question: "A value falls in the guide's alert column. What happens?",
        options: ["Note it and continue", "The doctor reviews and records a plan", "Transfer at once", "Wait for the next reading"],
        correct: 1,
        because: "Any alert value: the doctor reviews and records a plan, and the consultant is called as the plan says.",
      },
      {
        question: "Who is told of every admission in labour?",
        options: ["The HMO", "The consultant on call", "The front desk", "The Head of Operations"],
        correct: 1,
        because: "The consultant on call is told of every admission in labour, with the time recorded.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Week 9
  // -------------------------------------------------------------------------
  {
    code: "AR-T19",
    week: 9,
    clinical: false,
    domain: "Money",
    title: "HMO claims and payments",
    summary: "Claiming every HMO visit within 7 days, matching what is paid to what was claimed, and chasing what is not.",
    roles: [HOO],
    departments: [FRONT],
    method: M,
    frequency: F,
    source: src("T19; SOP 04 weekly claims; Module 6 payer rules"),
    body: `WHY THIS MATTERS
An HMO visit is only income once it is claimed and paid. A claim that is late, missing a code or never chased is care given for free.

THE CHAIN
1. Code at the door: every service has its code before it is given.
2. One line per HMO encounter in the daily close, with the HMO, enrollee ID and codes.
3. Claim weekly.
4. Match payments to claims.
5. Chase what is short, denied or late.

CLAIMING
1. Every week, claim every HMO encounter of the week, with its codes.
2. Submit within 7 days of the encounter.
3. Record the submission date in the claims register.

MATCHING PAYMENTS
1. When an HMO pays, match the payment to the claims it covers.
2. List short payments and denials, with the reason the HMO gives.
3. Give the list to the Head of Operations at the weekly review.

CHASING
1. A denial with a fixable reason, such as a missing code: correct it and resubmit.
2. A claim unpaid at 60 days: the Head of Operations sends a letter to the HMO.
3. One HMO repeatedly late: it goes to the weekly review.

THE RULES BEHIND IT
1. Tariffs and contracts are Dr Chito's decision. Nobody agrees a tariff change at the desk.
2. Top-ups for a private room, a named consultant or premium scans are agreed with the patient before the service and billed as cash.
3. The practice keeps track of what each HMO pays against our cash price and how fast it pays. That is how Dr Chito decides which HMOs to keep, renegotiate or leave. Accurate claims are what make that possible.`,
    questions: [
      {
        question: "Within how many days of the visit is an HMO claim submitted?",
        options: ["7", "14", "30", "90"],
        correct: 0,
        because: "Every HMO encounter is claimed weekly and submitted within 7 days of the encounter.",
      },
      {
        question: "An HMO denies a claim because a code is missing. What do you do?",
        options: ["Write it off", "Correct it and resubmit", "Bill the patient", "Ignore it"],
        correct: 1,
        because: "A denial with a fixable reason, such as a missing code, is corrected and resubmitted.",
      },
      {
        question: "A claim is still unpaid at 60 days. What happens?",
        options: ["Nothing", "The Head of Operations sends a letter to the HMO", "The patient is billed", "The claim is cancelled"],
        correct: 1,
        because: "At 60 days the Head of Operations sends a letter to the HMO.",
      },
      {
        question: "An HMO officer asks you to accept a lower tariff on the phone. What do you do?",
        options: ["Agree to keep them happy", "Refuse rudely", "Say tariffs are Dr Chito's decision and pass it on", "Agree for one month"],
        correct: 2,
        because: "Tariffs and contracts are Dr Chito's decision. Nobody agrees a tariff change at the desk.",
      },
      {
        question: "When an HMO pays, what do you do with the payment?",
        options: ["Bank it and move on", "Match it to the claims it covers and list any shortfall", "Split it between departments", "Wait for month end"],
        correct: 1,
        because: "Payments are matched to claims, with short payments and denials listed for the weekly review.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Week 10
  // -------------------------------------------------------------------------
  {
    code: "AR-T14",
    week: 10,
    clinical: false,
    domain: "Leading the team",
    title: "Reviewing an incident",
    summary: "For leads: grading an incident, reviewing it for what in the system allowed it, and telling the team what changed.",
    roles: [HOO, MD, HON],
    departments: [LAB],
    method: M,
    frequency: F,
    source: src("T14; SOP 11 incident and near-miss reporting"),
    body: `WHY THIS MATTERS
People report when they see something change because of it, and stop when they see blame. The review asks what in our system allowed this to happen.

GRADING
The shift senior grades each report:
1. Near miss: caught before it reached anyone.
2. No harm.
3. Low harm.
4. Serious: moderate or severe harm, or death.

A SERIOUS INCIDENT
1. The Medical Director and Dr Chito are phoned within 1 hour.
2. Equipment, drugs and records are kept as they are.
3. The patient and family are told honestly, the same day, what happened and what is being done, by the senior clinician.
4. A structured review within 7 days.

THE REVIEW
1. Clinical incidents are reviewed by the Medical Director or the Head of Nursing. Non-clinical ones by the Head of Operations.
2. Start with the facts: what happened, in what order.
3. Ask what in the system allowed it: the process, the kit, the rota, the training, the information, the time of day.
4. Agree actions, each with one owner and a date. An action that only says "be more careful" is not an action.
5. Tell the reporter, if named, and the team what changed within 14 days. Announce changes at the huddle.
6. Take themes to the monthly clinical review and the improvement log.

THE RULE
Reporting is never punished. Concealment is. Individual action follows only deliberate harm, impairment, or repeated reckless disregard after support.

AT THE HUDDLE
Incidents and near misses since yesterday are heard without names.`,
    questions: [
      {
        question: "A serious incident happens. Within how long are the Medical Director and Dr Chito phoned?",
        options: ["1 hour", "24 hours", "7 days", "At the weekly review"],
        correct: 0,
        because: "Serious incidents are phoned to the Medical Director and Dr Chito within 1 hour.",
      },
      {
        question: "What question does the review ask?",
        options: ["Who is to blame?", "What in the system allowed it?", "How much did it cost?", "Who reported it?"],
        correct: 1,
        because: "The review looks for what in the system allowed it, and agrees actions with an owner and a date.",
      },
      {
        question: "Which of these is a real action from a review?",
        options: [
          "Staff to be more careful",
          "Add the second check to the opening checklist, owner Head of Nursing, by Friday",
          "Remind everyone at some point",
          "Discuss again next month",
        ],
        correct: 1,
        because: "Each action has one owner and a date. \"Be more careful\" is not an action.",
      },
      {
        question: "Within how long is the team told what changed?",
        options: ["7 days", "14 days", "30 days", "Only if asked"],
        correct: 1,
        because: "The reporter and the team are told what changed within 14 days, and changes are announced at the huddle.",
      },
      {
        question: "When does an incident lead to action against an individual?",
        options: [
          "Whenever a patient is harmed",
          "Only for deliberate harm, impairment, or repeated reckless disregard after support",
          "When the person reported it themselves",
          "After any second mistake",
        ],
        correct: 1,
        because: "Individual action follows only deliberate harm, impairment, or repeated reckless disregard after support.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Week 11
  // -------------------------------------------------------------------------
  {
    code: "AR-T21",
    week: 11,
    clinical: false,
    domain: "Leading the team",
    title: "What an inspector checks",
    summary: "For leads: the licences and records a regulator or HMO will ask to see, and who keeps each one current.",
    roles: [HOO, MD, HON],
    departments: [LAB],
    method: M,
    frequency: F,
    source: src("T21; Register A new-site compliance"),
    body: `WHY THIS MATTERS
An inspector does not take our word for it. They ask to see the licence, the register, the log. Every licence is current, at the right address and in the right name: Arabella Women's Health, at the new site.

THE FACILITY
1. Registration with the FCT health facility regulator, in the Arabella name at the new address, with the services we actually offer.
2. The company's registered name used on every contract, registration and invoice.
3. Indemnity cover for the site and the visiting consultants.
4. A licensed medical waste contractor, with consignment notes kept.
5. The fire certificate for the premises.

PEOPLE
1. Every doctor's current practising licence on file, and every visiting consultant's specialist registration.
2. Every nurse's and midwife's licence, and locums' licences checked before their first shift.
3. The laboratory scientist's licence, and the laboratory registered at the new address.

MEDICINES
1. A superintendent pharmacist arrangement, and the pharmacy premises registered.
2. The controlled drug register: bound, numbered, two signatures, counts signed.
3. Medicines bought only from NAFDAC-registered suppliers.

PATIENT DATA
1. A named data protection officer.
2. The privacy notice at reception and consent to contact recorded.
3. Access to records by role.

WHAT THEY WILL ASK TO SEE
Kit check logs, fridge temperature logs, the autoclave log, the cleaning schedule, quality control records, the critical result log, the incident log, signed SOPs with review dates.

WHO KEEPS IT
The Head of Operations keeps the compliance register and chases every renewal. Each lead keeps their own logs. A gap goes on the action log with an owner and a date, not in a drawer.`,
    questions: [
      {
        question: "Whose name must be on the facility registration at the new site?",
        options: ["Tabitha Medical Centre", "Arabella Women's Health", "Dr Chito's personal name", "Any name is fine"],
        correct: 1,
        because: "Every licence is current, at the right address and in the right name: Arabella Women's Health at the new site.",
      },
      {
        question: "When is a locum nurse's licence checked?",
        options: ["After a month", "Before the first shift", "At the annual review", "Only if asked"],
        correct: 1,
        because: "Locums' licences are checked before their first shift.",
      },
      {
        question: "An inspector asks how you know the vaccine fridge stayed cold. What do you show?",
        options: ["Your word", "The fridge temperature log", "The receipt for the fridge", "A photo of the fridge"],
        correct: 1,
        because: "Inspectors ask to see the record: kit check logs, fridge temperature logs and the like.",
      },
      {
        question: "Who keeps the compliance register and chases renewals?",
        options: ["The front desk", "The Head of Operations", "Each doctor", "The landlord"],
        correct: 1,
        because: "The Head of Operations keeps the compliance register and chases every renewal.",
      },
      {
        question: "You find a gap, such as a missing licence copy. What happens?",
        options: [
          "Keep quiet until the inspection",
          "It goes on the action log with an owner and a date",
          "Borrow another facility's copy",
          "Nothing, it is not your area",
        ],
        correct: 1,
        because: "A gap goes on the action log with an owner and a date, not in a drawer.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Week 12
  // -------------------------------------------------------------------------
  {
    code: "AR-T20",
    week: 12,
    clinical: false,
    domain: "Leading the team",
    title: "Improvement basics: aim, measure, change, test",
    summary: "For leads: how to improve one thing at a time, with a clear aim, a measure, and a small test before a big change.",
    roles: [HOO, MD, HON, HOC],
    departments: [],
    method: M,
    frequency: F,
    source: src("T20; Register B improvement and assurance (test of change)"),
    body: `WHY THIS MATTERS
Twelve weeks of the daily view now show where the practice is strong and where it is not. Improvement means picking one thing, changing it on purpose, and checking it worked.

THREE QUESTIONS
1. What are we trying to achieve? The aim.
2. How will we know a change is an improvement? The measure.
3. What change can we try? The change.

A GOOD AIM
Specific, with a number and a date. "Reduce the median wait from arrival to seen to under 30 minutes by the end of March." Not "improve waiting times".

A GOOD MEASURE
1. Use what the daily view already records. Do not start a new form if a record exists.
2. Look at it over time, week by week, not one good day.

TEST SMALL FIRST: PLAN, DO, STUDY, ACT
1. Plan: what you will change, for whom, for how long, and what you expect to happen.
2. Do: try it small. One clinic, one morning, one week.
3. Study: look at the measure. Did it do what you expected? What surprised you?
4. Act: keep it, adjust it and test again, or drop it.

ONE AT A TIME
The weekly review picks one improvement at a time. Each has an owner, a test-of-change worksheet and a date to report back.

CHECKING WE KEEP THE GAINS
1. Each quarter, each owner shows a month of their checklists, logs and measures.
2. Gaps go into the action log.
3. Later, the practice will measure itself against an external standard that HMOs recognise, such as SafeCare.`,
    questions: [
      {
        question: "Which of these is a good aim?",
        options: [
          "Improve waiting times",
          "Reduce the median wait to under 30 minutes by the end of March",
          "Be faster",
          "Make patients happy",
        ],
        correct: 1,
        because: "A good aim is specific, with a number and a date.",
      },
      {
        question: "What does the S in PDSA stand for?",
        options: ["Start", "Study", "Stop", "Share"],
        correct: 1,
        because: "Plan, do, study, act. Study means looking at the measure to see whether the change did what you expected.",
      },
      {
        question: "How should you test a new idea first?",
        options: ["Across the whole practice at once", "Small: one clinic, one morning or one week", "Only on paper", "After asking every patient"],
        correct: 1,
        because: "Try it small first, then study the measure before spreading it.",
      },
      {
        question: "Where should the measure come from?",
        options: [
          "A new form for every change",
          "What the daily view already records, where possible",
          "Your impression of the day",
          "Patient gossip",
        ],
        correct: 1,
        because: "Use what the daily view already records. Do not start a new form if a record exists.",
      },
      {
        question: "How many improvements does the weekly review pick at a time?",
        options: ["One", "Three", "Five", "As many as possible"],
        correct: 0,
        because: "The weekly review picks one improvement at a time, with an owner, a worksheet and a date to report back.",
      },
    ],
  },
];

/** The modules in teaching order: by week, then as listed. */
export const ARABELLA_MODULES_BY_WEEK: ArabellaModule[] = [...ARABELLA_MODULES].sort((a, b) => a.week - b.week);
