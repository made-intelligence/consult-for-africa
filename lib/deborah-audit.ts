// The shape of the Deborah information request, shared by the client-facing
// project page, the uploader and the internal tracker so the three cannot
// disagree about what was asked for.
//
// Modelled on lib/ethereal-audit.ts. Section letters here must stay in step
// with the SECTIONS regex in app/api/deborah-audit/upload/route.ts (A..N).
//
// Client: Deborah Multi-Specialist Hospital and Diagnostics, Km 10 Airport
// Road, Oba-Ile, Akure. A 50-bed private tertiary hospital with MRI, a 64-slice
// CT, mammography, endoscopy and dialysis. Founder and CEO Chief (Mrs)
// Remilekun Ibidapo; the request came through Tobi Koyejo. Not yet visited.

export const DEB_ENGAGEMENT = "deborah";

export type RequestSection = {
  /** Letter as it appears in the document, or a pseudo-section. */
  key: string;
  title: string;
  /** One line telling the uploader what actually belongs here. */
  hint: string;
};

/** The nine that turn a tour into an audit. Ordered by what unlocks the most. */
export const PRIORITY_NINE: { n: number; what: string; why: string; section: string }[] = [
  { n: 1, section: "C", what: "Management accounts or the income and expenditure record, monthly, last 12 months", why: "What the hospital earns, and what it costs to stand still" },
  { n: 2, section: "C", what: "Bank statements for all business accounts, last 6 months", why: "The only unarguable record of what actually came in" },
  { n: 3, section: "F", what: "Outpatient visits, admissions and bed occupancy by month, last 12 months", why: "How full the hospital is, and which wards carry it" },
  { n: 4, section: "G", what: "MRI, CT, mammography, endoscopy and dialysis volumes by month, with the service contract for each machine", why: "The equipment is the asset, and utilisation is where the return is" },
  { n: 5, section: "E", what: "The HMOs, NHIA and state scheme arrangements you are on, with tariffs and claims-settlement history", why: "Yield is decided here" },
  { n: 6, section: "I", what: "Consultants who practise here, salaried or visiting, with MDCN numbers and sessions per week", why: "Who actually sees the patients, and where the gaps are" },
  { n: 7, section: "H", what: "The current price card, including imaging, dialysis and package rates", why: "We cannot judge yield without knowing the list" },
  { n: 8, section: "D", what: "Billings and collections by month, split by payer and self-pay, last 12 months", why: "How much of what is billed actually converts to cash" },
  { n: 9, section: "B", what: "Ondo State facility registration and licence, and the NNRA authorisation for the CT and X-ray", why: "The licences the whole engagement is built on" },
];

export const REQUEST_SECTIONS: RequestSection[] = [
  { key: "A", title: "The company, ownership and how decisions get made", hint: "CAC documents, shareholding, board or management notes, loans and equipment finance, and who signs" },
  { key: "B", title: "Licensing, regulatory standing and insurance", hint: "Ondo State Ministry of Health registration and facility licence, NNRA authorisation, MDCN, nursing, MLSCN and PCN licences, indemnity cover, clinical-waste contract" },
  { key: "C", title: "Money, in and out", hint: "Management accounts, bank statements, trial balance, asset register, monthly fixed costs including power and diesel, and loan repayments" },
  { key: "D", title: "Billings, collections and receivables", hint: "Billings and collections by month, by payer and self-pay, claims ageing, denials with reasons, days to payment" },
  { key: "E", title: "Who pays: the payer panel", hint: "HMOs, NHIA, the Ondo State contributory scheme and corporate retainers, with the tariff or contract for each and any debtor position" },
  { key: "F", title: "Activity and occupancy", hint: "Outpatient and emergency visits, admissions, bed occupancy and length of stay by ward, deliveries, surgical cases, and referrals out" },
  { key: "G", title: "Diagnostics, dialysis and equipment", hint: "MRI, CT, mammography, endoscopy, X-ray, ultrasound, laboratory and dialysis volumes by month, uptime, service contracts, who reports the scans, and who refers in" },
  { key: "H", title: "Price card and how a quote is built", hint: "Self-pay price list, imaging and dialysis rates, surgical and maternity packages, and any corporate rates" },
  { key: "I", title: "Consultants and clinical staffing", hint: "Who practises here, MDCN numbers, salaried versus visiting, sessions per week, and fee-split arrangements" },
  { key: "J", title: "Clinical governance, outcomes and safety", hint: "Consent forms, incident and complication register, maternal and neonatal outcomes, protocols and any outcome measures" },
  { key: "K", title: "People", hint: "Staff list, payroll, contracts, rota, joiners and leavers" },
  { key: "L", title: "Systems, records and premises", hint: "Records and billing systems and what they export, equipment register, title or lease, floor plan, power, generator and water" },
  { key: "M", title: "Brand, referral and demand", hint: "Website and social analytics, marketing spend, referring doctors and hospitals, the partner hospitals abroad, and diaspora enquiries" },
  { key: "N", title: "Where you want to take it", hint: "Services you want to add or grow, and where the family wants the hospital in three years. Notes or a conversation are fine" },
];

/** Sections offered in the uploader, priority first and a catch-all last. */
export const UPLOAD_SECTIONS: RequestSection[] = [
  { key: "priority", title: "One of the nine priority items", hint: "The nine we need first" },
  ...REQUEST_SECTIONS,
  { key: "other", title: "Something else", hint: "Anything you think we should see that we did not ask for" },
];

export const sectionLabel = (key: string): string => {
  if (key === "priority") return "Priority nine";
  if (key === "other") return "Other";
  const s = REQUEST_SECTIONS.find((x) => x.key === key);
  return s ? `${s.key}. ${s.title}` : key;
};
