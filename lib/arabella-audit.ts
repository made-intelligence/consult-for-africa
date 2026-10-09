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
  { what: "Sales record, January to September 2026", status: "in", note: "Still to come: October to December 2025" },
  { what: "Price list", status: "partly", note: "Laparoscopic and fertility prices still to come" },
  { what: "HMO list", status: "partly", note: "Tariffs, contracts and amounts owed still to come" },
  { what: "Staff list", status: "in", note: "Roles, days and reporting lines" },
  { what: "Pharmacy stock register", status: "partly", note: "Unit costs still to come" },
  { what: "Patient list", status: "in", note: "4,379 records" },
];

/**
 * The eight we need next, after the first uploads. Ordered as in the
 * document. Kept as PRIORITY_EIGHT so the admin page's chase list follows.
 */
export const PRIORITY_EIGHT: { n: number; what: string; why: string; section: string }[] = [
  { n: 1, section: "C", what: "Bank statements for every account the practice is paid into, last 12 months", why: "The only way to confirm that what the record says came in reached the bank" },
  { n: 2, section: "E", what: "Monthly costs, last 12 months: salaries, rent, power, drugs bought, tests sent out", why: "Without costs nobody can say which services make money" },
  { n: 3, section: "D", what: "For each HMO and company account: tariff, contract, and what it owes today", why: "Insurers paid under 2% of this year's takings" },
  { n: 4, section: "F", what: "Fertility: who does the embryology, cycles started this year, and the price of a cycle", why: "Fertility brought in \u20A66m and is not on the price list or the staff list" },
  { n: 5, section: "F", what: "Laboratory: tests done on site and sent out, to whom, and the cost of each", why: "The largest line in the sales record, at 30%" },
  { n: 6, section: "F", what: "Maternity this year: women booked, babies delivered here, and those who delivered elsewhere", why: "Two to four packages in nine months, against where the brand is pointed" },
  { n: 7, section: "B", what: "The facility registration certificate, and the name it is in", why: "Whether it covers what is delivered, and whether it moves to Arabella" },
  { n: 8, section: "D", what: "Prices for the laparoscopic procedures marked TBD", why: "Surgery cannot be quoted without a price" },
];

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
  { key: "priority", title: "One of the eight we need next", hint: "Bank statements, costs, HMO amounts owed, fertility, laboratory, maternity, registration, missing prices" },
  ...REQUEST_SECTIONS,
  { key: "other", title: "Something else", hint: "Anything you think we should see that we did not ask for" },
];

export const sectionLabel = (key: string): string => {
  if (key === "priority") return "Priority items";
  if (key === "other") return "Other";
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
