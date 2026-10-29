// The shape of the Arabella information request, shared by the client-facing
// project page and the uploader so the two cannot disagree about what was
// asked for.
//
// Source of truth for the wording is
// docs/arabella/arabella-audit-information-request-cfa.md. Section letters here
// must match the "## X." headings in that document.

export const ARABELLA_ENGAGEMENT = "arabella";

export type RequestSection = {
  /** Letter as it appears in the document, or a pseudo-section. */
  key: string;
  title: string;
  /** One line telling the uploader what actually belongs here. */
  hint: string;
};

/** What has arrived, so the page thanks people for it rather than asking again. Update as things land. */
export const RECEIVED: { what: string; status: "in" | "partly"; note: string }[] = [
  { what: "Company certificate", status: "in", note: "RC 1802696, incorporated June 2021" },
  { what: "Sales record, January to September 2026", status: "in", note: "Covers part of the income the bank statements show, so item 1 below asks for the billing export" },
  { what: "Bank statements", status: "partly", note: "First Bank (both accounts) and GTB are in. Access is still to come" },
  { what: "Expense sheets for both entities", status: "in", note: "Item 7 asks for the full line-item ledger behind them" },
  { what: "Price list, staff list, pharmacy stock register", status: "in", note: "" },
  { what: "HMO list, tariffs and contracts", status: "partly", note: "Leadway, AXA Mansard and Allianz tariffs; Reliance and Allianz agreements" },
  { what: "Maternity, laboratory and fertility notes", status: "in", note: "" },
  { what: "Registration pack and practising licences", status: "in", note: "" },
  { what: "Patient list", status: "in", note: "4,379 records" },
];

/**
 * The eight we need next, after the first uploads. Ordered as in the
 * document. Kept as PRIORITY_EIGHT so the admin page's chase list follows.
 */
export const PRIORITY_EIGHT: { n: number; what: string; why: string; section: string }[] = [
  { n: 1, section: "C", what: "Bank statements for the GTB and Access accounts, last 12 months (First Bank is in, thank you)", why: "The only way to confirm that what the record says came in reached the bank" },
  { n: 2, section: "E", what: "Monthly costs, last 12 months: salaries, rent, power, drugs bought, tests sent out", why: "Without costs nobody can say which services make money" },
  { n: 3, section: "D", what: "For each HMO and company account: tariff, contract, and what it owes today", why: "Insurers paid under 2% of this year's takings" },
  { n: 4, section: "F", what: "Fertility: who does the embryology, cycles started this year, and the price of a cycle", why: "Fertility brought in \u20A66m and is not on the price list or the staff list" },
  { n: 5, section: "F", what: "Laboratory: tests done on site and sent out, to whom, and the cost of each", why: "The largest line in the sales record, at 30%" },
  { n: 6, section: "F", what: "Maternity this year: women booked, babies delivered here, and those who delivered elsewhere", why: "Two to four packages in nine months, against where the brand is pointed" },
  { n: 7, section: "B", what: "The facility registration certificate, and the name it is in", why: "Whether it covers what is delivered, and whether it moves to Arabella" },
  { n: 8, section: "D", what: "Prices for the laparoscopic procedures marked TBD", why: "Surgery cannot be quoted without a price" },
];

/**
 * The additional request of 28 October 2026, after the data review. Numbered
 * as in docs/arabella/arabella-data-review-and-request-cfa.md, section 4. Each
 * item is its own upload tag (R1 to R21) so the admin page can chase by item.
 * Wording here is for a page the whole team can open, so it names no amounts.
 */
export const ADDITIONAL_REQUEST: { group: string; items: { n: number; what: string; first?: boolean }[] }[] = [
  {
    group: "Income and patients",
    items: [
      { n: 1, first: true, what: "A billing export from the records system, January to October 2026, both sites, one row per item: patient number, date, service, payer, amount billed, amount paid, payment channel" },
      { n: 2, first: true, what: "Which sites and bank accounts the sales record covers, and whether Asokoro collections are in it" },
      { n: 3, first: true, what: "The Access Bank statement, January 2025 to date, and any other account, POS terminal or wallet that receives patient payments" },
      { n: 4, what: "The cash book, or a note of how cash is recorded and banked" },
      { n: 5, what: "First Bank merchant settlement reports for 2026, to reconcile POS income" },
      { n: 6, what: "What the regular monthly receipt of \u20A6395,500 from March to September is" },
    ],
  },
  {
    group: "Costs and funding",
    items: [
      { n: 7, first: true, what: "A complete expense ledger for both entities, January to October 2026, from the line items, with each line marked operating or capital" },
      { n: 8, first: true, what: "Payroll schedules, January to October 2026, names and amounts, from both accounts" },
      { n: 9, what: "A register of the funds put into the business in 2025 and 2026, with the terms of each" },
      { n: 10, what: "Source documents and terms for the large receipts listed in our email of 21 October, and what the payments that followed were for" },
      { n: 11, what: "The statement for the February investment placement, and invoices or an asset register for the April and June equipment purchases" },
    ],
  },
  {
    group: "Maternity and clinical services",
    items: [
      { n: 12, first: true, what: "The antenatal booking register for 2026: booking date, package, payments, expected date of delivery, place of delivery, and the reason where known" },
      { n: 13, what: "What the January to March \u201Cpackages\u201D payments of \u20A645,000 to \u20A650,000 were" },
      { n: 14, what: "Fertility: the partner laboratory agreement, the invoice for the March case, and the number of cases in 2025 and 2026" },
    ],
  },
  {
    group: "Registration, licensing and people",
    items: [
      { n: 15, what: "The 2026 renewal certificate, or the committee\u2019s written status on the Remita payment, and the 2025 certificate" },
      { n: 16, what: "Any committee approval or inspection report for 37 Nelson Mandela Street, Asokoro, and whether the Jabi site is still open" },
      { n: 17, what: "Licences and specialist qualifications for the visiting consultants (obstetrics and gynaecology, anaesthesia, surgery), their sessional letters, and the name of the maternity lead" },
      { n: 18, what: "The pharmacist arrangement and licence, the laboratory scientist\u2019s licence, licences for the locum nurses and nurse anaesthetist, and any midwifery registrations" },
      { n: 19, what: "The current professional indemnity policy" },
    ],
  },
  {
    group: "Insurers",
    items: [
      { n: 20, what: "A claims list by insurer: submitted, approved, paid and outstanding, January to October 2026" },
      { n: 21, what: "The countersigned Allianz Partners agreement with its annexes, the Reliance tariff, and the signed agreements or provider letters for Leadway, AXA Mansard, Clearline, Henner and ECOWAS" },
    ],
  },
];

