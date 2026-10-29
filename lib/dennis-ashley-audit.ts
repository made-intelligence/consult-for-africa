// The shape of the Dennis Ashley information request, shared by the
// client-facing project page, the uploader and the internal tracker so the
// three cannot disagree about what was asked for.
//
// Modelled on lib/osteon-audit.ts. Section letters here must stay in step with
// the SECTIONS regex in app/api/dennis-ashley-audit/upload/route.ts (A..P).
//
// Client: Dennis Ashley Medical Clinic & Endoscopy Suites (Oniru, Victoria
// Island, Lagos).
//
// Revised 13 Oct 2026 after the first two documents (the May 2026 board pack
// and the visit log). The sections are cut so every document has exactly one
// home: the company, then the money (results, then cash and obligations), then
// revenue by who pays (self-pay, HMO, corporate), then activity and delivery
// cost by service line (the five lines the board pack reports), then people,
// premises and systems, licences and clinical governance, demand, direction.
// Prices sit with the payer they apply to; clinician terms sit under people;
// regulator-issued documents sit under licences, the operating records under
// the service line that keeps them.

export const DA_ENGAGEMENT = "dennis-ashley";

export type RequestSection = {
  /** Letter as it appears in the document, or a pseudo-section. */
  key: string;
  title: string;
  /** One line telling the uploader what actually belongs here. */
  hint: string;
};

/** What has come in, so the team can see it landed and not send it twice. */
export const RECEIVED: { what: string; section: string }[] = [
  { section: "B", what: "Board pack of 19 May 2026: 2025 and 2024 year end, Q1 2026 and Q1 2025, by department" },
  { section: "G", what: "Visit log, March 2025 to October 2026: virtual consultations and endoscopy" },
  { section: "G", what: "Monthly activity for 2026: GP, endoscopy and pharmacy visits by type and funder" },
];

/** What we need next, ordered by what unlocks the most. */
export const PRIORITY: { n: number; what: string; why: string; section: string }[] = [
  { n: 1, section: "C", what: "Bank statements for every business account, January 2025 to date", why: "The record every other figure is checked against" },
  { n: 2, section: "B", what: "Monthly management accounts or trial balance for 2025 and 2026 to date, and how overheads are split between departments", why: "The board pack is annual and quarterly; we need the months, and the basis of the 80/10/10 split" },
  { n: 3, section: "M", what: "The lease, title or other arrangement for the Landmark Towers space, and who pays the rent and service charge", why: "No rent appears in the accounts, so we need to know how the premises are held" },
  { n: 4, section: "H", what: "Every endoscopy since January 2024: date, procedure, who performed it, what they were paid, and the consumables and histology used", why: "To see what a procedure really costs once the doctor and materials are counted" },
  { n: 5, section: "E", what: "Each HMO and insurer you are contracted with: the contract, the tariff, and claims submitted, paid and refused since January 2025", why: "The visit log shows few HMO patients; we need the whole panel" },
  { n: 6, section: "F", what: "Corporate clients, current and past, including Stanbic: lives covered, scope, annual value, and when and why any ended", why: "What replaced the largest endoscopy client, and what can be won back" },
  { n: 7, section: "K", what: "Ambulance work in 2025: each job, the client, what was charged, what the provider was paid, and the provider contract", why: "The largest line in 2025 and nil in Q1 2026; we need to know why" },
  { n: 8, section: "L", what: "Staff list with role, start date, pay and days worked, plus payroll by month since January 2024", why: "Salaries roughly doubled in clinic and pharmacy in 2025" },
  { n: 9, section: "G", what: "The same monthly activity summary for 2024 and 2025", why: "One year of activity cannot show a trend, and 2025 is the year the accounts cover" },
];

