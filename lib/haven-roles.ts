/**
 * Haven's roles, as data, for performance management.
 *
 * Source: Dr Tanwa's job descriptions and OKRs (version 1, 2 November 2026).
 * Twelve roles held by 23 staff, each with a purpose, responsibilities,
 * qualifications, key skills and five KPIs tagged H1 to H5 (the hospital
 * objective each one moves). The lead Medical Officer and the nurse in charge
 * are rotating duties on top of a role, not posts.
 *
 * The appraisal joins these KPIs (80%) with a short conduct section (20%) on
 * the 0 to 5 scale from Mrs Alli's Head Nurse template.
 *
 * No clinician's KPIs depend on admissions, length of stay or tests ordered.
 */

export type HavenObjective = "H1" | "H2" | "H3" | "H4" | "H5";

export interface KpiDef {
  code: string;
  title: string;
  target: string;
  objective: HavenObjective[];
  /** Share of the KPI section. Each role's weights sum to exactly 1.0. */
  weight: number;
  kind: "PERCENT" | "COUNT" | "DONE_BY_DATE" | "SCORE" | "YES_NO";
}

export interface RoleDef {
  code: string;
  title: string;
  department: string;
  /** Role code of the line manager; null for the CMD (board and owners). */
  reportsTo: string | null;
  purpose: string;
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
  kpis: KpiDef[];
  rotatingDuty?: { title: string; responsibilities: string[]; kpis: KpiDef[] };
  /** Lowercase strings matched against StaffMember.position. Longest match wins. */
  positionMatch: string[];
}

export const HAVEN_OBJECTIVES: Record<HavenObjective, string> = {
  H1: "Give care that is safe, and that we can prove is safe",
  H2: "Fill the beds, NICU first",
  H3: "Bill everything we do, and get paid for it",
  H4: "Build a team that stays and grows",
  H5: "Keep families choosing Haven",
};