export const ADDITIONAL_ITEMS = ADDITIONAL_REQUEST.flatMap((g) => g.items);

export const REQUEST_SECTIONS: RequestSection[] = [
  { key: "A", title: "The company and the change of name", hint: "CAC status report, Tabitha's registration and closure, what still sits in Tabitha's name, governance, loans" },
  { key: "B", title: "Licences, insurance and compliance", hint: "Facility registration, practising licences, fertility, pharmacy and laboratory registrations, indemnity, waste, data protection" },
  { key: "C", title: "Money in", hint: "Sales record for October to December 2025, bank statements, the two largest payments, registrations, cash handling" },
  { key: "D", title: "Prices, packages and who pays", hint: "Missing prices, what packages include, HMO tariffs and contracts, what insurers and companies owe" },
  { key: "E", title: "Money out", hint: "Monthly costs, payroll, purchases, tests sent out, the cafe, marketing spend, management accounts" },
  { key: "F", title: "How each service runs", hint: "Maternity, fertility, surgery, laboratory, pharmacy and wellness: activity, staffing and costs" },
  { key: "G", title: "Clinical safety", hint: "Emergency protocols and drills, consent forms, incidents, sterilisation, infection prevention, complaints" },
  { key: "H", title: "Patients and where they come from", hint: "Privacy notices and opt-outs, follow-up booking, the patient journey, referrers, enquiries, HERcast" },
  { key: "I", title: "People", hint: "Contracts, rota, cover, leavers, training, and how tasks are given out and checked" },
  { key: "J", title: "Systems and records", hint: "Every system and who administers it, backups, access, devices, the website and ad accounts" },
];

/** Sections offered in the uploader, priority first and a catch-all last. */
export const UPLOAD_SECTIONS: RequestSection[] = [
  ...ADDITIONAL_ITEMS.map((i) => ({ key: `R${i.n}`, title: `Item ${i.n}: ${i.what.split(/[,:]/)[0]}`, hint: i.what })),
  { key: "priority", title: "One of the earlier eight", hint: "Bank statements, costs, HMO amounts owed, fertility, laboratory, maternity, registration, missing prices" },
  ...REQUEST_SECTIONS,
  { key: "other", title: "Something else", hint: "Anything you think we should see that we did not ask for" },
];

export const sectionLabel = (key: string): string => {
  if (key === "priority") return "Priority items";
  if (key === "other") return "Other";
  const r = /^R(\d+)$/.exec(key);
  if (r) return `Item ${r[1]} (October request)`;
  const s = REQUEST_SECTIONS.find((x) => x.key === key);
  return s ? `${s.key}. ${s.title}` : key;
};

export const SURVEYS = [
  {
    href: "/arabella-staff-survey.html",
    who: "Everyone who works at Arabella",
    title: "Staff survey",
    blurb: "How the place actually runs on a busy day, whether people can speak up, and what gets in the way. Anonymous, and the answers come to Consult for Africa rather than to management.",
    minutes: "10 minutes",
    tag: "Anonymous",
  },
  {
    href: "/arabella-patient-survey.html",
    who: "Patients seen in the last year",
    title: "Patient survey",
    blurb: "Booking and access, how things were explained, the cost conversation, the care itself, and whether they would send a friend or a sister. Anonymous.",
    minutes: "5 minutes",
    tag: "Anonymous",
  },
  {
    href: "/arabella-referrer-survey.html",
    who: "GPs, physiotherapists and diagnostic centres",
    title: "Referring colleagues",
    blurb: "What colleagues want from a women's health service, what they get back today, and what would make them refer more. Please forward this one widely.",
    minutes: "6 minutes",
    tag: "Please forward",
  },
  {
    href: "/arabella-leadership-survey.html",
    who: "Dr Chito and the senior team",
    title: "Leadership direction",
    blurb: "Where each of you thinks the business should go, and where you disagree without knowing it. Answered in your own name, on purpose.",
    minutes: "10 minutes",
    tag: "In your name",
  },
];

export const DOCUMENTS = [
  {
    href: "/arabella/arabella-audit-information-request-cfa.pdf",
    title: "Information and data request",
    pages: "7 pages",
    blurb: "What has come in, the eight we need next, and the full list in ten sections. Revised 9 October.",
  },
];
