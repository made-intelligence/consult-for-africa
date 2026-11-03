/**
 * Haven's own SOPs, cut into short staff modules, plus a core set for everyone.
 *
 * Source: the six SOPs Haven supplied during the audit (nurses, health
 * attendants, pharmacy, laboratory v1.1, customer service, HMO). Each SOP
 * module below is that document's own content, reordered and cleaned up so a
 * nurse can read it on a phone in about fifteen minutes. Nothing clinical has
 * been added to a Haven SOP module. Where the SOP is thin or contradicts itself
 * that is noted in a comment here, never smoothed over in the body, because a
 * body that quietly fixes the SOP is no longer Haven's SOP.
 *
 * The CORE modules are ours, written to recognised standards (WHO hand
 * hygiene, the Child Rights Act, NDPA 2023, ordinary fire safety). They are
 * generic on purpose: they apply to everybody, so roles is empty.
 *
 * Questions are drafted by CFA from each module's body and every one is
 * answerable from that body alone. The schema rule is that questions are
 * authored by the clinical lead; the way this honours it is that nothing here
 * reaches staff until a clinician approves the module (approvedAt stays NULL
 * on seed). Seeded by scripts/seed-haven-sop-modules.ts.
 *
 * Roles are needles for the loose matcher in lib/havenToday.ts: a role matches
 * when the person's "position department" contains it. The words used here are
 * taken from docs/data/haven-staff-roster.json so they actually land.
 *
 * method uses the vocabulary already in the Protocol table (QUESTIONS).
 * frequency is ON_INDUCTION_THEN_ANNUAL: done on joining, then yearly. It is a
 * new value next to the existing ON_INDUCTION / ANNUAL, so a label map needs one
 * more entry.
 */

export interface SopQuestion {
  question: string;
  options: string[];
  /** Index into options. */
  correct: number;
  /** Shown after answering, right or wrong. */
  because: string;
}

export interface SopModule {
  code: string;
  domain: string;
  title: string;
  summary: string;
  body: string;
  roles: string[];
  departments: string[];
  method: "QUESTIONS";
  frequency: "ON_INDUCTION_THEN_ANNUAL";
  /** Where the content came from, for the approver. */
  source: string;
  questions: SopQuestion[];
}

const M = "QUESTIONS" as const;
const F = "ON_INDUCTION_THEN_ANNUAL" as const;

const NURSES = "SOP for Nurses (approved 27 June 2025, updated 26 March 2026)";
const ATTENDANTS = "SOP for Health Attendants (updated 8 May 2026)";
const PHARMACY = "Pharmacy Department SOP (July 2026)";
const LAB = "Laboratory Department SOP v1.1";
const CS = "SOP for Customer Service";
const HMO = "SOPs for HMO (Head of Operations)";
const CORE = "CFA core module, written to recognised standards";

const NURSING_ROLES = ["Nursing"];
const NURSING_DEPTS = ["NURSING"];

// ---------------------------------------------------------------------------
// Nursing
// ---------------------------------------------------------------------------