export const HAVEN_ROLES: RoleDef[] = [
  {
    code: "CMD",
    title: "Chief Medical Director",
    department: "Medical",
    reportsTo: null,
    purpose:
      "Provide overall clinical and strategic leadership for the hospital, so that patient care is safe, ethical, of high quality and financially sustainable.",
    responsibilities: [
      "Set the clinical direction, policies and standards of care for the hospital.",
      "Lead the senior management team and hold each department head to their OKRs.",
      "Make sure the hospital meets all MDCN, State Ministry of Health and HEFAMAA licensing and inspection requirements.",
      "Approve clinical protocols, referral pathways and emergency procedures.",
      "Lead clinical governance: the incident register, audits, morbidity and mortality reviews and patient complaints.",
      "Lead NICU tours and briefings for referring obstetricians and maternity units.",
      "Approve the annual budget, major spending and new service lines with the Head of Finance.",
      "Represent the hospital to HMOs, partners, regulators and the public.",
      "Lead recruitment, appraisal and discipline of senior staff.",
    ],
    qualifications: [
      "MBBS/MBChB with full, current MDCN registration and annual practising licence.",
      "Postgraduate fellowship or equivalent specialist qualification preferred.",
      "At least 10 years post-qualification experience, with 5 or more in a leadership role.",
    ],
    skills: ["Clinical leadership", "Strategic planning", "Governance and risk management", "People management", "Financial awareness", "Stakeholder relations"],
    kpis: [
      { code: "CMD-1", title: "Clinical incident register reviewed weekly; actions closed within 30 days", target: "80% or more", objective: ["H1"], weight: 0.25, kind: "PERCENT" },
      { code: "CMD-2", title: "NICU tours or briefings for referring obstetricians and maternity units", target: "2 a month", objective: ["H2"], weight: 0.2, kind: "COUNT" },
      { code: "CMD-3", title: "Monthly revenue at EBITDA floor (with the Head of Finance)", target: "N45 to 50M at 18% or more", objective: ["H3"], weight: 0.2, kind: "SCORE" },
      { code: "CMD-4", title: "Direct reports with five written objectives and a monthly one-to-one", target: "100%", objective: ["H4"], weight: 0.15, kind: "PERCENT" },
      { code: "CMD-5", title: "Patient experience score", target: "4.60 or above", objective: ["H5"], weight: 0.2, kind: "SCORE" },
    ],
    positionMatch: ["chief medical director"],
  },
  {
    code: "HCS",
    title: "Head of Clinical Services",
    department: "Medical",
    reportsTo: "CMD",
    purpose:
      "Run day-to-day clinical services so that every patient gets timely, safe and well-coordinated care across consulting, nursing, laboratory and pharmacy.",
    responsibilities: [
      "Choose the lead Medical Officer and the nurse in charge for each 3-month rotation, make sure each one hands over in writing to the next, and approve their clinical and nursing rosters so every shift has cover.",
      "Make sure a pharmacist is present on every dispensing day and three registered nurses are on every shift, one each for the NICU, the ward and ER/triage.",
      "Coordinate the work of nursing, lab and pharmacy so patient flow is smooth.",
      "Put clinical policies and protocols into practice, and make sure staff are trained on them before they are audited.",
      "Monitor quality: case-note audits, infection prevention and control, patient safety incidents.",
      "Keep the resuscitation currency register for all clinical staff.",
      "Handle clinical complaints and report serious incidents to the Chief Medical Director.",
      "Organise continuing medical education and in-house training for clinical staff.",
      "Run clinics and see patients as part of the clinical team.",
    ],
    qualifications: [
      "MBBS/MBChB with full, current MDCN registration and practising licence.",
      "At least 6 years post-qualification experience, including 2 or more in a supervisory role.",
      "Postgraduate qualification is an advantage.",
    ],
    skills: ["Clinical judgement", "Team supervision", "Quality improvement", "Clear communication"],
    kpis: [
      { code: "HCS-1", title: "Pharmacist present on dispensing days, and three registered nurses on every shift (NICU, ward, ER/triage)", target: "100%", objective: ["H1"], weight: 0.25, kind: "PERCENT" },
      { code: "HCS-2", title: "Resuscitation currency register: every clinician current", target: "100%", objective: ["H1"], weight: 0.2, kind: "PERCENT" },
      { code: "HCS-3", title: "Monthly case-note audit across the clinical team", target: "90% or more meet the standard", objective: ["H1", "H3"], weight: 0.2, kind: "PERCENT" },
      { code: "HCS-4", title: "Clinical roster approved 4 weeks ahead, every shift covered", target: "100%", objective: ["H1"], weight: 0.2, kind: "PERCENT" },
      { code: "HCS-5", title: "Clinical staff with five written objectives and a monthly one-to-one", target: "100%", objective: ["H4"], weight: 0.15, kind: "PERCENT" },
    ],
    positionMatch: ["head of clinical services"],
  },
  {
    code: "MO",
    title: "Medical Officer",
    department: "Medical",
    reportsTo: "HCS",
    purpose:
      "Assess, diagnose and treat patients, and refer them on when needed, in line with the hospital's clinical protocols.",
    responsibilities: [
      "Consult with outpatients and review inpatients or observation patients.",
      "Take histories, examine patients, order and interpret investigations, and prescribe treatment.",
      "Manage medical emergencies and stabilise patients before transfer.",
      "Keep clear, complete medical records written at the time of care.",
      "Refer patients to specialists or other facilities with full referral notes.",
      "Give patients and families clear advice on their condition, treatment and follow-up.",
      "Agree each inpatient's discharge plan at the morning huddle, and have the summary and prescription ready by noon.",
      "Report incidents and near misses on the incident register.",
      "Complete medical reports and sick notes accurately, and give the Admin and Billing Officer the diagnosis and treatment details needed for HMO forms.",
    ],
    qualifications: [
      "MBBS/MBChB with full, current MDCN registration and practising licence.",
      "Completed housemanship; NYSC completed or exempted.",
      "Current Basic Life Support certificate (ACLS and PALS are an advantage).",
    ],
    skills: ["Clinical assessment", "Sound decision-making", "Record keeping", "Patient communication", "Teamwork"],
    kpis: [
      { code: "MO-1", title: "Case notes complete at the time of care (monthly audit)", target: "90% or more", objective: ["H1", "H3"], weight: 0.25, kind: "PERCENT" },
      { code: "MO-2", title: "Discharge summary and prescription ready by noon for planned discharges", target: "90% or more", objective: ["H2"], weight: 0.15, kind: "PERCENT" },
      { code: "MO-3", title: "Current BLS certificate", target: "100% of the time", objective: ["H1"], weight: 0.2, kind: "YES_NO" },
      { code: "MO-4", title: "Incidents and near misses reported the same shift", target: "100%", objective: ["H1"], weight: 0.2, kind: "PERCENT" },
      { code: "MO-5", title: "Medical reports done within 24 hours, and HMO details given to billing the same day", target: "100%", objective: ["H3"], weight: 0.2, kind: "PERCENT" },
    ],
    rotatingDuty: {
      title: "Lead Medical Officer (3 months at a time)",
      responsibilities: [
        "Prepare the monthly clinical duty roster 4 weeks ahead, with on-call, weekend, rest days and leave cover, and send it to the Head of Clinical Services for approval.",
        "Arrange cover when a doctor is absent, and record every shift swap.",
        "Lead discharge planning at the morning huddle and the handovers between shifts.",
        "Run the monthly case-note audit for the medical team and share the findings.",
        "Induct new and locum doctors before their first shift.",
        "Write a handover note for the next lead Medical Officer at the end of the 3 months.",
      ],
      kpis: [
        { code: "LMO-1", title: "Roster published 4 weeks ahead, every shift covered", target: "100%", objective: ["H1", "H4"], weight: 0.25, kind: "PERCENT" },
        { code: "LMO-2", title: "Discharge plan made at the morning huddle for every inpatient", target: "90% of planned discharges", objective: ["H2"], weight: 0.2, kind: "PERCENT" },
        { code: "LMO-3", title: "Monthly medical case-note audit held", target: "Every month", objective: ["H1", "H3"], weight: 0.2, kind: "YES_NO" },
        { code: "LMO-4", title: "New and locum doctors inducted before their first shift", target: "100%", objective: ["H4"], weight: 0.2, kind: "PERCENT" },
        { code: "LMO-5", title: "Written handover note to the next lead", target: "At every rotation", objective: ["H4"], weight: 0.15, kind: "YES_NO" },
      ],
    },
    positionMatch: ["medical officer"],
  },
  {
    code: "RN",
    title: "Registered Nurse",
    department: "Nursing",
    reportsTo: "HCS",
    purpose:
      "Give safe, caring nursing care to patients, support doctors in assessment and treatment, and make sure the care given reaches the bill.",
    responsibilities: [
      "Work the post you are rostered to on each shift (NICU, ward or ER/triage); at triage, take vital signs, weight and other measurements.",
      "Give medicines, injections, infusions and dressings as prescribed, and sign the drug chart as each dose is given.",
      "Record every item and procedure in the clinical record system at the point of care, not from memory at shift end.",
      "Collect samples where required and send them to the lab with correct labels.",
      "Assist doctors during examinations and minor procedures.",
      "Monitor patients and report any change in condition promptly.",
      "Give and receive a structured handover at every shift change.",
      "Report incidents and near misses on the incident register.",
      "Follow infection prevention and control procedures at all times.",
    ],
    qualifications: [
      "RN with current NMCN licence (RM is an advantage).",
      "At least 1 year post-registration experience preferred.",
      "Current Basic Life Support certificate (Paediatric Basic Life Support or PALS is an advantage).",
    ],
    skills: ["Clinical nursing", "Observation", "Record keeping", "Compassion", "Teamwork"],
    kpis: [
      { code: "RN-1", title: "Drug charts signed at the time each dose is given", target: "95% or more", objective: ["H1"], weight: 0.25, kind: "PERCENT" },
      { code: "RN-2", title: "Handovers that meet the structured standard", target: "90% or more", objective: ["H1"], weight: 0.2, kind: "PERCENT" },
      { code: "RN-3", title: "Items and procedures recorded at the point of care", target: "95% on the bill the same shift", objective: ["H3"], weight: 0.2, kind: "PERCENT" },
      { code: "RN-4", title: "Trained and signed off on the core nursing procedures; BLS current", target: "100%", objective: ["H1", "H4"], weight: 0.15, kind: "PERCENT" },
      { code: "RN-5", title: "Incidents and near misses reported the same shift", target: "100%", objective: ["H1"], weight: 0.2, kind: "PERCENT" },
    ],
    rotatingDuty: {
      title: "Nurse in charge (3 months at a time)",
      responsibilities: [
        "Prepare the nursing duty roster 4 weeks ahead, including nights and weekends, with three registered nurses on every shift: one in the NICU, one on the ward and one at ER/triage.",
        "Never roster non-nursing staff as nursing cover.",
        "Run the structured handover at every shift change, and check drug charts and point-of-care billing entries.",
        "Check the emergency trolley, oxygen and nursing equipment every day.",
        "Supervise attendants on ward tasks, and lead infection prevention and control.",
        "Keep track of nurses' BLS and NMCN licence renewals.",
        "Write a handover note for the next nurse in charge at the end of the 3 months.",
      ],
      kpis: [
        { code: "NIC-1", title: "Three registered nurses on every shift (NICU, ward, ER/triage), roster published 4 weeks ahead", target: "100% of shifts", objective: ["H1"], weight: 0.25, kind: "PERCENT" },
        { code: "NIC-2", title: "Handovers that meet the structured standard (audited after training)", target: "90% or more", objective: ["H1"], weight: 0.2, kind: "PERCENT" },
        { code: "NIC-3", title: "Emergency trolley checked", target: "Every day", objective: ["H1"], weight: 0.2, kind: "PERCENT" },
        { code: "NIC-4", title: "Point-of-care billing entries checked each shift", target: "95% on the bill the same shift", objective: ["H3"], weight: 0.2, kind: "PERCENT" },
        { code: "NIC-5", title: "Written handover note to the next nurse in charge", target: "At every rotation", objective: ["H4"], weight: 0.15, kind: "YES_NO" },
      ],
    },
    positionMatch: ["registered nurse", "senior registered nurse"],
  },
  {
    code: "MLS",
    title: "Medical Lab Scientist",
    department: "Laboratory",
    reportsTo: "HCS",
    purpose: "Carry out accurate and timely tests that are safe for children, and track what each result costs.",
    responsibilities: [
      "Collect and receive samples, checking labels and request forms.",
      "Run the tests offered by the hospital and report them against age-banded paediatric reference ranges.",
      "Check, validate and release results within agreed turnaround times.",
      "Phone critical results to the requesting doctor within 30 minutes, using the critical value list.",
      "Upload results for every insured investigation to the HMO portal as well as the clinical record.",
      "Run and log daily quality control, and take part in external quality assessment.",
      "Service lab equipment on a planned schedule, and log faults.",
      "Report cost per result, analyser use and turnaround time to the Head of Clinical Services each month.",
      "Follow the approved transfusion pathway, biosafety rules and lab waste procedures.",
    ],
    qualifications: [
      "BMLS (or equivalent) with current MLSCN registration and licence.",
      "Internship completed; at least 1 year post-internship experience preferred.",
    ],
    skills: ["Accuracy", "Quality control", "Equipment handling", "Time management", "Confidentiality"],
    kpis: [
      { code: "MLS-1", title: "Critical results phoned to a doctor within 30 minutes", target: "100%", objective: ["H1"], weight: 0.25, kind: "PERCENT" },
      { code: "MLS-2", title: "Daily QC logged, age-banded ranges on every report, EQA joined", target: "All in place", objective: ["H1"], weight: 0.2, kind: "YES_NO" },
      { code: "MLS-3", title: "Transfusion pathway rewritten, approved and trained", target: "By 31 Dec 2026", objective: ["H1"], weight: 0.2, kind: "DONE_BY_DATE" },
      { code: "MLS-4", title: "Insured investigation results uploaded to the HMO portal", target: "100%", objective: ["H3"], weight: 0.2, kind: "PERCENT" },
      { code: "MLS-5", title: "Monthly report on cost per result, analyser use and turnaround", target: "Every month from December", objective: ["H3"], weight: 0.15, kind: "YES_NO" },
    ],
    positionMatch: ["medical lab scientist", "laboratory scientist"],
  },
  // Added by CFA, not in Dr Tanwa's version 1. Three pharmacy key results
  // depend on a pharmacist being present, and no role held them.
  {
    code: "PH",
    title: "Pharmacist (sessional)",
    department: "Pharmacy",
    reportsTo: "HCS",
    purpose:
      "Make every dispensing day safe for children: verify weight-based doses, oversee the controls on medicines, and sign off the stock that keeps the pharmacy supplied.",
    responsibilities: [
      "Be present whenever the pharmacy dispenses, and verify every weight-based paediatric dose before it leaves the pharmacy.",
      "Supervise the Pharmacy Technicians in dispensing, labelling and counselling families.",
      "Oversee the controlled drugs register and take part in the weekly count.",
      "Review the pharmacy and vaccine fridge temperature logs, and act on any reading out of range.",
      "Sign off the monthly stock count against the ledger, and the stock held under vendor-managed inventory (consignment).",
      "Approve purchase orders placed by someone else, so no one approves their own order.",
      "Advise doctors and nurses on paediatric dosing, interactions and stock alternatives.",
    ],
    qualifications: [
      "B.Pharm (or PharmD) with current PCN registration and annual licence.",
      "Hospital pharmacy experience preferred; paediatric experience is an advantage.",
    ],
    skills: ["Paediatric dosing", "Medicines governance", "Stock control", "Supervision", "Attention to detail"],
    kpis: [
      { code: "PH-1", title: "Present on every dispensing day, with weight-based doses verified", target: "100% of dispensing days", objective: ["H1"], weight: 0.3, kind: "PERCENT" },
      { code: "PH-2", title: "Controlled drugs register kept and counted", target: "Weekly, 100%", objective: ["H1"], weight: 0.2, kind: "PERCENT" },
      { code: "PH-3", title: "Fridge temperature logs reviewed, with action on out-of-range readings", target: "Every week", objective: ["H1"], weight: 0.15, kind: "PERCENT" },
      { code: "PH-4", title: "Monthly stock count and consignment stock reconciled to the ledger and signed off", target: "Every month", objective: ["H3"], weight: 0.2, kind: "YES_NO" },
      { code: "PH-5", title: "Stockouts", target: "1 a month or fewer", objective: ["H1", "H3"], weight: 0.15, kind: "COUNT" },
    ],
    positionMatch: ["pharmacist"],
  },
  {
    code: "PT",
    title: "Pharmacy Technician",
    department: "Pharmacy",
    reportsTo: "HCS",
    purpose: "Dispense medicines safely under a pharmacist, and keep the pharmacy well stocked, recorded and organised.",
    responsibilities: [
      "Dispense only when a pharmacist is present to verify weight-based paediatric doses.",
      "Label medicines clearly and explain dose, timing and storage to families.",
      "Log pharmacy and vaccine fridge temperatures twice a day.",
      "Keep the controlled drugs register and take part in the weekly count.",
      "Count stock and reconcile it against the ledger each month; report any gap.",
      "Work with the supplier on vendor-managed inventory (consignment).",
      "Flag items near expiry early, and remove expired or damaged stock.",
      "Send all purchase orders for approval by someone other than the person who placed them.",
      "Keep the pharmacy area clean, tidy and secure.",
    ],
    qualifications: [
      "Diploma in Pharmacy Technology with current PCN registration.",
      "At least 1 year experience in a hospital or community pharmacy preferred.",
    ],
    skills: ["Accuracy", "Stock control", "Knowledge of common medicines", "Patient communication", "Honesty"],
    kpis: [
      { code: "PT-1", title: "Fridge temperatures logged", target: "Twice daily, every day", objective: ["H1"], weight: 0.2, kind: "PERCENT" },
      { code: "PT-2", title: "Dispensing done with a pharmacist present", target: "100%", objective: ["H1"], weight: 0.25, kind: "PERCENT" },
      { code: "PT-3", title: "Controlled drugs register kept and counted", target: "Weekly, 100%", objective: ["H1"], weight: 0.2, kind: "PERCENT" },
      { code: "PT-4", title: "Monthly stock count reconciled to the ledger", target: "Every month", objective: ["H3"], weight: 0.2, kind: "YES_NO" },
      { code: "PT-5", title: "Stockouts", target: "1 a month or fewer", objective: ["H1", "H3"], weight: 0.15, kind: "COUNT" },
    ],
    positionMatch: ["pharmacy technician"],
  },
  {
    code: "HAO",
    title: "Head of Admin, Operations & Business Development",
    department: "Admin",
    reportsTo: "CMD",
    purpose: "Keep the hospital running smoothly behind the scenes, keep it licensed and priced, and grow its patient and partner base.",
    responsibilities: [
      "Manage daily operations: facilities, power, security, utilities, vendors and maintenance.",
      "Lead the tariff review: price every line, self-pay and HMO separately, and make sure each price is live in billing.",
      "Keep the licence register for the facility, premises, waste, lab and every clinician, with reminders 90 days ahead.",
      "Make sure the clinical record system is backed up every night and the restore is tested.",
      "Lead HR administration: recruitment, structured induction, staff files, objectives, leave and attendance.",
      "Oversee front desk, customer service, records and domestic staff.",
      "Manage HMO and corporate relationships, and set business development targets with the BD Executive.",
      "Run the weekly operating review and prepare the monthly operations report.",
    ],
    qualifications: [
      "Bachelor's degree in Business Administration, Health Management or a related field; MBA or MPH is an advantage.",
      "At least 5 years experience in operations or administration, ideally in healthcare.",
    ],
    skills: ["Operations management", "People management", "Negotiation", "Business development", "Problem solving"],
    kpis: [
      { code: "HAO-1", title: "Tariff lines priced and live in billing", target: "2,413 of 2,413 (from 461)", objective: ["H3"], weight: 0.25, kind: "COUNT" },
      { code: "HAO-2", title: "Licence register complete with 90-day reminders", target: "By 30 Nov 2026", objective: ["H1"], weight: 0.2, kind: "DONE_BY_DATE" },
      { code: "HAO-3", title: "NICU power load calculation done; nightly backup with a tested restore", target: "By 30 Nov 2026", objective: ["H1"], weight: 0.2, kind: "DONE_BY_DATE" },
      { code: "HAO-4", title: "Staff with five written objectives and a monthly one-to-one", target: "100%", objective: ["H4"], weight: 0.2, kind: "PERCENT" },
      { code: "HAO-5", title: "New joiners, and everyone hired in the last 12 months, given a structured induction", target: "100%", objective: ["H4"], weight: 0.15, kind: "PERCENT" },
    ],
    positionMatch: ["head of admin/operations/business development", "head of admin"],
  },
  {
    code: "HOF",
    title: "Head of Finance",
    department: "Admin",
    reportsTo: "CMD",
    purpose: "Turn the work Haven does into cash in the bank, and give the board numbers that reconcile.",
    responsibilities: [
      "Keep accurate books of account and prepare monthly management accounts by the 10th.",
      "Reconcile seen, billed and receipted counts each month, by unit, and report the gap.",
      "Reconcile each HMO account line by line before chasing payment, starting with the two largest balances.",
      "Compute debtor days each month, by payer.",
      "Prepare the annual budget and track spending against it.",
      "Manage cash flow, bank accounts and daily cash and POS reconciliations.",
      "Process payroll, PAYE, pension and other statutory deductions on time.",
      "File tax returns and work with external auditors.",
      "Set and enforce financial controls, including three-way matching of orders, deliveries and invoices.",
    ],
    qualifications: [
      "Bachelor's degree or HND in Accounting, Finance or a related field.",
      "ICAN or ACCA qualification (full or in progress) preferred.",
      "At least 5 years accounting experience, ideally in healthcare or services.",
    ],
    skills: ["Financial reporting", "Budgeting", "Accounting software", "Attention to detail", "Integrity"],
    kpis: [
      { code: "HOF-1", title: "Two largest HMO balances reconciled, undisputed amount collected", target: "By 31 Dec 2026", objective: ["H3"], weight: 0.25, kind: "DONE_BY_DATE" },
      { code: "HOF-2", title: "Debtor days", target: "45 days or less (suggested)", objective: ["H3"], weight: 0.2, kind: "COUNT" },
      { code: "HOF-3", title: "Seen, billed and receipted gap", target: "Reported monthly, closing every month", objective: ["H3"], weight: 0.2, kind: "YES_NO" },
      { code: "HOF-4", title: "Monthly management accounts ready by the 10th", target: "Every month", objective: ["H3"], weight: 0.2, kind: "YES_NO" },
      { code: "HOF-5", title: "EBITDA margin", target: "18% or more", objective: ["H3"], weight: 0.15, kind: "PERCENT" },
    ],
    positionMatch: ["head of finance"],
  },
  {
    code: "ABO",
    title: "Admin and Billing Officer",
    department: "Admin",
    reportsTo: "HOF",
    purpose: "Make sure every service given is billed correctly and paid for, and support general office administration.",
    responsibilities: [
      "Raise patient bills and receipts for consultations, tests, drugs and procedures.",
      "Fill in HMO forms, and prepare, submit and follow up HMO claims and pre-authorisation requests, using clinical details from the treating doctor.",
      "Submit every claim within 7 days of service, and record the reason for every rejection.",
      "Reconcile daily payments (cash, transfer, POS) and hand over to Finance.",
      "Track unpaid bills and HMO debts and follow up until paid.",
      "Keep the price list in the billing system in line with the reviewed tariff.",
      "Handle office admin: correspondence, filing, stationery and supplies.",
    ],
    qualifications: [
      "OND, HND or Bachelor's degree in Accounting, Business Administration or a related field.",
      "At least 2 years experience in billing or admin, ideally with HMOs.",
    ],
    skills: ["Accuracy with numbers", "Excel and billing software", "Organisation", "Follow-up", "Honesty"],
    kpis: [
      { code: "ABO-1", title: "HMO claims submitted within 7 days of service", target: "95% or more", objective: ["H3"], weight: 0.25, kind: "PERCENT" },
      { code: "ABO-2", title: "Rejected claims with the reason recorded", target: "100%", objective: ["H3"], weight: 0.15, kind: "PERCENT" },
      { code: "ABO-3", title: "Daily payments reconciled and handed to Finance", target: "Every day", objective: ["H3"], weight: 0.2, kind: "PERCENT" },
      { code: "ABO-4", title: "HMO claims rejected", target: "5% or less", objective: ["H3"], weight: 0.2, kind: "PERCENT" },
      { code: "ABO-5", title: "Services billed correctly (billing audit)", target: "98% or more", objective: ["H3"], weight: 0.2, kind: "PERCENT" },
    ],
    positionMatch: ["admin and billing officer", "billing officer"],
  },
  {
    code: "CSO",
    title: "Customer Service Officer",
    department: "Admin",
    reportsTo: "HAO",
    purpose: "Give every family a clear, calm visit, and get the details right at the desk so claims do not fail later.",
    responsibilities: [
      "Greet patients, register them with complete payer details, and direct them to the right service.",
      "Get HMO authorisation before the patient is seen.",
      "Collect co-payments and deposits at the desk.",
      "Tell families the expected wait when the clinic runs late, and come back to them at the time promised.",
      "Log every complaint in the complaints register and see it through to resolution.",
      "Run the monthly experience survey with families.",
      "Book and confirm appointments, and answer calls and messages promptly.",
      "Keep patient folders and data confidential.",
    ],
    qualifications: [
      "OND or higher in any field; healthcare front-desk experience is an advantage.",
      "At least 1 year customer service experience.",
    ],
    skills: ["Friendly manner", "Clear communication", "Patience", "Computer literacy", "Confidentiality"],
    kpis: [
      { code: "CSO-1", title: "Complaints resolved within 7 days", target: "90% or more", objective: ["H5"], weight: 0.2, kind: "PERCENT" },
      { code: "CSO-2", title: "Payer details complete and HMO authorisation obtained before consultation", target: "100%", objective: ["H3"], weight: 0.25, kind: "PERCENT" },
      { code: "CSO-3", title: "Co-payments and deposits collected at the desk", target: "98% or more", objective: ["H3"], weight: 0.2, kind: "PERCENT" },
      { code: "CSO-4", title: "Experience survey responses each month", target: "30 or more; score 4.60 or above", objective: ["H5"], weight: 0.15, kind: "COUNT" },
      { code: "CSO-5", title: "Waiting time satisfaction", target: "4.60", objective: ["H5"], weight: 0.2, kind: "SCORE" },
    ],
    positionMatch: ["customer service"],
  },
  {
    code: "BDE",
    title: "Business Development Executive",
    department: "Business Development",
    reportsTo: "HAO",
    purpose: "Bring in referrals, corporate clients and members, with the NICU as the first focus, and judge outreach by the patients it brings in.",
    responsibilities: [
      "Build and work a ranked list of maternity units, obstetricians and clinics around GRA Ikeja.",
      "Log every referral and NICU admission with its referral source, and close the loop with the referring clinician.",
      "Arrange NICU tours and briefings for referrers with Dr Odedina; bring a clinician to referral meetings until confident to hold them alone.",
      "Get Haven onto new HMO panels, and sign corporate and school retainers.",
      "Launch and grow the Haven Club, with enrolment offered at every clinical touch point.",
      "Direct the marketing agency towards booked leads and admissions, not just posts and reach.",
      "Report monthly on referrals, conversions and new business.",
    ],
    qualifications: [
      "Bachelor's degree or HND in Marketing, Business, Mass Communication or a related field.",
      "At least 2 years in sales or business development; healthcare experience is an advantage.",
    ],
    skills: ["Relationship building", "Sales and negotiation", "Presentation", "Social media", "Self-motivation"],
    kpis: [
      { code: "BDE-1", title: "Referrals and NICU admissions logged with their source", target: "100%", objective: ["H2"], weight: 0.2, kind: "PERCENT" },
      { code: "BDE-2", title: "Ranked referrer list worked every week", target: "List by 15 Nov 2026; 5 contacts a week (one each working day)", objective: ["H2"], weight: 0.2, kind: "COUNT" },
      { code: "BDE-3", title: "NICU admissions from referrals", target: "About 5 a month by February", objective: ["H2"], weight: 0.25, kind: "COUNT" },
      { code: "BDE-4", title: "New HMO panels and corporate or school retainers", target: "2 panels and 3 retainers (suggested)", objective: ["H2", "H3"], weight: 0.2, kind: "COUNT" },
      { code: "BDE-5", title: "Haven Club members", target: "On track for 175 at the end of the ramp", objective: ["H5"], weight: 0.15, kind: "COUNT" },
    ],
    positionMatch: ["business development"],
  },
  {
    code: "ATT",
    title: "Attendant",
    department: "Domestic",
    reportsTo: "HAO",
    purpose: "Keep the hospital clean, safe and ready, so a bed or cot is never lost to cleaning.",
    responsibilities: [
      "Clean consulting rooms, wards, the NICU, toilets, reception and common areas to the daily schedule, and sign it off.",
      "Clean and prepare a NICU cot or ward bed within an hour of a discharge.",
      "Change and launder bed linen and keep clean linen stocked.",
      "Sort and dispose of waste correctly, using the colour-coded bins.",
      "Help families move around the hospital, including wheelchair support.",
      "Run errands and move samples, files and supplies between units.",
      "Report broken fittings, spills or safety hazards the same day.",
    ],
    qualifications: [
      "SSCE or equivalent.",
      "Previous cleaning or hospital attendant experience is an advantage.",
      "Training in infection control and waste handling will be given.",
    ],
    skills: ["Cleanliness", "Reliability", "Physical fitness", "Respect for patients", "Following instructions"],
    kpis: [
      { code: "ATT-1", title: "Cleaning schedule completed and signed off", target: "100% of days", objective: ["H1"], weight: 0.2, kind: "PERCENT" },
      { code: "ATT-2", title: "Infection control cleanliness check", target: "90% or more", objective: ["H1"], weight: 0.25, kind: "PERCENT" },
      { code: "ATT-3", title: "Waste sorted into the right bins", target: "100%", objective: ["H1"], weight: 0.2, kind: "PERCENT" },
      { code: "ATT-4", title: "Cot or bed ready after a discharge", target: "Within 1 hour", objective: ["H2"], weight: 0.15, kind: "PERCENT" },
      { code: "ATT-5", title: "Hazards reported", target: "The same day, every time", objective: ["H1"], weight: 0.2, kind: "PERCENT" },
    ],
    positionMatch: ["attendant"],
  },
];

