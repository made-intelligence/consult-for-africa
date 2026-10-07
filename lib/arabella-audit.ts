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

/** The eight that turn a walkthrough into an audit. Ordered as in the document. */
export const PRIORITY_EIGHT: { n: number; what: string; why: string; section: string }[] = [
  { n: 1, section: "A", what: "Arabella's certificate of incorporation, RC number and CAC status report", why: "Nothing in the payer workstream can begin without it, and every introduction letter quotes it" },
  { n: 2, section: "G", what: "The list of Tabitha's HMO panels, with tariff schedules and the contact at each", why: "The most valuable asset in the transition, and the hardest to rebuild if it is lost" },
  { n: 3, section: "D", what: "The revenue record, monthly, last 12 months, by service line and by payer", why: "This becomes the agreed baseline, and the baseline is what every later judgement is measured against" },
  { n: 4, section: "D", what: "Bank statements for every business account, last 6 months", why: "The only unarguable record of what came in, as opposed to what was invoiced" },
  { n: 5, section: "F", what: "The price list and package architecture: maternity, gynaecology surgery, fertility", why: "We cannot see yield or leakage without knowing the list" },
  { n: 6, section: "H", what: "The patient database export, in whatever form it exists", why: "The reactivation case rests on it, and its quality is unknown until we open it" },
  { n: 7, section: "K", what: "Full staff list with role, employment type, days worked and reporting line", why: "Establishment against service is where specialist centres quietly fail" },
  { n: 8, section: "C", what: "Facility registration and licences, including for the fertility service", why: "Category registered against service delivered is a live exposure, and worse in a new entity" },
];

export const REQUEST_SECTIONS: RequestSection[] = [
  { key: "A", title: "The two entities, and what the succession rests on", hint: "CAC documents for both, any transfer or novation agreement, what moved and what did not, and who holds the patient records" },
  { key: "B", title: "Ownership, governance and how decisions get made", hint: "Shareholding, directors, bank mandate, who signs off what, loans and director's money in" },
  { key: "C", title: "Licensing, regulatory standing and insurance", hint: "Facility registration, MDCN and nursing licences, the fertility service and its laboratory, indemnity, waste, data protection" },
  { key: "D", title: "Money, in and out", hint: "Management accounts, bank statements, trial balance, asset register, the monthly fixed cost run rate" },
  { key: "E", title: "The service ledger", hint: "One row per episode: service, payer, quoted, invoiced, collected, direct cost, outcome. Maternity, surgery and fertility each have their own counts" },
  { key: "F", title: "Pricing and the package architecture", hint: "The price list, what a maternity package includes and excludes, how a quote is built, and quotes that did not convert" },
  { key: "G", title: "Payers: HMO, corporate and self pay", hint: "Panels and tariffs, receivables ageing, rejections and their reasons, the authorisation process, corporate accounts" },
  { key: "H", title: "The patient database and the right to contact it", hint: "The export and its fields, how it was built, what patients were told, and anyone who asked not to be contacted" },
  { key: "I", title: "Clinical governance, safety and the patient journey", hint: "Protocols for the emergencies that actually happen, consent forms, incidents, the escalation route, and the journey as it runs" },
  { key: "J", title: "Pharmacy, stock and the formulary", hint: "Stock list with expiry, purchases, margin, stockouts, cold chain, and when it was last physically counted" },
  { key: "K", title: "People", hint: "Staff list, organogram, contracts, rota, turnover, training, and how tasks are assigned and checked today" },
  { key: "L", title: "Technology, records and information security", hint: "Every system and who administers it, backups and the last restore test, access control, devices, the website and ad accounts" },
  { key: "M", title: "Brand, marketing and what has already been tried", hint: "Brand assets for both names, social accounts, HERcast, marketing spend and what it produced, and who refers patients today" },
];

/** Sections offered in the uploader, priority first and a catch-all last. */
export const UPLOAD_SECTIONS: RequestSection[] = [
  { key: "priority", title: "One of the eight priority items", hint: "The eight we need before Friday" },
  ...REQUEST_SECTIONS,
  { key: "other", title: "Something else", hint: "Anything you think we should see that we did not ask for" },
];

export const sectionLabel = (key: string): string => {
  if (key === "priority") return "Priority eight";
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
    pages: "10 pages",
    blurb: "Everything we have asked for, section by section, with the eight that matter before Friday at the front and a week by week view of the first fortnight at the back.",
  },
];