const NURSING: SopModule[] = [
  {
    code: "SOP-NUR-01",
    domain: "SOP: Nursing",
    title: "The outpatient clinic, from setting up to the doctor's door",
    summary: "How the clinic is set up at resumption and how each child moves through vitals, the doctor, the lab and billing.",
    roles: NURSING_ROLES,
    departments: NURSING_DEPTS,
    method: M,
    frequency: F,
    source: NURSES,
    body: `ON RESUMPTION
1. Clean the work area and equipment with sanitiser.
2. Check the equipment works: thermometer, weighing scale, pulse oximeter, tape rule.
3. Check there is clean linen, a mackintosh and a couch roll folded at the foot of the bed. If the bedsheet is stained or missing, ask the health attendant for a new one.
4. Lay couch roll over the bedsheet and discard it after each use.
5. Check consumables are available: syringes, needles, cotton swabs, sterile water, sharps box, boil plaster, gloves.
6. Go through the paediatric appointments and the EMR.

THE PATIENT JOURNEY
1. Customer care directs the family to the Nurses' Nook for vitals and triage.
2. Greet and introduce yourself to the child and the caregiver.
3. Check routine vitals including occipitofrontal circumference, height and weight. Switch off the AC while undressing a baby.
4. Children up to 18 months: check weight without undressing.
5. Forward the patient's page on the EMR to the doctor. For a specialist consult, forward it to the named specialist.
6. Take the child and caregiver to the doctors. Seat them in the Doctors' Nook waiting area, then knock gently before opening the door to tell the doctor a patient is waiting.
7. Follow up with the doctor by phone for any instructions about the patient.

AFTER THE CONSULTATION
1. Direct the family and tell the billing officer what care was given.
2. Medication to be given in clinic is dispensed by the pharmacist.
3. Prescriptions: direct the family to reception to wait, and tell the pharmacist and billing officer the patient is waiting.
4. Lab tests: tell the health attendant and direct the patient to the brave room for sample collection, then ask them to wait at reception. When results are ready, take the patient back to the doctor's office.
5. Document on the EMR and the relevant sheets.

OUTREACH EVENTS
A nurse attends every event that needs our services. The nurse on duty the night or day before packs everything on the outreach list (banners, BP machine, thermometer, glucose strips and lancets, cannulas, fluids, hydrocortisone, sharps box, gloves and the rest).`,
    questions: [
      {
        question: "You are about to undress a baby for vitals. What does the SOP say to do first?",
        options: ["Switch off the AC", "Call the doctor", "Weigh the baby clothed", "Lay a fresh bedsheet"],
        correct: 0,
        because: "The SOP says to switch off the AC while undressing a baby, so the child does not get cold.",
      },
      {
        question: "A 14 month old needs to be weighed. How?",
        options: ["Fully undressed", "Without undressing", "Only if the doctor asks", "On the caregiver's lap"],
        correct: 1,
        because: "Children up to 18 months are weighed without undressing.",
      },
      {
        question: "The child is booked for a specialist. Where do you send the EMR page?",
        options: ["To any doctor on duty", "To the billing officer", "To the named specialist", "To customer care"],
        correct: 2,
        because: "For a specialist consult the page is forwarded to the name of the specialist.",
      },
      {
        question: "The doctor has ordered lab tests. What happens next?",
        options: [
          "You collect the sample in the Nurses' Nook",
          "Tell the health attendant and direct the patient to the brave room",
          "Send the family home to return for results",
          "Ask the billing officer to collect it",
        ],
        correct: 1,
        because: "The health attendant is informed and the patient goes to the brave room for sample collection.",
      },
      {
        question: "When is the couch roll changed?",
        options: ["Once a day", "When it looks dirty", "After each use", "At handover"],
        correct: 2,
        because: "Couch roll is laid over the bedsheet and discarded after each use.",
      },
    ],
  },
  {
    // Thin or questionable for the approver: "opened vaccines can only be used
    // within 28 days" is applied to all vaccines, and diluents are stored
    // outside the fridge. Both vary by vaccine; see the report.
    code: "SOP-NUR-02",
    domain: "SOP: Nursing",
    title: "Running the vaccination clinic and keeping the cold chain",
    summary: "Preparing, giving and recording a vaccine safely, and how vaccines are stored and ordered.",
    roles: NURSING_ROLES,
    departments: NURSING_DEPTS,
    method: M,
    frequency: F,
    source: NURSES,
    body: `BEFORE THE CLINIC
1. Immunisation clinic runs on Wednesdays and Fridays, 9am to 3pm. The monthly appointment list is printed: go through it before the clinic and tick each name once seen.
2. Vaccines for booked patients are procured 2 days before the appointment. Nurses make vaccine requisitions on Mondays and Fridays. Confirm vaccines are available before appointment days.
3. HMO patients: contact them 3 days before the appointment to check eligibility, and always confirm eligibility with the billing department before proceeding. HMO patients are free to see a medical officer when they come for immunisation.
4. When a family calls in for a vaccine, put them on hold, confirm the vaccine is available and that there is a spare not already booked, then reply. Notify the nurses' group chat and the billing department for HMO patients.
5. Set up the room as for any clinic: clean linen, mackintosh, couch roll, consumables, working equipment.

GIVING THE VACCINE
1. Check vitals including OFC, height and weight, and record them on the vaccine card. Switch off the AC while undressing a baby.
2. Take the vaccine card and confirm which vaccines have been received. Catch-up schedules and new patients are run by the medical officer.
3. Prepare the vaccine in the vaccine cooler with at least 2 ice packs. Check the VVM indicator and the expiry date, and double-check with the pharmacist. Never carry vaccines by hand or in a kidney dish.
4. In the treatment room, explain the vaccines, possible side effects, dose, site and route, and what to do if a reaction occurs.
5. Assess the child's general condition before giving it.
6. Always have a witness to double-check during administration.
7. Read the leaflet or vial: the dose can differ from brand to brand.
8. Never prefill syringes. Prepare the vaccine in front of the family.
9. Get consent from the caregiver and confirm they are willing to hold the child. Call for help if needed.
10. Perform hand hygiene and keep the vaccines in the cooler.
11. Expose the whole limb, swab the skin with cotton wool and sterile water for injection, and give it in one quick action.
12. Drop the needle straight into the sharps box beside you.
13. Place a dry clean swab on the site. Do not rub or massage. Apply a boil plaster.
14. Soothe the child, reassure the caregiver, and ask them to wait in the play area.

AFTERWARDS
1. Record on the EMR and the vaccine card: vaccine name, lot or batch number, dose, site, route, expiry date and next appointment date.
2. Return the card and explain what was written and when to come back.
3. Direct the caregiver to billing.
4. Do not tell caregivers to give paracetamol 30 minutes before or after the vaccine. Advise them to give it only if the temperature goes above 37.5 degrees C.

STORAGE IN THE FRIDGE
1. Vials and prefilled vaccines are stored separately. Prefilled vaccines go in the transparent pack; overflow stays in the fridge.
2. Local government vaccines (vials) are kept in the black bowl.
3. Powdered vaccines and liquid vaccines go in separate ziplock bags. Opened vaccines go in their own ziplock.
4. Diluents are kept outside the fridge in a bowl.
5. Opened vaccines can only be used within 28 days, so careful separation is what stops an expired vaccine reaching a child.
6. Read the local government vaccine guidelines.`,
    questions: [
      {
        question: "Why does the SOP forbid prefilling vaccine syringes?",
        options: [
          "It wastes vaccine",
          "To prevent errors: the vaccine is prepared in front of the family",
          "Prefilled syringes are hard to bill",
          "The cooler is too small",
        ],
        correct: 1,
        because: "Prefilling is banned to prevent error; the vaccine is always prepared in front of the patient.",
      },
      {
        question: "How must a vaccine travel from the fridge to the treatment room?",
        options: ["In a kidney dish", "In your hand, quickly", "In the vaccine cooler with at least 2 ice packs", "In a ziplock bag"],
        correct: 2,
        because: "Vaccines must stay in the cold chain: the cooler with at least 2 ice packs, never by hand or kidney dish.",
      },
      {
        question: "After the injection, what do you do to the site?",
        options: ["Rub it to spread the vaccine", "Massage gently", "Dry clean swab, no rubbing, then a boil plaster", "Leave it uncovered"],
        correct: 2,
        because: "Place a dry clean swab, do not rub or massage, then apply a boil plaster.",
      },
      {
        question: "A caregiver asks if they should give paracetamol before the jab. What does the SOP say?",
        options: [
          "Yes, 30 minutes before",
          "No; give it only if the temperature goes above 37.5 degrees C",
          "Yes, straight after",
          "Only on the doctor's prescription before",
        ],
        correct: 1,
        because: "Do not advise paracetamol 30 minutes before or after; advise it when the temperature exceeds 37.5 degrees C.",
      },
      {
        question: "An HMO patient is booked for Friday. When should they be contacted to check eligibility?",
        options: ["On the day", "3 days before the appointment", "The week after", "Only if they ask"],
        correct: 1,
        because: "HMO patients are contacted 3 days before their appointment so eligibility can be checked.",
      },
      {
        question: "What must you record on the EMR and vaccine card for every vaccine given?",
        options: [
          "Name and dose only",
          "Name, batch number, dose, site, route, expiry date and next appointment",
          "Only the next appointment",
          "The price",
        ],
        correct: 1,
        because: "The SOP lists vaccine name, lot or batch number, dose, site, route, expiry date and next appointment date.",
      },
    ],
  },
  {
    // Contradiction for the approver: visiting hours are 9am to 9pm in the
    // admission note but 4pm to 7pm in the inpatient note and in "Others".
    // The body states 4pm to 7pm (said twice) and the question avoids it.
    code: "SOP-NUR-03",
    domain: "SOP: Nursing",
    title: "Admitting a child to the ward",
    summary: "Clearing, preparing the room, settling the family and documenting an admission.",
    roles: NURSING_ROLES,
    departments: NURSING_DEPTS,
    method: M,
    frequency: F,
    source: NURSES,
    body: `BEFORE THE CHILD GOES UP
1. Confirm the patient has been cleared by the billing team, HMO or private.
2. HMO patients go to the ward on the second floor. Private patients go to the ward on the first floor.
3. Every patient to be admitted must sign the admission form before being taken to the ward.
4. Ask the health attendant to prepare the bed, switch on the AC and TV, set up a baby cot if needed, and anything else required. For a patient using the general ward, the attendant removes the bed next to the patient from the bed frame and keeps it in the call room.
5. Inspect the room, toilet and cupboards for cleanliness and check all equipment works. Escalate any fault to the facility personnel.
6. Make sure there is a drip stand, infusion pump, fluid giving set, IV fluid and any other consumables needed.

SETTLING THE FAMILY
1. Collect the patient from reception or the doctor's office and take them to the room. Ask the health attendant to help with heavy luggage.
2. Make sure the luggage is kept in the cupboard.
3. Make the child comfortable in a warm environment.
4. Ask the child to change into the hospital gown and attach their name tag to the wrist.
5. Check vital signs and document them.
6. Admit on the EMR using the admission form and room checklist, then fill in the spreadsheet and the local government booklet.
7. Begin drug and fluid administration and document all findings.

RULES TO EXPLAIN AT ADMISSION
1. One caregiver per patient. No other caregiver stays, except siblings who are on admission at the same time, and it is still one caregiver to one patient.
2. Tell the family the visiting time at the point of admission: 4pm to 7pm, with no more than 2 visitors in the room at a time.
3. For patients under 6 months it is preferable to set up a cot on the bed.
4. When the doctor directs, the nurse takes over feeding for patients under 6 months for the whole admission.`,
    questions: [
      {
        question: "Before a child is taken to the ward, what must be done?",
        options: [
          "Billing clearance and the admission form signed",
          "The doctor's discharge note",
          "A lab result",
          "A visitor's pass",
        ],
        correct: 0,
        because: "The SOP requires billing clearance and a signed admission form before going to the ward.",
      },
      {
        question: "Where does an HMO patient go?",
        options: ["First floor ward", "Second floor ward", "Emergency room", "NICU"],
        correct: 1,
        because: "HMO patients go to the second floor ward; private patients to the first floor.",
      },
      {
        question: "A mother and grandmother both want to stay overnight with one child. What is the rule?",
        options: ["Both may stay", "One caregiver only", "Neither may stay", "Up to the nurse on duty"],
        correct: 1,
        because: "Only one caregiver per patient is allowed during admission.",
      },
      {
        question: "You find the infusion pump in the room is faulty. What do you do?",
        options: ["Use it anyway", "Escalate to the facility personnel", "Tell the family to buy one", "Note it at handover only"],
        correct: 1,
        because: "If equipment malfunctions, escalate to the facility personnel.",
      },
      {
        question: "Where is a new admission recorded besides the EMR?",
        options: ["Nowhere else", "The spreadsheet and the local government booklet", "The pharmacy register", "The visitors' book"],
        correct: 1,
        because: "After the EMR, fill in the spreadsheet and the local government booklet.",
      },
    ],
  },
  {
    code: "SOP-NUR-04",
    domain: "SOP: Nursing",
    title: "Caring for inpatients and handing over",
    summary: "Taking over at 8am, the observation and medication times, drug charts, records and handing over.",
    roles: NURSING_ROLES,
    departments: NURSING_DEPTS,
    method: M,
    frequency: F,
    source: NURSES,
    body: `TAKING OVER
1. Handover and takeover happen at 8am every morning.
2. On resumption, go through the nurses' reports, billing sheets, fluid, medication (dose, time, duration, route, frequency) and vital charts, and the doctor's documentation.
3. After a thorough check, the outgoing nurse hands the patient over to you. Observe the patient's condition while taking over.
4. Take over an updated spreadsheet. If records are not updated because of a poor handover, the nurses who took over the next shift are responsible for updating them.

DURING THE SHIFT
1. Draft a chart for medications, vitals and other relevant information. A drug chart is mandatory for every patient on admission, even if there is only one medication or none at the moment. All patients' drug charts are drafted together on one paper, not separately.
2. Know the total number of doses each patient has received since admission, especially antibiotics.
3. Monitor all patients closely, and evaluate the patient at every encounter.
4. Patients under 2 years: IV fluids go through a burette infusion set.
5. Scan the bar code for tests or procedures during admission.
6. Vitals at 6am, 10am, 2pm, 6pm and 10pm.
7. Medications at their due times, preferably adjusted to 6am, 10am, 2pm, 6pm and 10pm to protect sleep and rest.
8. Help the patient with daily living, including bathing and feeding.
9. Be present for ward rounds and carry out the changes made on the round.
10. The nurse sleeping in the emergency room moves to the call room at 6am.

BEFORE YOU LEAVE
1. Document everything done during the shift, including charts and reports.
2. Fill the spreadsheets before the end of the shift: inpatient, outpatient, immunisation, readmission and staff vaccine.
3. Hand over properly. Nursing is continuous: anything not carried out is handed over.`,
    questions: [
      {
        question: "A patient on admission is on no medication at the moment. Do they need a drug chart?",
        options: ["No", "Yes, every patient on admission needs one", "Only if the doctor asks", "Only for antibiotics"],
        correct: 1,
        because: "The SOP says a drug chart is mandatory for every patient on admission, with no exceptions.",
      },
      {
        question: "What are the routine vitals times on the ward?",
        options: ["Every 2 hours", "6am, 10am, 2pm, 6pm and 10pm", "Morning and evening", "At each ward round"],
        correct: 1,
        because: "Vitals are done at 6am, 10am, 2pm, 6pm and 10pm.",
      },
      {
        question: "How are IV fluids given to a child under 2?",
        options: ["Free flow", "Through a burette infusion set", "By syringe only", "Through the feeding tube"],
        correct: 1,
        because: "For patients under 2 years, fluid administration is through a burette infusion set.",
      },
      {
        question: "The spreadsheet was not updated at handover. Who updates it?",
        options: ["The outgoing nurse, next week", "The nurses who took over the next shift", "The billing officer", "Nobody"],
        correct: 1,
        because: "If records are not updated because of improper handover, the nurses who took over are responsible.",
      },
      {
        question: "A dressing change was not done on your shift. What do you do?",
        options: ["Leave it", "Hand it over", "Record it as done", "Ask the family to do it"],
        correct: 1,
        because: "Nursing is continuous: every activity not carried out is handed over.",
      },
    ],
  },
  {
    // For the approver: the fixed rule "double check any dose above 100mg" and
    // the fixed diluent volumes (ceftriaxone in 100ml, paracetamol and
    // diazepam in 50ml) are not weight based. See the report.
    code: "SOP-NUR-05",
    domain: "SOP: Nursing",
    title: "Giving medicines safely",
    summary: "Prescriptions, the rights of medication administration, double checks, timing, refusals and errors.",
    roles: NURSING_ROLES,
    departments: NURSING_DEPTS,
    method: M,
    frequency: F,
    source: NURSES,
    body: `THE PRESCRIPTION
1. Every medication, including IV fluids, needs a doctor's prescription on the EMR stating the medication, dose, duration, frequency, route and any other instructions.
2. Double-check the dose and calculation with another healthcare professional before giving it.
3. For a dose above 100mg, double-check with the prescriber or any doctor on call.
4. Know the medicine you are giving: why it is given, what it does, its expected side effects, its timing and any other instructions.

AT THE BEDSIDE
1. Identify the patient accurately, introduce yourself, get consent from the guardian, and tell them about the medication.
2. Confirm the patient's allergies before giving anything.
3. Wear PPE where there is potential exposure to blood and body fluids.
4. Apply the rights of medication administration: right patient, right medication, right indication, right route, right dose, right time and frequency.
5. Give medications within 30 minutes either side of the scheduled time. Where possible, schedule medications between 6am and 12am.
6. IV route: ceftriaxone is given in 100ml of normal saline. Paracetamol and diazepam are given in an infusion of 50ml normal saline or highly diluted.
7. Dispose of needles, lancets, sharps and vials in the sharps box.

AFTERWARDS
1. Document every medication on the EMR with the route, dose and witness.
2. A patient has the right to refuse. If they do, document it and tell the doctor on call.
3. A medication error: tell the doctor on call and document it on the incident reporting form.
4. Any medication opened, whole vial or ampoule or not, is billed at the end of your shift.
5. Do not store leftover opened paracetamol or diclofenac suppositories in the pharmacy.`,
    questions: [
      {
        question: "What must you confirm before giving any medication?",
        options: ["The price", "The patient's allergies", "The next appointment", "The ward round time"],
        correct: 1,
        because: "Before administering any medication, confirm the patient's allergy status.",
      },
      {
        question: "A dose is due at 10am. What is the latest acceptable time to give it?",
        options: ["10:30am", "11am", "12 noon", "Any time before the next dose"],
        correct: 0,
        because: "Administration should not be more than 30 minutes before or after the scheduled time.",
      },
      {
        question: "A caregiver refuses a medication for their child. What do you do?",
        options: [
          "Give it anyway",
          "Document the refusal and inform the doctor on call",
          "Hide it in the feed",
          "Wait until the caregiver is asleep",
        ],
        correct: 1,
        because: "Patients have the right to refuse; document it and inform the doctor on call.",
      },
      {
        question: "You realise you gave a wrong dose. What does the SOP require?",
        options: [
          "Correct it on the chart quietly",
          "Inform the doctor on call and complete an incident reporting form",
          "Tell only the next shift",
          "Wait to see if there is a reaction",
        ],
        correct: 1,
        because: "For medication errors, inform the doctor on call and document on the incident reporting form.",
      },
      {
        question: "You opened an ampoule but used half. What happens to the billing?",
        options: ["Bill half", "Bill it at the end of your shift", "Do not bill", "Bill the next patient"],
        correct: 1,
        because: "Any medication opened, whether the whole vial or ampoule is used or not, is billed at the end of the shift.",
      },
    ],
  },
  {
    // For the approver: "cardiac position" for oxygen delivery, checking flow
    // by palm and ear, and SpO2 "above 95%" for term neonates are as written in
    // the SOP. The oxygen section also appears twice in the source.
    code: "SOP-NUR-06",
    domain: "SOP: Nursing",
    title: "Giving oxygen",
    summary: "Concentrator first, setting up the cylinder and humidifier, fitting the mask or prongs, and monitoring.",
    roles: NURSING_ROLES,
    departments: NURSING_DEPTS,
    method: M,
    frequency: F,
    source: NURSES,
    body: `WHAT IT IS
Oxygen administration is giving oxygen at a higher concentration than in room air, to treat or prevent oxygen deficiency.

SETTING UP
1. Make sure there is a prescription or a clear reason for giving it.
2. Use an oxygen concentrator as the first line, not a cylinder.
3. Oxygen is given by mask or nasal prongs. Choose the right size.
4. When turning on a cylinder at the source, open the knob at the barest minimum. Check the gauge: a needle at or near the red zone means the cylinder is almost or completely empty.
5. The humidifier water (preferably distilled, which is free of minerals and stops build-up and bacterial growth) must be between the lower and upper levels.
6. Connect the mask or prongs firmly to the humidifier and turn the flowmeter knob.
7. Confirm oxygen is flowing by holding the end of the tube to your palm and ear.
8. Make sure there is no water in the tubing, because it reduces oxygen delivery.

FITTING AND MONITORING
1. Put the bed in the cardiac position.
2. Open the airway with a head tilt and chin lift.
3. Fit the mask or prongs carefully and set the flowmeter to the prescribed rate.
4. Document the time and the flow rate.
5. Monitor and document vitals closely. For term neonates and children the expected SpO2 is above 95%.
6. If strapping is needed, use white plaster only, and place cotton swabs at the front of the ear.
7. For an unconscious patient, make sure the tongue has not fallen back. Nurse in the recovery or left lateral position after administration.

EQUIPMENT CARE AND STOPPING
1. Masks and prongs are single patient use. Clean them daily with sterile water and discard after 3 days.
2. When oxygen is stopped, remove the mask or prongs carefully, turn off the flowmeter, then turn off the oxygen at the control valve.`,
    questions: [
      {
        question: "What is the first-line oxygen source on the ward?",
        options: ["The cylinder", "The concentrator", "Whichever is nearer", "The ambulance supply"],
        correct: 1,
        because: "The SOP says to use the oxygen concentrator as the first line of action, not the cylinder.",
      },
      {
        question: "The cylinder gauge needle is at the red zone. What does it mean?",
        options: ["It is full", "It is almost or completely empty", "The pressure is too high", "It needs a new humidifier"],
        correct: 1,
        because: "A needle close to or at the red zone means the cylinder is almost empty or empty.",
      },
      {
        question: "You see water collected in the oxygen tubing. Why does it matter?",
        options: ["It does not", "It reduces oxygen delivery", "It cools the oxygen", "It is needed for humidity"],
        correct: 1,
        because: "Water in the tube reduces oxygen delivery, so the tubing must be clear.",
      },
      {
        question: "How long can a set of prongs be used for one patient?",
        options: ["One use only, then discard", "Cleaned daily and discarded after 3 days", "A week", "Until the patient is discharged"],
        correct: 1,
        because: "Prongs or masks are cleaned daily with sterile water and discarded after 3 days.",
      },
      {
        question: "Oxygen has been discontinued. In what order do you switch off?",
        options: [
          "Control valve, then flowmeter",
          "Remove prongs, flowmeter off, then control valve off",
          "Leave the flowmeter running",
          "Disconnect the humidifier first",
        ],
        correct: 1,
        because: "Remove the prongs or mask carefully, turn off the flowmeter, then turn off oxygen at the control valve.",
      },
    ],
  },
  {
    // For the approver: the SOP says "potency" of the venepuncture site; this
    // is surely patency, and the body uses "patency". Wording only.
    code: "SOP-NUR-07",
    domain: "SOP: Nursing",
    title: "IV fluids on the ward and in the NICU",
    summary: "Checking, setting up and running IV fluids, and the differences for neonates.",
    roles: NURSING_ROLES,
    departments: NURSING_DEPTS,
    method: M,
    frequency: F,
    source: NURSES,
    body: `ON THE WARD
1. Check the prescription for the fluid to be given.
2. Tell the patient or guardian and get consent.
3. Keep asepsis: wash or sanitise your hands and wear gloves.
4. Confirm the venepuncture site is patent by flushing with sterile water, and check the site for tenderness, swelling or discolouration.
5. Have the supplies ready: drip set, syringes, infusion pump (charged or plugged in), drip stand and the right fluid.
6. Double-check the fluid and its expiry date.
7. Wash hands, set up the fluid and connect the giving set to the IV line.
8. Set the drip rate and run the fluid.
9. Keep the fluid intake and output chart.
10. Document.
11. Children under 2: fluids run through a burette infusion set.

IN THE NICU
The same steps, with these differences:
1. Consent comes from the guardian, because the patient is a neonate.
2. Use a micro-drip set and the appropriate neonatal fluid.
3. Prime all air out of the line when connecting.
4. Set the rate on the infusion pump.
5. Keep the intake and output charts strictly, and document in the nursing notes.`,
    questions: [
      {
        question: "Before connecting a drip, how do you check the cannula site?",
        options: [
          "Look at it only",
          "Flush with sterile water and check for tenderness, swelling or discolouration",
          "Ask the caregiver",
          "Start the fluid and watch",
        ],
        correct: 1,
        because: "Confirm the site by flushing with sterile water and assessing for tenderness, swelling or discolouration.",
      },
      {
        question: "What giving set is used in the NICU?",
        options: ["A standard drip set", "A micro-drip set", "A blood giving set", "Any available set"],
        correct: 1,
        because: "The NICU procedure uses a micro-drip set and an infusion pump.",
      },
      {
        question: "What must be checked on the fluid bag before it is hung?",
        options: ["The fluid and its expiry date", "Only the colour", "The price", "Nothing if it came from pharmacy"],
        correct: 0,
        because: "Double-check the fluid and its expiry date.",
      },
      {
        question: "What extra step does the NICU procedure stress when connecting the line?",
        options: ["Warming the fluid", "Priming all air out of the line", "Using a larger cannula", "Giving it free flow"],
        correct: 1,
        because: "In the NICU the giving set is connected ensuring all air is primed out of the line.",
      },
    ],
  },
  {
    // Contradiction for the approver: the section sets out how to run a
    // transfusion, then ends "Nurses should not administer blood
    // transfusions". It also asks for consent "from the doctor or laboratory
    // scientist", and says to thaw whole blood for up to 30 minutes. The body
    // keeps the monitoring and safety steps and states the rule as written.
    // The questions avoid the contradictory parts.
    code: "SOP-NUR-08",
    domain: "SOP: Nursing",
    title: "Blood transfusion: checks and monitoring",
    summary: "The identity check with a witness, baseline and transfusion observations, and what to do if a reaction starts.",
    roles: NURSING_ROLES,
    departments: NURSING_DEPTS,
    method: M,
    frequency: F,
    source: NURSES,
    body: `WHAT IT IS
A blood transfusion delivers donated blood, or a blood component, into a patient's vein.

BEFORE IT STARTS
1. There must be a valid transfusion order on the EMR stating the blood product, volume, infusion rate, and what to do if there is a reaction.
2. Informed consent is obtained and documented.
3. When the blood is collected from the lab, check every detail on the consent form, request order and release form (name, age, gender, blood number, blood group, Rh factor, screening, expiry date) against the crossmatch release form, with a second qualified healthcare professional as witness.
4. Inspect the bag for contamination: abnormal colour, clots or leaks.
5. Record the time the bag was collected. Carry it in a kidney dish.
6. Wear appropriate PPE throughout.
7. Record baseline vitals: temperature, pulse, respirations, oxygen saturation and blood pressure.
8. The doctor checks the bag details against the crossmatch release form.

DURING THE TRANSFUSION
1. Watch the patient continuously for the first 15 minutes, starting at a slow rate, for an acute reaction.
2. Record vitals on the transfusion vitals chart: every 5 minutes for the first 15 minutes, every 15 minutes for the first hour, then every 30 minutes, at least 10 times in all. Label each set pre, intra or post transfusion.
3. Watch the IV site for infiltration or inflammation during and after.
4. Never transfuse blood with an infusion pump.

IF A REACTION IS SUSPECTED
Fever, chills or breathing difficulty: stop the infusion immediately and call the doctor on call.

AFTERWARDS
1. Document the start and end times, total volume, unit number and the patient's response on the EMR.
2. Dispose of used bags and sets as biohazard waste.

NOTE AS WRITTEN IN THE SOP
Nurses should not administer blood transfusions. Your role is the checks and the monitoring above.`,
    questions: [
      {
        question: "Ten minutes into a transfusion the child develops chills and a fever. What do you do first?",
        options: [
          "Slow it down and recheck in an hour",
          "Stop the infusion immediately and notify the doctor on call",
          "Give paracetamol and continue",
          "Finish the unit quickly",
        ],
        correct: 1,
        because: "For a suspected transfusion reaction, stop the infusion immediately and notify the physician on call.",
      },
      {
        question: "Who checks the blood bag details against the release form with you?",
        options: ["The caregiver", "A second qualified healthcare professional as witness", "The health attendant", "Nobody"],
        correct: 1,
        because: "The details are matched against the crossmatch release form with a second qualified professional as witness.",
      },
      {
        question: "How often are vitals taken in the first 15 minutes?",
        options: ["Once", "Every 5 minutes", "Every 30 minutes", "Only at the end"],
        correct: 1,
        because: "Every 5 minutes for the first 15 minutes, then every 15 minutes for the first hour, then every 30 minutes.",
      },
      {
        question: "Can blood be run through an infusion pump?",
        options: ["Yes, always", "Only for neonates", "No, never", "Only if the doctor agrees"],
        correct: 2,
        because: "The SOP says do not transfuse blood with an infusion pump.",
      },
      {
        question: "What baseline observations are recorded before the transfusion starts?",
        options: [
          "Temperature only",
          "Temperature, pulse, respirations, oxygen saturation and blood pressure",
          "Weight and height",
          "None until it starts",
        ],
        correct: 1,
        because: "Baseline vitals are temperature, pulse, respiration, oxygen saturation and blood pressure.",
      },
    ],
  },
  {
    // For the approver: tube placement is confirmed "by aspirating gastric
    // contents or checking the pH". Aspirate pH is the usual test and aspirate
    // alone is not; worth stating which Haven requires.
    code: "SOP-NUR-09",
    domain: "SOP: Nursing",
    title: "Feeding a baby in the NICU",
    summary: "Checking the feed and the tube, keeping the incubator closed, feeding safely and positioning afterwards.",
    roles: ["Nursing"],
    departments: NURSING_DEPTS,
    method: M,
    frequency: F,
    source: NURSES,
    body: `BEFORE THE FEED
1. Check the prescription: feed type (expressed breast milk or formula), volume, route and frequency.
2. Tell the guardian and get consent.
3. Wash or sanitise your hands and wear gloves.
4. The baby must never touch your uniform during the procedure, to prevent cross-contamination.
5. Confirm the feeding tube (NGT or OGT) is in place by aspirating gastric contents or checking the pH.
6. Have the supplies ready: the prescribed milk, enteral syringes, feeding pump if continuous, bottle warmer.
7. Double-check the milk type, the baby's identity and the expiry date and time of the feed.
8. Warm the feed to room temperature (maximum 20 minutes) and prime the line or syringe so all air is out.

DURING THE FEED
1. Where possible, feed the baby out of the cot, held semi-upright.
2. If the baby must stay in the cot, open the incubator doors with great care to keep the temperature and environment stable.
3. Never pass feeding tubes or lines through the incubator vents. Always use the designated ports.
4. Give the feed at the prescribed rate (bolus by gravity or continuous) and watch for abdominal distension or breathing difficulty.

AFTER THE FEED
1. Keep the baby head-elevated or on the right side during and for 30 minutes after the feed, to prevent aspiration.
2. Make sure the baby has burped.
3. Keep strict intake and output charts, recording any residuals or vomiting.
4. Document the volume, how the baby tolerated it, the time it finished, and the feed type clearly: EBM or formula.`,
    questions: [
      {
        question: "How do you confirm the feeding tube is in the stomach?",
        options: [
          "Look at the tape",
          "Aspirate gastric contents or check the pH",
          "Ask the previous nurse",
          "Give a small feed and watch",
        ],
        correct: 1,
        because: "Placement is confirmed by aspirating gastric contents or checking the pH before the feed.",
      },
      {
        question: "Can a feeding line be passed through an incubator vent?",
        options: ["Yes, if it is quicker", "Never; use the designated ports", "Only at night", "Only for continuous feeds"],
        correct: 1,
        because: "Never use the incubator vents for tubes or lines; always use the designated ports.",
      },
      {
        question: "How should the baby be positioned after a feed, and for how long?",
        options: [
          "Flat on the back immediately",
          "Head-elevated or right side, for 30 minutes",
          "Prone for an hour",
          "Any position",
        ],
        correct: 1,
        because: "Head-elevated or right-lateral during and for 30 minutes after feeding to prevent aspiration.",
      },
      {
        question: "What is the maximum time for warming a feed?",
        options: ["5 minutes", "20 minutes", "1 hour", "No limit"],
        correct: 1,
        because: "Warm the feed to room temperature for a maximum of 20 minutes.",
      },
      {
        question: "Why must the baby not touch your uniform?",
        options: ["To keep it clean for the next shift", "To prevent cross-contamination", "Because it is cold", "It is not a rule"],
        correct: 1,
        because: "The SOP says the baby must not touch your uniform, to prevent cross-contamination.",
      },
    ],
  },
  {
    code: "SOP-NUR-10",
    domain: "SOP: Nursing",
    title: "Discharge, turning the room round, and the follow-up call",
    summary: "Discharging a child, getting the room ready again, and the next-day call to every family.",
    roles: NURSING_ROLES,
    departments: NURSING_DEPTS,
    method: M,
    frequency: F,
    source: NURSES,
    body: `DISCHARGE (after the consultant or medical officer discharges)
1. Tell the billing officer on duty, including anything not documented on the EMR.
2. Follow up with the medical officer on discharge medications.
3. Take discharge vitals.
4. Remove IV lines and other items.
5. Complete all documentation: discharge summary, billing sheets, Excel sheets and LG booklets.
6. Once billing has cleared, ask the health attendant to help with luggage and direct the guardian to pharmacy for medications.
7. Discard all leftover medications in the fridge and return other medications to pharmacy. No medication is left behind after discharge.
8. Check the room for forgotten items after the family leaves. Forgotten items go to customer care.

TURNING THE ROOM ROUND
Instruct and supervise the health attendant to:
1. Clean and disinfect the room and the equipment used, including bed frame, mattress, drip stand, bed lockers and frequently touched surfaces such as bed rails and IV stands.
2. Remove all used linen.
3. Dispose of clinical and non-clinical waste in the right bins, and sharps into the sharps container.
4. Clean with a cloth dipped in jik (hypo) and a disinfectant such as Dettol or Savlon in water.
5. Clean the bathroom and toilet thoroughly with disinfectant.
6. Spray the room with Lysol.
Then inspect the room yourself for readiness.

THE FOLLOW-UP CALL
1. Outpatients, immunised patients and discharged inpatients are all called the following day. Best time 8:30am to 10am, but calls can be made until 6pm. This is part of handover and is not optional.
2. Identify patients needing a 24 hour or 72 hour call, and read what care was given before calling.
3. Dial directly from the EMR and let it ring.
4. Greet and introduce yourself and the hospital, for example: "Good afternoon ma, my name is Nurse Peter from Haven Pediatric Practice."
5. State why you are calling and the patient's name. Ask about new complaints or concerns and whether medicines are being taken.
6. Tell them they can reach the hospital line with any concern. Thank them and close politely.
7. If you cannot get through, call back in 30 minutes, or send a text or email.
8. Document on the spreadsheet and tell the doctor if needed.
9. Make sure every outpatient, immunisation, admission and discharge is recorded on the spreadsheets and booklets.`,
    questions: [
      {
        question: "A discharged child's leftover medicines are in the fridge. What happens to them?",
        options: [
          "Left for the next patient",
          "Fridge leftovers discarded, other medications returned to pharmacy",
          "Given to the family to take home",
          "Kept in the nurses' station",
        ],
        correct: 1,
        because: "Discard leftover medications in the fridge and return other medications to pharmacy; none are left after discharge.",
      },
      {
        question: "When are discharged and outpatient families called?",
        options: ["Within a week", "The following day", "Only if they had a serious illness", "Never"],
        correct: 1,
        because: "Outpatients, immunised patients and discharged inpatients must be called the following day.",
      },
      {
        question: "The family does not answer the follow-up call. What next?",
        options: ["Mark it done", "Call back in 30 minutes or send a text or email", "Try next week", "Ask the doctor to call"],
        correct: 1,
        because: "If there is difficulty, call back in 30 minutes or send a text or email.",
      },
      {
        question: "A toy is left in the room after discharge. Where does it go?",
        options: ["The bin", "Customer care", "The nurses' station", "The next patient"],
        correct: 1,
        because: "All forgotten items are handed over to the customer care department.",
      },
      {
        question: "Who checks the room is ready after the attendant has cleaned it?",
        options: ["Nobody", "The nurse, by inspecting it", "The billing officer", "The next family"],
        correct: 1,
        because: "The nurse supervises the cleaning and inspects the room for readiness afterwards.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Health attendants
// ---------------------------------------------------------------------------

const ATTENDANT_ROLES = ["Attendant"];
const ATTENDANT_DEPTS = ["DOMESTIC"];

const HEALTH_ATTENDANTS: SopModule[] = [
  {
    code: "SOP-HA-01",
    domain: "SOP: Health attendants",
    title: "Clean rooms, clean instruments, and the cleaning week",
    summary: "What is cleaned when, from every-use wipes to the Sunday autoclave, and stocking the rooms.",
    roles: ATTENDANT_ROLES,
    departments: ATTENDANT_DEPTS,
    method: M,
    frequency: F,
    source: ATTENDANTS,
    body: `EVERY PATIENT, EVERY USE
1. Prepare all exam rooms and sterilise medical tools before and after each patient.
2. Disinfect tablets, keyboards and pens with disinfectant wipes after every use.

EVERY DAY
1. Make sure doctors' offices are stocked with face masks, gloves, alcohol swabs and spatulas.
2. Keep folded cotton swabs available in the drum at all times.

THE CLEANING WEEK
1. Deep clean the NICU and the emergency room every Monday, Wednesday and Saturday.
2. Refill every table-top and wall-mounted hand sanitiser every week: nurses' desk, emergency room, pharmacy, front desk, doctors' offices 1 and 2, brave room, private room, general ward and NICU.
3. Sundays: wash all hospital wares, including kidney dishes, ear speculums (the black plastic part of the otoscope) and gallipots.
4. Sunday evening: autoclave all washed instruments.
5. Fold cotton swabs for the drum, preferably on Sundays.

AFTER A DISCHARGE (as instructed and supervised by the nurse)
1. Remove all used linen and take the bedding off. Clean the bed thoroughly, with the drip stand and bed lockers.
2. Clean and disinfect the bed frame, mattress and frequently touched surfaces such as bed rails and IV stands.
3. Dispose of waste in the right bins and sharps into the sharps container.
4. Clean with a cloth dipped in jik (hypo) and a disinfectant such as Dettol or Savlon in water.
5. Clean the bathroom and toilet with disinfectant, and spray the room with Lysol.

REPORTING
Report any damaged equipment immediately to the facility manager.`,
    questions: [
      {
        question: "On which days are the NICU and emergency room deep cleaned?",
        options: ["Every day", "Monday, Wednesday and Saturday", "Sundays only", "When they look dirty"],
        correct: 1,
        because: "The SOP sets the NICU and emergency room deep clean for Monday, Wednesday and Saturday.",
      },
      {
        question: "When are washed instruments autoclaved?",
        options: ["Every morning", "Sunday evening", "After each patient", "Once a month"],
        correct: 1,
        because: "Autoclaving of all washed instruments is completed every Sunday evening.",
      },
      {
        question: "A nurse has used the ward tablet. What do you do?",
        options: ["Nothing", "Wipe it with a disinfectant wipe", "Wash it with water", "Leave it for the Sunday clean"],
        correct: 1,
        because: "Tablets, keyboards and pens are disinfected with disinfectant wipes after every use.",
      },
      {
        question: "How often are the hand sanitiser dispensers refilled?",
        options: ["Every week", "When empty", "Once a month", "Daily"],
        correct: 0,
        because: "All table-top and wall-mounted sanitiser dispensers are refilled every week.",
      },
      {
        question: "You notice a broken bed rail. Who do you tell?",
        options: ["Nobody", "The facility manager, immediately", "The next shift", "The family"],
        correct: 1,
        because: "Damaged equipment is reported immediately to the facility manager.",
      },
    ],
  },
  {
    code: "SOP-HA-02",
    domain: "SOP: Health attendants",
    title: "Linen, uniforms, patients' food, and supporting the clinical team",
    summary: "The linen cycle and log, daily bed changes, dress, food storage, samples and the oxygen cylinder.",
    roles: ATTENDANT_ROLES,
    departments: ATTENDANT_DEPTS,
    method: M,
    frequency: F,
    source: ATTENDANTS,
    body: `LINEN
1. Collect, sort, wash, dry, iron, fold and store all linen in the designated storage area.
2. Always fold linen after drying. Never hand over a pile of unwashed linen or unpressed uniforms, and never leave washed linen outside the wardrobe.
3. Log every wash cycle: the date, the number of items and the detergent used.
4. Report damaged linen immediately to the facility manager.

BEDS
1. Bed linen is changed daily, before 8am every morning. The same applies to the emergency room.
2. If a patient is admitted before 12am, a new bedsheet is laid.
3. If a patient pays for an extra bed, prepare it with a cover cloth and change its sheets daily.

YOUR OWN DRESS
1. Wear fresh, clean, wrinkle-free clinic scrubs every day, inside the hospital only.
2. Uniforms must be ironed and ready.
3. Display your ID card at all times so patients and our "tiny superheroes" can identify you.

PATIENTS' FOOD
Label patients' food with their name or initials before storing it in the fridge.

SUPPORTING THE CLINICAL TEAM
1. Take lab samples to the right department and assist doctors during sample collection.
2. Support nurses during procedures and help move medical equipment.

THE OXYGEN CYLINDER
When turning the cylinder on at the source, open the knob at the barest minimum. The pressure gauge should read almost 0 when opened.`,
    questions: [
      {
        question: "By what time must bed linen be changed each day?",
        options: ["8am", "12 noon", "6pm", "Whenever the family asks"],
        correct: 0,
        because: "Bed linen is changed daily before 8am, including the emergency room.",
      },
      {
        question: "What goes in the wash log?",
        options: ["Only the date", "Date, number of linens and detergent used", "Who soiled the linen", "Nothing; there is no log"],
        correct: 1,
        because: "Every wash cycle is logged with the date, number of linens and detergent used.",
      },
      {
        question: "A family brings food for their child. How is it stored?",
        options: ["On the bedside table", "In the fridge, labelled with the patient's name or initials", "In the pharmacy fridge", "It is not allowed"],
        correct: 1,
        because: "Patients' food is stored in the fridge after labelling it with the patient's name or abbreviation.",
      },
      {
        question: "May you wear your clinic scrubs to and from home?",
        options: ["Yes", "No, scrubs are for inside the hospital only", "Only on night shift", "If they are clean"],
        correct: 1,
        because: "Scrubs are worn daily within the hospital premises only.",
      },
      {
        question: "How far do you open the oxygen cylinder at the source?",
        options: ["Fully", "Halfway", "The barest minimum", "Until it hisses"],
        correct: 2,
        because: "Open it at the barest minimum; the gauge should be almost 0 when opened.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Pharmacy
// ---------------------------------------------------------------------------

const PHARMACY_ROLES = ["Pharmacy"];
const PHARMACY_DEPTS = ["PHARMACY"];

const PHARMACY_MODULES: SopModule[] = [
  {
    code: "SOP-PHA-01",
    domain: "SOP: Pharmacy",
    title: "Dispensing and counselling",
    summary: "Validating a paediatric prescription, dispensing for outpatients and the ward, counselling, records and downtime.",
    roles: PHARMACY_ROLES,
    departments: PHARMACY_DEPTS,
    method: M,
    frequency: F,
    source: PHARMACY,
    body: `WHO DOES WHAT
1. Pharmacist in charge: runs all pharmacy operations, supervises staff, ensures regulatory compliance and monitors quality.
2. Pharmacy technicians: verify prescriptions, dispense, manage inventory, keep records, receive and store medicines.

VALIDATING A PRESCRIPTION
1. Open the EMR with your own authorised login.
2. Verify the patient's identity.
3. Check the prescription is complete and appropriate: the medicine, and every calculation by mg/kg or mcg/kg against a standard paediatric reference such as the BNF; the strength, frequency, duration, route and prescriber.
4. Never exceed the maximum recommended dose.
5. Clarify anything unclear or wrong with the prescriber and resolve it before dispensing.
6. Label every medicine with precise directions for use.

INPATIENTS
1. Receive and validate orders from the ward.
2. Use unit dose dispensing.
3. Do ward checks and remove discontinued medication.
4. Keep the emergency tray stocked, with weekly stock and expiry checks.

COUNSELLING THE CAREGIVER
Explain how to use the medicine, the expected benefit, the route (demonstrate where needed, for example inhalers), the dosage form, storage, possible side effects and interactions, contraindications, what to do about a missed dose, common reactions, how to reconstitute antibiotics, and how to get refills. Respect their point of view, stress adherence, and follow up.

RECORDS
Keep the dispensing register: patient name, medicine, quantity, category (private or HMO), and any intervention or clarification made.

WHEN THE EMR IS DOWN
1. Use the authorised paper prescription form.
2. Record all dispensing by hand.
3. Enter everything into the EMR once it is back.
4. Reconcile the manual and electronic records.

CONTROLLED MEDICINES
Verify the authorisation, record the issue in the controlled drug register, get the patient's acknowledgement of receipt, and keep them securely stored and counted.`,
    questions: [
      {
        question: "A paediatric dose looks high. What do you check it against?",
        options: [
          "What was dispensed last time",
          "A mg/kg or mcg/kg calculation against a standard paediatric reference such as the BNF",
          "The adult dose",
          "The caregiver's memory",
        ],
        correct: 1,
        because: "Every calculation is verified by weight against a standard paediatric reference like the BNF.",
      },
      {
        question: "The prescription is unclear. When can you dispense?",
        options: [
          "Straight away, using your best judgement",
          "Only after clarifying with the prescriber and resolving it",
          "After the patient signs",
          "At the end of the day",
        ],
        correct: 1,
        because: "Unclear prescriptions or errors are clarified with the prescriber and resolved before dispensing.",
      },
      {
        question: "The EMR goes down mid-morning. What do you do?",
        options: [
          "Stop dispensing until it is back",
          "Use the paper prescription form, record by hand, enter and reconcile later",
          "Dispense and record nothing",
          "Send patients elsewhere",
        ],
        correct: 1,
        because: "During downtime use authorised paper forms, document manually, then enter and reconcile once restored.",
      },
      {
        question: "What must the dispensing register record?",
        options: [
          "Only the medicine",
          "Patient, medicine, quantity, private or HMO, and any intervention",
          "The price only",
          "The prescriber's phone number",
        ],
        correct: 1,
        because: "The register records the patient, medicine, quantity, category and any intervention or clarification.",
      },
      {
        question: "What system is used for ward medicines?",
        options: ["Bulk supply", "Unit dose dispensing", "Family brings their own", "Whatever is in stock"],
        correct: 1,
        because: "Inpatient dispensing uses a unit dose dispensing system.",
      },
    ],
  },
  {
    code: "SOP-PHA-02",
    domain: "SOP: Pharmacy",
    title: "Buying, receiving, storing and counting stock",
    summary: "Procurement, checking a delivery, storage temperatures and layout, FEFO, stock counts and expired drugs.",
    roles: PHARMACY_ROLES,
    departments: PHARMACY_DEPTS,
    method: M,
    frequency: F,
    source: PHARMACY,
    body: `PROCUREMENT
1. Identify the need from current stock, minimum levels, consumption, patient needs, seasonal demand and emergencies.
2. Prepare a requisition list and reconcile it with available funds.
3. Buy only from licensed, approved suppliers. Evaluate them on reliability, price, delivery time and quality.
4. Get approval from the head of pharmacy before ordering, issue an official purchase order, and keep copies of all purchase documents.
5. Procurement is weekly or monthly as applicable.

RECEIVING
1. Check the delivery against the purchase order: drug name, dosage form, quantity, batch number, expiry date and packaging.
2. Reject anything damaged, expired, wrongly supplied, counterfeit or suspected substandard.
3. Receive everything into the store and enter it on the bin cards and ledgers.
4. Issue from the store to the dispensary only on an authorised request.

STORAGE
1. Room temperature products 15 to 25 degrees C. Refrigerated products 2 to 8 degrees C.
2. Monitor and record storage temperatures regularly in the temperature log.
3. Clean, dry, secure, well ventilated and well lit, with access for authorised staff only.
4. Arrange by pharmacological class and alphabetically, labels visible.
5. Rotate stock first expiry, first out (FEFO), and flag anything expiring within 6 months.
6. Separate look-alike, sound-alike (LASA) medicines. Store high-alert medicines separately. Lock controlled medicines in a secure cabinet.
7. Protect from sunlight, heat, moisture and contamination, and keep drugs apart from non-medical items.

INVENTORY
Keep electronic stock records, monitor minimum and maximum levels, do a physical count and inventory audit every month, and reconcile any discrepancy.

EXPIRED DRUGS
Record them, separate them from usable stock, label them clearly as expired, work out their total cost, notify the head of pharmacy, and request timely disposal.`,
    questions: [
      {
        question: "What is the correct storage range for refrigerated products?",
        options: ["0 to 4 degrees C", "2 to 8 degrees C", "8 to 15 degrees C", "15 to 25 degrees C"],
        correct: 1,
        because: "Refrigerated products are kept at 2 to 8 degrees C; room temperature products at 15 to 25 degrees C.",
      },
      {
        question: "A delivery arrives with one carton short-dated and damaged. What do you do?",
        options: ["Accept it and sell it first", "Reject the damaged product", "Accept and tell nobody", "Move it to the ward"],
        correct: 1,
        because: "Reject any products that are damaged, expired, incorrectly supplied, counterfeit or suspected substandard.",
      },
      {
        question: "What does FEFO mean for how you pick stock?",
        options: ["First in, first out", "First expiry, first out", "Fastest moving first", "Cheapest first"],
        correct: 1,
        because: "Stock is rotated on the FEFO principle: first expiry, first out.",
      },
      {
        question: "Two medicines have very similar names. How are they stored?",
        options: ["Side by side", "Separated, as LASA medicines", "In the fridge", "In the controlled drug cabinet"],
        correct: 1,
        because: "Look-alike, sound-alike medicines are separated.",
      },
      {
        question: "Who approves an order before it is placed?",
        options: ["The supplier", "The head of pharmacy", "Any technician", "The billing officer"],
        correct: 1,
        because: "Approval is obtained from the head of pharmacy before placing the order.",
      },
    ],
  },
  {
    code: "SOP-PHA-03",
    domain: "SOP: Pharmacy",
    title: "Narcotics, recalls, compounding and the standard we keep",
    summary: "Narcotic supply and custody, how a recall runs, when we compound, dress code and quality checks.",
    roles: PHARMACY_ROLES,
    departments: PHARMACY_DEPTS,
    method: M,
    frequency: F,
    source: PHARMACY,
    body: `NARCOTICS AND POISONS
1. Identify the hospital's narcotic needs.
2. Requisition from Federal Medical Stores, Oshodi, authorised by the State Director of Pharmaceutical Services.
3. Pay, receive, and document every step.
4. Monitor usage and entries strictly at all times.
5. Keep the narcotics and poisons register under lock and key at all times.
6. Hand all unused, damaged or expired narcotics to the Central Medical Stores for recording and disposal.

DRUG RECALLS
A recall starts for wrong labelling, wrong formulation, unfavourable stability results, an alert from a manufacturer or NAFDAC, or an unexpected or undesired effect seen in use.
1. Stop using the drug immediately.
2. Notify the MD/CEO and management.
3. Withdraw every available batch from the pharmacy.
4. Record the name, quantity, dosage form, batch number, expiry date, cost and selling price, and the reason for withdrawal, in the inventory system.
5. Trace batches already dispensed to inpatients and outpatients through hospital numbers and contact details, and withdraw them.
6. Return all items to the supplier.
7. The pharmacist in charge reports the reaction or effect on the pharmacovigilance form to NAFDAC.

COMPOUNDING
Only when a physician requests it and no commercial product is available.
1. Use an adequate, clean space and clean equipment.
2. List the raw materials, equipment and packaging.
3. Calculate doses by weight (mg/kg), with duration and intervals.
4. Follow a written procedure for each preparation, based on an official method.
5. Check quality at every stage, assign an expiry date, label with precise directions, record in the daily compounding book, and counsel the caregiver.

DRESS CODE
Smart and uniform. Men: trousers, shirt and tie. Women: skirt and blouse, skirt suit, or trousers and blouse. A PCN-approved white long-sleeved overall with a name tag is mandatory for everybody.

QUALITY
Regular medication-use evaluation, audits of compliance with this SOP, monitoring of medication error trends, and a review of the SOP every 1 to 2 years or whenever regulations, standards or hospital policy change.`,
    questions: [
      {
        question: "NAFDAC issues an alert on a batch you stock. What is the first step?",
        options: [
          "Sell remaining stock quickly",
          "Stop using the drug immediately",
          "Wait for the supplier to call",
          "Move it to the store",
        ],
        correct: 1,
        because: "The first step in a recall is to stop using the drug immediately.",
      },
      {
        question: "Some of the recalled batch has already gone home with patients. What do you do?",
        options: [
          "Nothing, it is gone",
          "Trace them through hospital numbers and contact details and withdraw them",
          "Wait for them to return",
          "Tell them at their next visit",
        ],
        correct: 1,
        because: "Dispensed batches are traced using hospital numbers and contact data and withdrawn.",
      },
      {
        question: "When may the pharmacy compound a medicine?",
        options: [
          "Whenever it is cheaper",
          "Only on a physician's request when no commercial product is available",
          "When a caregiver asks",
          "To use up raw materials",
        ],
        correct: 1,
        because: "Compounding is only on physician request when the commercial product is unavailable.",
      },
      {
        question: "Where is the narcotics and poisons register kept?",
        options: ["On the counter", "Under lock and key at all times", "With the billing officer", "On the EMR only"],
        correct: 1,
        because: "The narcotic and poisons register is kept under lock and key at all times.",
      },
      {
        question: "What happens to expired narcotics?",
        options: [
          "Binned with general waste",
          "Handed to the Central Medical Stores for record and disposal",
          "Returned to the patient",
          "Kept in the cabinet",
        ],
        correct: 1,
        because: "Unused, damaged or expired narcotics are handed over to the Central Medical Stores for record and disposal.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Laboratory
// ---------------------------------------------------------------------------

const LAB_ROLES = ["Lab"];
const LAB_DEPTS = ["LAB"];

const LAB_MODULES: SopModule[] = [
  {
    // For the approver: the site list is the adult list (median cubital,
    // cephalic, basilic) with no paediatric volume limits. Heel sites for
    // under-ones are covered under capillary.
    code: "SOP-LAB-01",
    domain: "SOP: Laboratory",
    title: "Collecting a sample: identity, venepuncture, capillary, order of draw",
    summary: "Identifying the child, taking blood by vein or heel and finger prick, order of draw, labelling and rejection.",
    roles: LAB_ROLES,
    departments: LAB_DEPTS,
    method: M,
    frequency: F,
    source: LAB,
    body: `SAFETY
Treat all blood and body fluids as infectious. Wear a lab coat, gloves and a face mask where applicable. Hand hygiene before patient contact, before collection, after removing gloves and after patient contact. Never recap needles; drop sharps straight into an approved sharps container.

IDENTIFY THE PATIENT
Ask for the full name and check it against the request on the EMR, the hospital number and ID where applicable. Never use the ward room as a means of identification.

BEFORE COLLECTION
Confirm the test requested, any preparation, fasting status, relevant medicines and previous complications. Assess for difficult access, existing IV lines and bleeding disorders. Review the request, verify identity, explain the procedure, get verbal consent and assemble the equipment.

VENEPUNCTURE
1. Patient comfortable, seated or lying, arm fully supported.
2. Preferred veins: median cubital, cephalic, basilic. Avoid haematomas, scars, burns, swollen areas and any arm with a running drip.
3. Tourniquet 7 to 10 cm above the site, never on for more than 1 minute.
4. Clean with an alcohol swab in a circle from the centre outward, let it dry completely, and do not touch it again.
5. Anchor the vein, insert bevel up, fill tubes in the order of draw, release the tourniquet once blood flows, remove the last tube, place gauze, withdraw smoothly and press.
6. Apply a dressing and make sure bleeding has stopped before the patient leaves.

CAPILLARY (FINGER OR HEEL)
1. Thumb, middle or ring finger. For infants under 1 year use the heel, medial or lateral plantar surface. Never the centre or back curve of the heel (risk of bone injury), never an infant's finger, never a swollen, cold, blue, cut or previously used site.
2. Warm the site for 3 to 5 minutes if needed. Clean and let it dry.
3. Puncture with a sterile single-use lancet. Wipe away the first drop. Let a round drop form; do not milk the site, which causes haemolysis and tissue fluid contamination.
4. Collect in order of draw, mix additive tubes gently, press with a dry swab until bleeding stops, apply a boil plaster.

ORDER OF DRAW AND MIXING
1. Blood culture bottles
2. Sodium citrate (blue): 4 to 8 inversions
3. Serum (red or gold): no inversion
4. Heparin (green): 8 to 10 inversions
5. EDTA (purple): 8 to 10 inversions
6. Fluoride or oxalate (grey): 8 to 10 inversions
Never shake tubes.

LABELLING AND REJECTION
Label in front of the patient: name, investigation, date of collection. Unlabelled specimens are never accepted. Reject and document any sample that is unlabelled or mislabelled, leaking, grossly haemolysed, clotted when anticoagulated, in the wrong container or too small.

COMPLICATIONS
Haematoma: release the tourniquet, withdraw and press firmly. Fainting: stop, support the patient safely, call the clinician. Excessive bleeding: keep pressing and escalate to the clinician at once.`,
    questions: [
      {
        question: "Where do you take a capillary sample from a 6 month old?",
        options: ["The middle finger", "The medial or lateral heel", "The centre of the heel", "The thumb"],
        correct: 1,
        because: "For infants under 1 year the heel is used, medial or lateral, never the centre or back curve.",
      },
      {
        question: "Which tube is drawn first after blood cultures?",
        options: ["EDTA (purple)", "Sodium citrate (blue)", "Fluoride (grey)", "Heparin (green)"],
        correct: 1,
        because: "The order of draw is blood culture, then sodium citrate, then serum, heparin, EDTA, fluoride.",
      },
      {
        question: "How long can the tourniquet stay on?",
        options: ["30 seconds", "No more than 1 minute", "5 minutes", "Until the tubes are full"],
        correct: 1,
        because: "The tourniquet must not stay in place for more than one minute.",
      },
      {
        question: "Why wipe away the first drop of capillary blood?",
        options: ["It is too warm", "It may be contaminated with tissue fluid", "To save the lancet", "It is a habit"],
        correct: 1,
        because: "The first drop may be contaminated with tissue fluid.",
      },
      {
        question: "A tube arrives in the lab with no label. What happens?",
        options: ["Guess from the request form", "It is rejected and the reason documented", "Label it later", "Process it urgently"],
        correct: 1,
        because: "Unlabelled specimens are not accepted under any circumstances; rejection is documented.",
      },
      {
        question: "How do you confirm a patient's identity before collection?",
        options: [
          "By their bed or room number",
          "Ask them to state their full name and check against the EMR request and hospital number",
          "Ask the nurse",
          "By the request slip alone",
        ],
        correct: 1,
        because: "The patient states their full name, checked against the EMR request and hospital number; never use the ward room.",
      },
    ],
  },
  {
    // For the approver: storage temperatures in the source table are
    // unusual (EDTA and serum "2 to 18 degrees C for 7 days", urine and swabs
    // "20 degrees C", blood film "26 degrees C"). Reproduced as written; see
    // the report.
    code: "SOP-LAB-02",
    domain: "SOP: Laboratory",
    title: "Storing samples and sending tests out",
    summary: "Labelling, logging and storing samples, fridge monitoring, retention, and the external testing steps.",
    roles: LAB_ROLES,
    departments: LAB_DEPTS,
    method: M,
    frequency: F,
    source: LAB,
    body: `STORING SAMPLES
1. Every stored sample is labelled with the patient's full name, test type and date, and lab number, checked against the LIMS.
2. Log each sample in both the LIMS and the manual logbook.
3. Monitor fridges and freezers daily. Any deviation greater than 2 degrees C either way is recorded and reported to the quality team or chief scientist.
4. Keep disciplines apart: microbiology, haematology, chemistry and histology in separate racks or rack sections.
5. Do not overcrowd storage units; it causes temperature swings and lost samples.
6. Infectious samples go in labelled, sealed secondary containers.
7. Keep aliquots for critical, toxicology, legal or disputed results for up to 1 year where necessary.
8. Every discarded transfusion sample is recorded in the disposal log. Follow the biohazard waste protocol, and keep patient confidentiality throughout disposal.

RETENTION, AS SET IN THE SOP
Whole blood (EDTA) 7 days. Serum 7 days, freeze if analysis is delayed more than 72 hours. Stool 1 day. CSF 7 days. Urine 1 day. Swabs 2 days. Tissue 2 years under histopathology protocols. Blood films 14 days in slide boxes wrapped in absorbent paper. Stool, urine, swabs and CSF are analysed immediately or urgently wherever possible.

SENDING A TEST OUT
1. The request must come from a clinician and be reviewed by the scientist on duty.
2. Confirm the test is not available in-house.
3. Register it on the EMR and the manual test register.
4. Before contacting the external lab, get billing office approval: HMO coverage confirmed, or the patient's agreement to pay out of pocket.
5. Contact the external lab to confirm the test, sample type and volume, turnaround time and cost. Keep that communication on WhatsApp as the record.
6. Collect the sample using the standard collection procedure and label it.
7. Complete the External Laboratory Sample Investigation Form in full.
8. Transport in a specimen bag, or triple packaging where required.
9. Follow up within the agreed turnaround time.
10. Upload the result to the patient's EMR file when it comes back.
The referral log records the patient, the external investigation, billing address, scientist on duty and the dispatch rider.`,
    questions: [
      {
        question: "The sample fridge reads 3 degrees above its set point. What do you do?",
        options: [
          "Nothing, it is close enough",
          "Record it and report to the quality team or chief scientist",
          "Move the samples to the pharmacy fridge",
          "Switch it off",
        ],
        correct: 1,
        because: "Any deviation exceeding 2 degrees C must be recorded and reported to the quality team or chief scientist.",
      },
      {
        question: "Before you call the external lab about a test, what must you have?",
        options: [
          "The result",
          "Billing office approval: HMO coverage or the patient's agreement to pay",
          "The dispatch rider",
          "A second sample",
        ],
        correct: 1,
        because: "Before contacting the external lab, billing office approval is obtained.",
      },
      {
        question: "Where is each stored sample logged?",
        options: ["Nowhere", "In the LIMS and the manual logbook", "Only in the fridge", "On WhatsApp"],
        correct: 1,
        because: "Each sample is logged into both the LIMS and the manual logbook.",
      },
      {
        question: "How are infectious samples stored?",
        options: ["Loose on the rack", "In clearly labelled, sealed secondary containers", "In the freezer only", "With chemistry samples"],
        correct: 1,
        because: "Infectious samples must be in clearly labelled, sealed secondary containers.",
      },
      {
        question: "The external result is back. What is the last step?",
        options: ["Phone the family", "Upload it to the patient's EMR file", "File it in a drawer", "Send it to billing"],
        correct: 1,
        because: "Upon receipt, the result is uploaded to the patient's file on the EMR.",
      },
    ],
  },
  {
    code: "SOP-LAB-03",
    domain: "SOP: Laboratory",
    title: "Verifying a donor blood unit before release",
    summary: "Finance clearance, inspecting the unit, PCV, grouping, the four rapid screens, the checklist and release.",
    roles: LAB_ROLES,
    departments: LAB_DEPTS,
    method: M,
    frequency: F,
    source: LAB,
    body: `WHY WE DO IT
Every donor unit from the Lagos State Blood Service or another accredited blood bank is verified in-house before release: PCV, ABO and RhD group, and rapid screens for HIV, HBsAg, HCV and syphilis. This is a final checkpoint in addition to, not instead of, the blood bank's screening.

BEFORE ANYTHING
1. Lab coat, gloves and eye protection. Treat everything as infectious. Spillage: start the spillage protocol.
2. The request carries the patient's full name, age and gender.
3. Finance or billing approval comes before any transfusion action, including calling the blood bank.
4. Patient sample: identity confirmed at the bedside; plain tube at least 2 mL and EDTA at least 2 mL, labelled in front of the patient. Reject unlabelled or mislabelled, clotted EDTA, haemolysed, or incomplete requests.

INSPECT THE UNIT
Before testing, confirm: LSBS screening number present and legible; donor group stated; not expired; bag intact; no clots, haemolysis, discolouration or turbidity; cold chain maintained; screening report attached. A unit that fails is not used: return it to the blood bank with a written discrepancy report.

TEST IT
1. PCV on the analyser from the pilot tube. Packed red cells at least 50%. Whole blood 35 to 47%. Outside range: do not release, document, reject, notify the supervisor and blood bank.
2. Group on a labelled tile with anti-A, anti-B and anti-D, a separate stick for each zone, read within 2 minutes. Agglutination is positive. If your group does not match the label, do not release: document, escalate to the chief scientist and call the blood bank.
3. All four rapid tests from the same pilot tube, read at exactly the time the kit states. Any reactive result rejects the unit regardless of the LSBS result. Isolate it, label it REACTIVE, DO NOT TRANSFUSE, ask for a replacement and tell the senior scientist. A reactive result takes precedence until investigated.

RELEASE
1. Every checklist item must be PASS and signed on the crossmatch and transfusion release form.
2. Complete the form in full (patient, hospital number, group, unit number, screening results, date, time, MLS name), record it in the blood release register, and attach the release form to the unit.
3. Issue in a validated cold transport container and get the collecting nurse or clinician to sign before handover.

REJECTING A UNIT
Label it QUARANTINED, store it apart, complete a non-conformance report, tell the senior scientist and the requesting clinician, send a written discrepancy report to the blood bank, and file everything.

EMERGENCY RELEASE
Only when life is threatened. The clinician authorises it in writing and accepts responsibility; O RhD negative is used wherever possible; justification and consent are documented; verification is still done afterwards and recorded.

QUALITY
Analyser QC passed and documented before any testing. A rapid test with an invalid control line is void: repeat with a new device. Antisera checked with known controls. Blood fridge 2 to 6 degrees C, logged twice daily. Surfaces cleaned with 10% bleach before and after. Report needlestick or splash at once. Non-conformances documented the same day, corrective action within 5 working days.`,
    questions: [
      {
        question: "Your HIV rapid test on a donor unit is reactive, but the LSBS label says screened negative. What do you do?",
        options: [
          "Release it; LSBS is the authority",
          "Reject it, isolate and label it, request a replacement and tell the senior scientist",
          "Repeat until it is negative",
          "Ask the clinician to decide",
        ],
        correct: 1,
        because: "A reactive result on any of the four screens rejects the unit regardless of the LSBS result.",
      },
      {
        question: "What must happen before the lab calls the blood bank for units?",
        options: ["Crossmatch", "Finance or billing approval", "The patient's discharge", "Nothing"],
        correct: 1,
        because: "Finance or billing approval is obtained before any transfusion-related action, including contacting the blood bank.",
      },
      {
        question: "A packed red cell unit has a PCV of 42%. What do you do?",
        options: ["Release it", "Do not release; document, reject and notify the supervisor and blood bank", "Release it with a note", "Retest tomorrow"],
        correct: 1,
        because: "Packed red cells must be at least 50%; outside range the unit is not released.",
      },
      {
        question: "The control line on a rapid test does not appear. What does that mean?",
        options: ["Non-reactive", "Reactive", "The test is void; repeat with a new device", "Read it later"],
        correct: 2,
        because: "An invalid internal control line renders the test void; repeat with a new device.",
      },
      {
        question: "In a life-threatening emergency, which blood is used for uncrossmatched release wherever possible?",
        options: ["AB positive", "O RhD negative", "Whatever is in the fridge", "The patient's own group untested"],
        correct: 1,
        because: "O RhD negative is used wherever possible for emergency uncrossmatched release, authorised in writing.",
      },
    ],
  },
  {
    // For the approver: the capillary dilution is "20 microlitres of blood
    // with 200 microlitres of diluent" and called 1:10; strictly that is 1:11.
    // Confirm against the Agile S20 manual.
    code: "SOP-LAB-04",
    domain: "SOP: Laboratory",
    title: "Full blood count on the analyser",
    summary: "Running an FBC on the Agile S20 in whole blood and pre-diluted modes, and the chemistry rule.",
    roles: LAB_ROLES,
    departments: LAB_DEPTS,
    method: M,
    frequency: F,
    source: LAB,
    body: `WHO DOES WHAT
1. Medical lab scientist: runs the FBC to this SOP and the manufacturer's instructions, checks samples are suitable, runs and documents QC, validates results, reports faults and non-conformances.
2. Lab assistant or technician: receives, labels, prepares and delivers specimens promptly, and reports specimen problems.
3. Head of laboratory: staff competency, compliance, QC review and corrective action.

BEFORE ANY PATIENT SAMPLE
Daily analyser QC must be within range and documented.

WHOLE BLOOD (VENOUS, EDTA)
1. Select Whole Blood Mode.
2. Select Next Sample and enter the patient details accurately. Confirm and press OK.
3. Mix the EDTA tube gently by inversion and place it under the probe.
4. Press the aspiration button and let it aspirate.
5. Review the results for flags or errors.
6. Print or save according to lab protocol.

CAPILLARY (PRE-DILUTED MODE)
1. Select Pre-diluted Mode, select Diluent and follow the screen.
2. Mix 20 microlitres of capillary blood with 200 microlitres of analyser diluent in a clean Eppendorf tube, and mix gently by inversion.
3. Select Next Sample, enter and confirm the patient details.
4. Place the diluted sample under the probe and press aspirate.
5. Review flags or errors, then print or save.

CHEMISTRY
Every chemistry test follows the reagent manufacturer's instructions for use. Any deviation is documented, justified, authorised where applicable, and validated before it is used.`,
    questions: [
      {
        question: "What must be done before the first patient FBC of the day?",
        options: ["Nothing", "Daily analyser QC, within range and documented", "Clean the probe only", "Run the capillary mode once"],
        correct: 1,
        because: "Analyser daily QC must be within range and documented before any patient or donor sample.",
      },
      {
        question: "A heel prick sample comes in for FBC. Which mode do you use?",
        options: ["Whole Blood Mode", "Pre-diluted Mode", "Either", "Chemistry mode"],
        correct: 1,
        because: "Capillary blood is run in pre-diluted mode after mixing with analyser diluent.",
      },
      {
        question: "The analyser shows a flag on a result. What do you do?",
        options: ["Ignore it", "Review flags or errors before printing or saving", "Delete the result", "Release it to the doctor"],
        correct: 1,
        because: "Results are reviewed for flags or errors before they are printed or saved.",
      },
      {
        question: "You want to change a chemistry method from the reagent instructions. What does the SOP require?",
        options: [
          "Just do it",
          "Document, justify, authorise where applicable and validate before use",
          "Ask a colleague",
          "Change it and note it later",
        ],
        correct: 1,
        because: "Any deviation is documented, justified, authorised where applicable, and validated before implementation.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Customer service
// ---------------------------------------------------------------------------

const FRONT_ROLES = ["Customer Service", "Billing Officer"];
const FRONT_DEPTS = ["ADMIN"];

const CUSTOMER_SERVICE: SopModule[] = [
  {
    // The SOP states the first consultation fee as N35,000. The body leaves the
    // amount out so the module does not go stale when the tariff is repriced.
    code: "SOP-CS-01",
    domain: "SOP: Customer service",
    title: "Welcoming, registering and booking families",
    summary: "Greeting, registering a new or returning child, appointments, reminders, phone and WhatsApp standards.",
    roles: FRONT_ROLES,
    departments: FRONT_DEPTS,
    method: M,
    frequency: F,
    source: CS,
    body: `WHAT THIS IS FOR
Every family that walks into Haven should feel seen, supported and handled with professional care. Customer service here is about trust, empathy and respect, not only efficiency.

CONDUCT AND APPEARANCE
1. Greet parents and guardians with the right title: "Good morning, Ma" or "Sir".
2. Smile and greet the child directly. A small wave or a friendly hello reduces their anxiety.
3. Clean, decent or professional clothing, with a visible name tag.

NEW PATIENTS
1. Welcome and register within 70 seconds. We do not keep families standing longer than that.
2. Ask for a valid enrollee ID number for HMO patients.
3. Enter the child's date of birth and details accurately on the EMR.
4. Show them where the restroom and play area are.
5. Explain that the first consultation fee covers 14 days: within that time further consultation and follow-up for the same concern is free, but tests and medicines are paid for.

RETURNING PATIENTS
1. Confirm their contact details and HMO status have not changed.
2. Tell the nursing station as soon as the patient arrives.

APPOINTMENTS
1. Bookings are recorded in the appointment book once the date and time are agreed with the specialist, and the family is told by WhatsApp.
2. Send a WhatsApp or SMS reminder 24 hours before. For example: "Hello [parent], this is a gentle reminder of [child]'s check-up tomorrow at 10:00am with [specialist]. We look forward to seeing you!"
3. A family more than 20 minutes late is told politely they may be seen after the next patient.

THE PHONE
1. Answer within three rings: "Good [morning], Haven Pediatric Practice, this is [your name], how may I help you and your little one today?"
2. A panicked parent (for example "my baby is convulsing"): never put them on hold. Put the call straight through to the lead nurse or doctor on duty.

WHATSAPP
1. Reply within 30 minutes during business hours.
2. No emojis. Do not be over-familiar.
3. Always close every conversation and enquiry.

HMO CODES
Request the authorisation code from the HMO manager or admin as soon as the doctor prescribes. Do not wait for the parent to ask.`,
    questions: [
      {
        question: "A parent calls saying their baby is convulsing. What do you do?",
        options: [
          "Take their details and call back",
          "Put them through straight away to the lead nurse or doctor on duty, no hold",
          "Tell them to come in",
          "Put them on hold while you find someone",
        ],
        correct: 1,
        because: "Never put a panicked parent on hold; patch the call immediately to the lead nurse or doctor on duty.",
      },
      {
        question: "How quickly should a new family be welcomed and registered?",
        options: ["Within 70 seconds", "Within 10 minutes", "When the doctor is free", "Before they sit down"],
        correct: 0,
        because: "New patients are welcomed and registered within 70 seconds.",
      },
      {
        question: "When is the HMO authorisation code requested?",
        options: [
          "When the parent asks",
          "As soon as the doctor prescribes",
          "At the end of the day",
          "After the family leaves",
        ],
        correct: 1,
        because: "Request the code as soon as the doctor prescribes; do not wait for the parent to ask.",
      },
      {
        question: "When does the appointment reminder go out?",
        options: ["The morning of", "24 hours before", "A week before", "Only if asked"],
        correct: 1,
        because: "Send a WhatsApp or SMS reminder 24 hours before the appointment.",
      },
      {
        question: "What is the WhatsApp reply standard during business hours?",
        options: ["Same day", "Within 30 minutes, no emojis", "Within 2 hours", "Whenever convenient"],
        correct: 1,
        because: "Respond within 30 minutes during business hours, and emojis are not used.",
      },
    ],
  },
  {
    code: "SOP-CS-02",
    domain: "SOP: Customer service",
    title: "The waiting area, an upset parent, and seeing families off",
    summary: "Keeping families informed while they wait, calming a frustrated parent, the final check and the 48 hour call.",
    roles: FRONT_ROLES,
    departments: FRONT_DEPTS,
    method: M,
    frequency: F,
    source: CS,
    body: `THE WAITING AREA
1. If the doctor or nurse is running behind, update parents every 15 to 20 minutes. For example: "Mummy, I'm so sorry for the wait. The doctor is attending to a complex case but should be with you in 10 minutes. Can I get the little one some water?"
2. Keep the play area tidy. The TV is on child-friendly channels only, such as CBeebies or cartoons. No news and no loud music.

AN UPSET PARENT (THE CALM PARENT PROTOCOL)
Parents are anxious when a child is ill. If a parent becomes agitated:
1. Listen. Do not interrupt. Let them speak.
2. Empathise: "I completely understand why you are frustrated; your child's health is the priority."
3. Move the conversation away from the waiting area to a private office if it gets loud.
4. If you cannot resolve it, involve the practice manager or lead physician immediately.

SEEING THEM OFF
1. Before the family leaves, ask: "Do you have all your prescriptions and your next appointment date?" The same applies on WhatsApp: close every conversation.
2. For a significant illness, the front desk calls the parent 48 hours later to ask how the child is feeling. This is the touch that builds loyalty.`,
    questions: [
      {
        question: "The doctor is running 30 minutes late. How often do you update waiting parents?",
        options: ["Not at all", "Every 15 to 20 minutes", "Once, at the start", "Only when asked"],
        correct: 1,
        because: "Inform parents every 15 to 20 minutes when the doctor or nurse is running behind.",
      },
      {
        question: "A father is shouting in the waiting area. After listening and empathising, what is the next step?",
        options: [
          "Ask him to leave",
          "Move the conversation to a private office",
          "Call security",
          "Carry on with other work",
        ],
        correct: 1,
        because: "Isolate: move the conversation away from the general waiting area to a private office.",
      },
      {
        question: "You cannot resolve a complaint. Who do you involve?",
        options: ["Nobody", "The practice manager or lead physician, immediately", "The HMO", "The next shift"],
        correct: 1,
        because: "If you cannot resolve the issue, escalate immediately to the practice manager or lead physician.",
      },
      {
        question: "What is on the waiting area TV?",
        options: ["The news", "Child-friendly channels only", "Music videos", "Whatever the parents choose"],
        correct: 1,
        because: "The TV is strictly on child-friendly channels; no news or loud music.",
      },
      {
        question: "A child was seen for a significant illness. What follow-up does the front desk make?",
        options: ["None", "A call 48 hours later to ask how the child is", "A bill reminder", "A survey after a month"],
        correct: 1,
        because: "For significant illnesses the front desk calls the parent 48 hours later.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// HMO
// ---------------------------------------------------------------------------

const HMO_MODULES: SopModule[] = [
  {
    // For the approver: rule 14 says ambulatory care is not permitted for HMO
    // patients, which reads as if every HMO child must be admitted. Worth
    // confirming the intended meaning before staff are tested on it; the
    // question on that rule tests only the DAMA form.
    code: "SOP-HMO-01",
    domain: "SOP: HMO",
    title: "Looking after HMO enrollees: approvals, records and top-ups",
    summary: "The approvals every HMO encounter needs, what must be documented for audit, and how top-ups are handled.",
    roles: ["Customer Service", "Billing Officer", "Medical Officer", "Nursing", "Lab", "Pharmacy", "Finance"],
    departments: ["ADMIN", "MEDICAL", "NURSING", "LAB", "PHARMACY"],
    method: M,
    frequency: F,
    source: HMO,
    body: `WHY THIS MATTERS
Every rule here exists so HMO claims pass vetting and audit. A claim that cannot be evidenced is a claim that is not paid.

APPROVALS, BEFORE THE CARE
1. Eligibility: customer service confirms the enrollee's eligibility immediately on arrival.
2. Paediatric consultation: the HMO officer gets approval before the patient sees a paediatrician.
3. Investigations: approval before any investigation is done.
4. Procedures: approval for every procedure, including nebulisation, wound dressing and immunisation.
5. Specialists: approval before booking the patient with a specialist.
6. Pharmacy: approval before dispensing.

DOCUMENTATION, FOR THE AUDIT
1. Doctors fully document clerking, lab investigations, prescriptions and diagnoses.
2. Nurses document all charts, treatments and vaccines given.
3. The lab uploads every investigation to the enrollee's portal.
4. Pharmacy documents every medication.
5. The HMO officer on duty audits all claims daily to make sure documentation is complete.

PRICING AND TOP-UPS
1. Keep at least a 25% margin on medications and competitive pricing on lab investigations. Where a price falls below standard, email the HMO to renegotiate and inform the enrollee.
2. If the HMO refuses to increase cover, tell the enrollee. They may pay the difference (a top-up), be profiled for a referral, or receive medication directly from their HMO.
3. An enrollee who agrees to a top-up signs the Voluntary Top-up Form. It is compulsory evidence in any HMO dispute.
4. Take care discussing money with enrollees; having a witness present is recommended.

ADMISSION
Ambulatory care is not permitted for HMO patients. If a patient refuses a required admission they sign a Discharge Against Medical Advice (DAMA) form. If an enrollee is difficult to manage, contact Dr Odedina or Dr Shakirah for guidance.`,
    questions: [
      {
        question: "An HMO child needs nebulisation. What must happen first?",
        options: ["Nothing; it is routine", "HMO approval", "Payment by the parent", "A doctor's signature only"],
        correct: 1,
        because: "Approval is required for all procedures, including nebulisation, wound dressing and immunisation.",
      },
      {
        question: "A parent agrees to pay the difference the HMO will not cover. What must they sign?",
        options: ["Nothing", "The Voluntary Top-up Form", "A DAMA form", "The admission form"],
        correct: 1,
        because: "The Voluntary Top-up Form is compulsory evidence for any HMO dispute.",
      },
      {
        question: "An HMO patient refuses a required admission. What is done?",
        options: [
          "Treat them as an outpatient anyway",
          "They sign a Discharge Against Medical Advice form",
          "Call the HMO to override",
          "Nothing is recorded",
        ],
        correct: 1,
        because: "A patient who refuses a required admission signs a DAMA form.",
      },
      {
        question: "Who checks every HMO claim is fully documented, and how often?",
        options: ["The doctor, monthly", "The HMO officer on duty, daily", "The HMO itself", "Nobody"],
        correct: 1,
        because: "The HMO officer on duty audits all claims daily for complete documentation.",
      },
      {
        question: "Where do HMO lab results go?",
        options: ["Printed for the parent only", "Uploaded to the enrollee's portal", "Kept in the lab book", "Emailed to the doctor"],
        correct: 1,
        because: "All lab investigations must be uploaded to the enrollee's portal.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Core: everybody
// ---------------------------------------------------------------------------

const CORE_MODULES: SopModule[] = [
  {
    code: "CORE-01",
    domain: "Core",
    title: "Hand hygiene: the five moments",
    summary: "When and how to clean your hands, following the WHO five moments, and why gloves do not replace it.",
    roles: [],
    departments: [],
    method: M,
    frequency: F,
    source: CORE,
    body: `WHY IT MATTERS
Hands carry most of the infections passed between patients in a hospital. Sick babies and children are the most vulnerable to them. Cleaning your hands at the right moments is the single most effective thing you can do to protect them.

THE FIVE MOMENTS (WHO)
1. Before touching a patient.
2. Before a clean or aseptic procedure, such as preparing an injection, handling a cannula or a feeding tube.
3. After any risk of exposure to body fluids, including after removing gloves.
4. After touching a patient.
5. After touching a patient's surroundings: the bed, cot, incubator, drip stand or bedside table, even if you did not touch the child.

HOW
1. Alcohol hand rub is the routine choice when hands are not visibly dirty: rub all surfaces (palms, backs, between fingers, thumbs, fingertips) until dry, about 20 to 30 seconds.
2. Wash with soap and water when hands are visibly dirty or soiled with body fluid, and after using the toilet: 40 to 60 seconds, then dry with a single-use towel.
3. Keep nails short and natural. No rings with stones, bracelets or watches when giving care.

GLOVES
Gloves do not replace hand hygiene. Clean your hands before putting gloves on and after taking them off. Change gloves between patients and between a dirty and a clean task on the same patient.

EVERYONE'S JOB
This applies to everybody who touches a patient or their surroundings, clinical or not. If you see someone miss a moment, a quiet reminder is welcome here and is never a complaint.`,
    questions: [
      {
        question: "You have just straightened a baby's cot blanket without touching the baby. Do you need hand hygiene?",
        options: ["No", "Yes: after touching patient surroundings", "Only if the blanket was dirty", "Only before the next patient"],
        correct: 1,
        because: "The fifth moment is after touching a patient's surroundings, even without touching the patient.",
      },
      {
        question: "Your hands are visibly soiled. Which method do you use?",
        options: ["Alcohol rub", "Soap and water", "Gloves", "A wipe"],
        correct: 1,
        because: "Visibly dirty hands are washed with soap and water; alcohol rub is for hands that are not visibly dirty.",
      },
      {
        question: "Do gloves replace hand hygiene?",
        options: ["Yes", "No: clean hands before and after gloves", "Only sterile gloves", "Only for short tasks"],
        correct: 1,
        because: "Gloves do not replace hand hygiene; clean hands before putting them on and after removing them.",
      },
      {
        question: "Which of these is one of the five moments?",
        options: ["Before a clean or aseptic procedure", "Before answering the phone", "At the start of the month", "After lunch only"],
        correct: 0,
        because: "Before a clean or aseptic procedure is the second of the WHO five moments.",
      },
      {
        question: "Roughly how long does an alcohol hand rub take?",
        options: ["5 seconds", "20 to 30 seconds, until dry", "2 minutes", "As long as you like"],
        correct: 1,
        because: "Rub all surfaces until dry, about 20 to 30 seconds.",
      },
    ],
  },
  {
    code: "CORE-02",
    domain: "Core",
    title: "Safeguarding children",
    summary: "Recognising possible abuse or neglect, what to do if a child or parent tells you something, and who to tell.",
    roles: [],
    departments: [],
    method: M,
    frequency: F,
    source: CORE,
    body: `OUR DUTY
Every child at Haven has the right to be safe. Under the Child Rights Act and our professional duty of care, the child's welfare comes first, ahead of the convenience or wishes of any adult, including a parent.

WHAT MIGHT BE A SIGN
1. An injury that does not fit the explanation, or the story keeps changing.
2. Bruises on a baby who is not yet moving about, or in unusual places such as the ears, neck, back or genitals.
3. Delay in bringing a child for care, or repeated visits with unexplained injuries.
4. A child who is very withdrawn, frightened of a carer, or unusually watchful.
5. Signs of neglect: persistent poor hygiene, untreated conditions, failure to thrive.
None of these proves abuse. Your job is to notice and pass it on, not to investigate or decide.

IF A CHILD OR ADULT TELLS YOU SOMETHING
1. Stay calm and listen. Do not ask leading questions or push for detail.
2. Do not promise to keep it secret. Explain that you will need to tell someone whose job is to help.
3. Write down what was said, in their words, with the date and time, as soon as you can.

WHAT TO DO
1. Tell the doctor in charge and the Chief Medical Director the same day. If a child is in immediate danger, act at once and tell the most senior person on duty.
2. Do not confront the person you are worried about.
3. Do not discuss it with colleagues who do not need to know.
4. Record your concern factually: what you saw or heard, not your opinion.

YOUR OWN CONDUCT
Never be alone with a child behind a closed door when it can be avoided; a caregiver or colleague should be present for examinations and intimate care. Never take photographs of patients on your own phone.`,
    questions: [
      {
        question: "A 2 month old who cannot roll has bruises on the back. What do you do?",
        options: [
          "Nothing, babies bruise",
          "Pass the concern to the doctor in charge and the CMD the same day, and record what you saw",
          "Ask the parent to explain in detail and decide yourself",
          "Post about it in the staff group",
        ],
        correct: 1,
        because: "Bruising on a non-mobile baby is a recognised sign; your job is to pass it on the same day and record facts.",
      },
      {
        question: "A child tells you something worrying and asks you to keep it secret. What do you say?",
        options: [
          "Promise to keep it secret",
          "Explain you will need to tell someone whose job is to help",
          "Tell them not to say such things",
          "Ignore it",
        ],
        correct: 1,
        because: "Never promise secrecy; explain you must tell someone who can help.",
      },
      {
        question: "What should your written note contain?",
        options: ["Your opinion of the family", "What was said or seen, in their words, with date and time", "A diagnosis", "Nothing; just tell someone"],
        correct: 1,
        because: "Record factually what you saw or heard, in their words, with the date and time.",
      },
      {
        question: "Should you confront the adult you are worried about?",
        options: ["Yes, immediately", "No; tell the doctor in charge and the CMD", "Only if they seem calm", "Only on the phone"],
        correct: 1,
        because: "Do not confront the person; pass the concern on to the doctor in charge and the CMD.",
      },
    ],
  },
  {
    code: "CORE-03",
    domain: "Core",
    title: "Caring for families, and handling a complaint",
    summary: "What every family should feel at Haven, and how anyone on the team takes a complaint and makes sure it is resolved.",
    roles: [],
    departments: [],
    method: M,
    frequency: F,
    source: CORE,
    body: `THE STANDARD
Every family should feel welcomed, informed and respected, by everybody they meet, not only the front desk. Parents of a sick child are frightened; small courtesies matter more here than anywhere.

EVERY CONTACT
1. Greet the family and the child, and introduce yourself and your role.
2. Use the child's name.
3. Explain what is happening and what happens next, in plain words.
4. If you give a time, keep it. If it slips, go back and say so before they have to ask.
5. Never discuss another patient, a colleague, or a bill in a corridor or in front of other families.

WHEN A FAMILY COMPLAINS
Anyone can receive a complaint. The person who receives it owns it until it is handed on.
1. Listen fully without interrupting or defending.
2. Thank them for telling you and acknowledge how they feel.
3. Say what you will do and by when. Do not promise what you cannot deliver.
4. Fix it if you can, there and then.
5. If you cannot, pass it the same day to your head of department or the practice manager, with the family's name, contact and what was said.
6. Make sure someone goes back to the family to tell them what was done.
7. Record it, so the same problem can be prevented.

WHAT NOT TO DO
Do not argue, blame a colleague in front of the family, or tell them "that is not my department". A complaint is information that helps us improve.`,
    questions: [
      {
        question: "A parent complains to you, a pharmacy technician, about the waiting time. Whose complaint is it?",
        options: ["Customer service's", "Yours, until you hand it on", "Nobody's", "The doctor's"],
        correct: 1,
        because: "The person who receives a complaint owns it until it is handed on.",
      },
      {
        question: "You told a family the doctor would see them in 10 minutes and it is now 25. What should you do?",
        options: ["Wait for them to ask", "Go back and update them", "Avoid them", "Blame the doctor"],
        correct: 1,
        because: "If a time you gave slips, go back and say so before they have to ask.",
      },
      {
        question: "You cannot fix a complaint yourself. What next?",
        options: [
          "Tell the family it is not your department",
          "Pass it the same day to your head of department or the practice manager, with the details",
          "Forget it",
          "Tell them to write a letter",
        ],
        correct: 1,
        because: "Unresolved complaints go the same day to the head of department or practice manager with the details.",
      },
      {
        question: "What is the final step after a complaint is dealt with?",
        options: ["Nothing", "Someone tells the family what was done, and it is recorded", "Close the file", "Send a bill"],
        correct: 1,
        because: "Someone goes back to tell the family what was done, and it is recorded to prevent a repeat.",
      },
    ],
  },
  {
    code: "CORE-04",
    domain: "Core",
    title: "Speaking up and the safety register",
    summary: "Why reporting near misses and incidents protects children, what to report, and the no-blame promise.",
    roles: [],
    departments: [],
    method: M,
    frequency: F,
    source: CORE,
    body: `WHY WE REPORT
Most harm in hospitals comes from systems, not bad people: a confusing label, a missing item, a rushed handover. The only way to fix a system is to know where it fails. Every report, especially of a near miss that did not reach the child, is a chance to fix something before it hurts someone.

WHAT TO REPORT
1. Anything that harmed, or could have harmed, a patient, a family member or a colleague.
2. Near misses: an error caught before it reached the child, such as a wrong dose noticed at the bedside.
3. Equipment that failed or was missing when needed.
4. Anything you think is unsafe, even if you are not sure.

HOW
Use the report button on the staff page. You can report anonymously. Report as soon as you can, while details are fresh. If a child needs care now, deal with that first and tell the doctor on duty, then report.

THE PROMISE
1. Nobody is disciplined for reporting an honest mistake or a near miss. Reporting is never held against you.
2. The register looks at what happened and why, not who to blame.
3. Every report is read and investigated, and the person who reported (if named) hears what was done.
4. The exceptions are deliberate harm, working under the influence, and repeatedly ignoring a known safe procedure. Those are handled separately, and reporting them is still the right thing to do.

SPEAKING UP IN THE MOMENT
If you see something about to go wrong, say so, whatever your role and whoever is doing it. "Can we just check this first?" is always acceptable. A good team welcomes it.`,
    questions: [
      {
        question: "You notice a wrong dose drawn up and stop it before it is given. Should you report it?",
        options: ["No, nothing happened", "Yes, it is a near miss", "Only if the doctor agrees", "Only if it happens again"],
        correct: 1,
        because: "Near misses are exactly what the register is for: an error caught before it reached the child.",
      },
      {
        question: "Will you be disciplined for reporting your own honest mistake?",
        options: ["Yes", "No; reporting an honest mistake is never held against you", "Only if it was serious", "Depends on your role"],
        correct: 1,
        because: "Nobody is disciplined for reporting an honest mistake or a near miss.",
      },
      {
        question: "A child has just been harmed by a fall. What comes first?",
        options: [
          "Write the report",
          "Care for the child and tell the doctor on duty, then report",
          "Find out whose fault it was",
          "Call the family",
        ],
        correct: 1,
        because: "If a child needs care now, deal with that first and tell the doctor on duty, then report.",
      },
      {
        question: "Can you report anonymously?",
        options: ["No", "Yes", "Only for equipment", "Only night staff"],
        correct: 1,
        because: "Reports can be made anonymously from the staff page.",
      },
      {
        question: "A senior colleague is about to skip a check. What should you do?",
        options: ["Stay quiet, they are senior", "Speak up: ask to check first", "Report them later only", "Leave the room"],
        correct: 1,
        because: "Speaking up in the moment is expected whatever your role and whoever is doing it.",
      },
    ],
  },
  {
    code: "CORE-05",
    domain: "Core",
    title: "Confidentiality and patient data",
    summary: "Keeping children's and families' information private, as the law and our duty require, on paper, on screens and on phones.",
    roles: [],
    departments: [],
    method: M,
    frequency: F,
    source: CORE,
    body: `THE RULE
Everything we learn about a child and their family, from their diagnosis to their phone number and their bill, is confidential. Health information is sensitive personal data under the Nigeria Data Protection Act 2023, and our professional duty of confidentiality applies to every member of staff, clinical or not.

WHO CAN SEE WHAT
1. Look at a record only when you need it for your work with that patient. Curiosity is not a reason, even for a friend or relative.
2. Share information only with colleagues who need it to care for the child, and with the child's parent or legal guardian.
3. Before giving any information by phone, confirm who you are speaking to. If you are not sure, do not share it; offer to call back on the number in the record.
4. Never confirm to an outsider, including other parents, that a child is or was a patient.

PHONES AND SCREENS
1. Never photograph patients, records or screens on your personal phone.
2. Never share patient details in personal WhatsApp groups. Use only the channels the hospital has approved.
3. Lock or log out of the EMR when you step away. Never share your login.
4. Keep screens turned away from families in public areas.

PAPER
Do not leave forms, results or lists where families can read them. Dispose of paper with patient details in the confidential waste, never the general bin.

IF SOMETHING GOES WRONG
If information is sent to the wrong person, a phone with patient data is lost, or you see a record being misused, tell your head of department straight away. A breach can be contained much better within hours than days.`,
    questions: [
      {
        question: "A friend asks you to check if their neighbour's child was admitted. What do you do?",
        options: ["Check the EMR quickly", "Decline: never confirm that a child is a patient", "Ask a colleague to check", "Tell them if it is good news"],
        correct: 1,
        because: "Never confirm to an outsider that a child is or was a patient, and only open records you need for your work.",
      },
      {
        question: "A caller says they are the child's father and asks for results. You do not recognise the voice. What do you do?",
        options: [
          "Read the results",
          "Confirm who they are; if unsure, offer to call back on the number in the record",
          "Hang up",
          "Ask them to text",
        ],
        correct: 1,
        because: "Confirm identity before giving information by phone; if unsure, call back on the record number.",
      },
      {
        question: "Can you photograph a rash on your own phone to show a colleague?",
        options: ["Yes", "No, never on a personal phone", "If you delete it later", "Only with a filter"],
        correct: 1,
        because: "Never photograph patients, records or screens on your personal phone.",
      },
      {
        question: "You sent a lab result to the wrong parent's WhatsApp. What now?",
        options: [
          "Delete it and say nothing",
          "Tell your head of department straight away",
          "Wait to see if they notice",
          "Send the right one and move on",
        ],
        correct: 1,
        because: "Report a breach to your head of department straight away so it can be contained.",
      },
      {
        question: "You step away from the computer for a few minutes. What do you do?",
        options: ["Leave it open", "Lock it or log out of the EMR", "Turn the screen off only", "Ask a parent to watch it"],
        correct: 1,
        because: "Lock or log out of the EMR when you step away, and never share your login.",
      },
    ],
  },
  {
    code: "CORE-06",
    domain: "Core",
    title: "Fire and emergency evacuation",
    summary: "What to do if you discover a fire, how to evacuate children safely, and keeping exits and equipment ready.",
    roles: [],
    departments: [],
    method: M,
    frequency: F,
    source: CORE,
    body: `IF YOU DISCOVER A FIRE
1. Raise the alarm: shout "Fire!" and set off the alarm or tell the most senior person on duty at once.
2. Call the fire service (112 or the Lagos State Fire Service) or make sure someone has.
3. Only tackle a fire if it is small, you have been trained, you have the right extinguisher and your exit is behind you. Otherwise get out and close the door behind you.

EVACUATING
1. Children cannot save themselves. Every member of staff helps move patients, starting with those nearest the fire and those who cannot move.
2. Babies in the NICU are moved by the nurses on duty, with oxygen if it can be carried safely. Know in advance which baby you would move and how.
3. Keep families together where you can, and lead them calmly to the assembly point.
4. Close doors as you leave to slow the spread of smoke. Do not use the lift.
5. At the assembly point, the nurse in charge counts every patient and the senior on duty counts staff. Nobody goes back inside.

OXYGEN AND ELECTRICS
Oxygen makes a fire burn faster. Turn off oxygen at the source if it is safe to do so. Keep cylinders away from heat and naked flames, and never let anyone smoke near them.

EVERY DAY
1. Keep corridors, stairs and fire exits clear. Never prop open or block a fire door.
2. Know where the nearest extinguisher and exit are from wherever you work.
3. Report a missing extinguisher, a blocked exit or damaged wiring immediately.`,
    questions: [
      {
        question: "You discover a fire in a store room. What is your first action?",
        options: ["Fight it alone", "Raise the alarm", "Collect your belongings", "Call a friend"],
        correct: 1,
        because: "First raise the alarm and tell the most senior person on duty.",
      },
      {
        question: "Why turn off oxygen at the source if it is safe to do so?",
        options: ["To save money", "Oxygen makes a fire burn faster", "It is not important", "To stop the alarm"],
        correct: 1,
        because: "Oxygen makes a fire burn faster, so it is turned off at the source when safe.",
      },
      {
        question: "Can you use the lift during an evacuation?",
        options: ["Yes, it is faster", "No", "Only with a baby", "Only if the power is on"],
        correct: 1,
        because: "Do not use the lift during an evacuation.",
      },
      {
        question: "At the assembly point, what happens?",
        options: [
          "Everyone goes home",
          "Patients and staff are counted, and nobody goes back inside",
          "Staff return for equipment",
          "Families leave on their own",
        ],
        correct: 1,
        because: "The nurse in charge counts patients, the senior on duty counts staff, and nobody goes back inside.",
      },
      {
        question: "A fire door is wedged open to help with deliveries. What should you do?",
        options: ["Leave it", "Close it and report it", "Wedge it wider", "Remove the sign"],
        correct: 1,
        because: "Never prop open or block a fire door; report it.",
      },
    ],
  },
];

export const SOP_MODULES: SopModule[] = [
  ...NURSING,
  ...HEALTH_ATTENDANTS,
  ...PHARMACY_MODULES,
  ...LAB_MODULES,
  ...CUSTOMER_SERVICE,
  ...HMO_MODULES,
  ...CORE_MODULES,
];