/** The conduct and values section of the appraisal (20%). Scored on the same 0 to 5 scale. */
export const CONDUCT: { code: string; title: string; description: string }[] = [
  {
    code: "C-1",
    title: "Punctuality and attendance",
    description: "Arrives on time for every rostered shift, gives notice of absence, and hands over before leaving.",
  },
  {
    code: "C-2",
    title: "Speaking up and reporting",
    description: "Reports incidents, near misses and broken things the same shift, and raises concerns without waiting to be asked.",
  },
  {
    code: "C-3",
    title: "Teamwork and handover",
    description: "Gives and receives a clear handover, covers for colleagues when needed, and takes part in the daily huddle.",
  },
  {
    code: "C-4",
    title: "Care and respect for families",
    description: "Treats every child and family with warmth and patience, explains clearly, and protects their privacy.",
  },
  {
    code: "C-5",
    title: "Learning",
    description: "Completes the training modules assigned to the role, and keeps licences and certificates current.",
  },
];

/** The scoring scale from Mrs Alli's template. */
export const SCORE_SCALE: { score: number; band: string; label: string }[] = [
  { score: 5, band: "100% or more of target", label: "Exceeded" },
  { score: 4, band: "80 to 99% of target", label: "Achieved" },
  { score: 3, band: "60 to 79% of target", label: "Mostly achieved" },
  { score: 2, band: "50 to 59% of target", label: "Partly achieved" },
  { score: 1, band: "40 to 49% of target", label: "Started" },
  { score: 0, band: "Below 40%, or not achieved", label: "Not achieved" },
];

export const SECTION_WEIGHTS = { kpis: 0.8, conduct: 0.2 };

/** The role for a StaffMember.position. The longest matching string wins. */
export function roleForPosition(position: string): RoleDef | undefined {
  const pos = position.toLowerCase();
  let best: { role: RoleDef; len: number } | undefined;
  for (const role of HAVEN_ROLES) {
    for (const m of role.positionMatch) {
      if (pos.includes(m) && (!best || m.length > best.len)) best = { role, len: m.length };
    }
  }
  return best?.role;
}
