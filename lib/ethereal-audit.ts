// The shape of the Ethereal information request, shared by the client-facing
// project page, the uploader and the internal tracker so the three cannot
// disagree about what was asked for.
//
// Modelled on lib/dennis-ashley-audit.ts. Section letters here must stay in step
// with the SECTIONS regex in app/api/ethereal-audit/upload/route.ts (A..N).
//
// Client: Ethereal Healthcare Centre, 16 Osun Crescent, Maitama, Abuja. A
// licensed, equipped hospital with a theatre, beds and a broad department list,
// running below its potential. No on-site ICU: high-acuity cases escalate to a
// hospital that has one. Owner and signer unverified at time of writing.

export const ETH_ENGAGEMENT = "ethereal";

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
  { n: 3, section: "G", what: "Theatre count and certification, real bed count, and the escalation agreement for high-acuity cases", why: "The theatre is the asset, and with no on-site ICU the escalation route is the safety case" },
  { n: 4, section: "E", what: "The HMOs you are on, with the tariff or contract and claims-settlement history for each, Leadway included", why: "Yield is decided here, and an already-accredited theatre removes the slowest step" },
  { n: 5, section: "F", what: "Theatre lists and surgical cases by month, last 12 months, against the sessions available", why: "Utilisation is the profit driver and the theatre is the scarce input" },
  { n: 6, section: "I", what: "Which surgeons operate here now, with MDCN numbers, and how many lists run in a week", why: "Establishment against service, and who is actually cutting" },
  { n: 7, section: "H", what: "The current price card, and how a consultation and a surgical case are quoted", why: "We cannot judge yield without knowing the list" },
  { n: 8, section: "D", what: "Billings and collections by month, split by payer and self-pay, last 12 months", why: "How much of what is billed actually converts to cash" },
  { n: 9, section: "B", what: "FCT Health Services registration, the current facility licence and theatre certification", why: "The licence the whole engagement is built on" },
];

export const REQUEST_SECTIONS: RequestSection[] = [
  { key: "A", title: "The company, ownership and how decisions get made", hint: "CAC documents, shareholding, any shareholders' agreement, board or management notes, loans, and who signs" },
  { key: "B", title: "Licensing, regulatory standing and insurance", hint: "FCT Health Services registration, facility licence, theatre certification, MDCN and nursing licences, NAFDAC where drugs are held, indemnity cover, clinical-waste contract" },
  { key: "C", title: "Money, in and out", hint: "Management accounts, bank statements, trial balance, asset register, monthly fixed costs including power and diesel" },
  { key: "D", title: "Billings, collections and receivables", hint: "Billings and collections by month, by payer and self-pay, claims ageing, denials with reasons, days to payment" },
  { key: "E", title: "Who pays: the payer panel", hint: "The HMOs you are on, the tariff or contract for each, claims performance and any debtor position, Leadway in particular" },
  { key: "F", title: "Activity and capacity", hint: "Consultation and admission volumes by department, theatre lists and surgical cases by month against sessions, no-shows and cancellations" },
  { key: "G", title: "The theatre, beds and escalation", hint: "Theatre count and certification, real bed count and recovery bay, sterilisation and CSSD, anaesthetic cover, and the escalation agreement for high-acuity cases given no on-site ICU" },
  { key: "H", title: "Price card and how a quote is built", hint: "Self-pay price list, surgical and procedure bundles, and any published corporate or package rates" },
  { key: "I", title: "Surgeons, consultants and clinical staffing", hint: "Who operates here, MDCN numbers, lists per week, visiting versus salaried consultants, and fee-split arrangements" },
  { key: "J", title: "Clinical governance, outcomes and safety", hint: "Consent forms, incident and complication register, adverse events, follow-up, protocols and any outcome measures" },
  { key: "K", title: "People", hint: "Staff list, payroll, contracts, rota, joiners and leavers, and opening hours" },
  { key: "L", title: "Systems, records and premises", hint: "Records, practice-management and billing systems and what they export, patient-database size, equipment register, lease or title, floor plan, power and generator cover" },
  { key: "M", title: "Brand, referral and demand", hint: "Website analytics, marketing spend, referral sources and records, and the Ethereal Aesthetics arm" },
  { key: "N", title: "Where you want to take it", hint: "Service lines advertised but not yet running at volume, and where the board wants to take the hospital. Notes or a conversation are fine" },
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

/** No client-facing surveys for this engagement yet. */
export const SURVEYS: {
  href: string; who: string; title: string; blurb: string; minutes: string; tag: string;
}[] = [];