export const REQUEST_SECTIONS: RequestSection[] = [
  { key: "A", title: "Ownership and governance", hint: "CAC documents, shareholding, shareholders' agreement, board minutes, and any arrangement with a shareholder or related company" },
  { key: "B", title: "Financial results", hint: "Audited accounts for the last three years, monthly management accounts or trial balance, the basis of the overhead split, and billings and collections by month split by self-pay, HMO and corporate" },
  { key: "C", title: "Cash and what the business owes", hint: "Bank statements, loans and other financing, what is owed to suppliers, and tax filings (CIT, VAT, PAYE) with any assessments or penalties" },
  { key: "D", title: "Self-pay patients", hint: "The self-pay price list and packages, discount and waiver practice, deposits, and balances patients still owe" },
  { key: "E", title: "HMOs and insurers", hint: "Each payer you are contracted with: the contract, the tariff, claims submitted, paid and refused, and what each still owes, by age" },
  { key: "F", title: "Corporate clients", hint: "Current and past employee-health contracts: client, lives, scope, price, annual value, renewal date, what each owes, and proposals in progress" },
  { key: "G", title: "Clinic and virtual consultations", hint: "Consultations by month, in person and virtual, new and returning, by doctor; clinic hours and sessions; no-shows and cancellations; ECG and other in-clinic tests" },
  { key: "H", title: "Endoscopy", hint: "Procedures by type and month, lists available against lists used, who performs and anaesthetises, consumables and histology per case, scope and stack inventory, reprocessing and AER validation records" },
  { key: "I", title: "Laboratory", hint: "Tests by month, which tests go to which laboratory (Lancet, Afriglobal or others), the agreement and price per test with each, and turnaround times" },
  { key: "J", title: "Pharmacy", hint: "Sales and customers by month, supplier list and prices, stock on hand, stock-takes, expiries and write-offs" },
  { key: "K", title: "Ambulance and other services", hint: "Ambulance jobs by client and month, what was charged and what the provider was paid, the provider contract, and what MERC was and why it stopped" },
  { key: "L", title: "People", hint: "Staff list, payroll by month, contracts, rota, joiners and leavers, and the terms for visiting and UK-based consultants: fee or split, and how often they come" },
  { key: "M", title: "Premises, equipment and systems", hint: "Lease or title, rent and service charge and who pays them, floor plan, power, equipment register other than the endoscopy stack, and the EMR and billing systems and what they export" },
  { key: "N", title: "Licences, insurance and clinical governance", hint: "HEFAMAA, MDCN, nursing, pharmacy and any ambulance licences, indemnity cover, clinical-waste contract, consent forms, protocols, and the incident and complication register" },
  { key: "O", title: "Demand and marketing", hint: "How patients find you, referral sources and referring doctors, website and social analytics, marketing spend, and the size of the patient database" },
  { key: "P", title: "Where you want to take it", hint: "Service lines planned but not yet launched, and where the board wants the clinic to go. Notes or a conversation are fine" },
];

/** Sections offered in the uploader, priority first and a catch-all last. */
export const UPLOAD_SECTIONS: RequestSection[] = [
  { key: "priority", title: "One of the priority items", hint: "The items we need first" },
  ...REQUEST_SECTIONS,
  { key: "other", title: "Something else", hint: "Anything you think we should see that we did not ask for" },
];

export const sectionLabel = (key: string): string => {
  if (key === "priority") return "Priority items";
  if (key === "other") return "Other";
  const s = REQUEST_SECTIONS.find((x) => x.key === key);
  return s ? `${s.key}. ${s.title}` : key;
};

/** The four audit surveys, linked from the client project page. */
export const SURVEYS = [
  {
    href: "/dennis-ashley-staff-survey.html",
    who: "Everyone who works at Dennis Ashley",
    title: "Staff survey",
    blurb: "How the clinic and the endoscopy suite actually run on a busy day, and whether people can speak up. Anonymous, and the answers come to Mezo rather than to management.",
    minutes: "10 minutes",
    tag: "Anonymous",
  },
  {
    href: "/dennis-ashley-patient-survey.html",
    who: "Patients seen in the last year",
    title: "Patient survey",
    blurb: "Access, the consultation, the cost and HMO conversation, the endoscopy experience, and whether they would send someone else. Anonymous.",
    minutes: "5 minutes",
    tag: "Anonymous",
  },
  {
    href: "/dennis-ashley-referrer-survey.html",
    who: "Doctors, clinics and corporate partners",
    title: "Referring colleagues",
    blurb: "What colleagues and corporate buyers want from an endoscopy, diagnostics and wellness partner, what they get back today, and what would make them refer more. Please forward this one widely.",
    minutes: "6 minutes",
    tag: "Please forward",
  },
  {
    href: "/dennis-ashley-leadership-survey.html",
    who: "Dr Oti and the board",
    title: "Leadership direction",
    blurb: "Where each of you thinks the clinic should go, and where you disagree without knowing it. Answered in your own name, on purpose.",
    minutes: "10 minutes",
    tag: "In your name",
  },
];
