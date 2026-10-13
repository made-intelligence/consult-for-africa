/**
 * The terms a client accepts before their roles reach their dashboard.
 *
 * The protection is in the order: a client sees nobody until these are
 * accepted, and contact details only ever pass through a contact request the
 * professional accepts, which is logged against the client. The version is
 * stamped on every acceptance so a later edit cannot be read back onto an
 * earlier one.
 *
 * The client chooses one of two fee bases (Debo, 13 Oct 2026): a fixed fee per
 * placement whatever the pay, or a percentage of first-year gross. The rate
 * card runs 8 to 15 per cent; digital health organisations get the network
 * rate near the bottom of it, shown against the standard so the discount is
 * seen as one.
 */
export const INTRO_TERMS_VERSION = "2026-10-13";

export const STANDARD_FEE_PERCENT = 15;
export const NETWORK_FEE_PERCENT = 8;
export const FIXED_FEE = "USD 5,000";

export const FEE_OPTIONS = [
  { value: "fixed", label: `A fixed fee of ${FIXED_FEE} per person engaged, whatever they are paid`, short: `fixed ${FIXED_FEE} per placement` },
  { value: "percent", label: `${NETWORK_FEE_PERCENT} per cent of first-year gross remuneration, our digital health network rate (standard ${STANDARD_FEE_PERCENT} per cent)`, short: `${NETWORK_FEE_PERCENT}% of first-year gross` },
] as const;
export type FeeOption = (typeof FEE_OPTIONS)[number]["value"];

export const INTRO_TERMS: string[] = [
  "Our fee is charged once for each person you engage, on the basis you choose below. On the percentage basis, first-year remuneration for a retainer or sessional role with a revenue share is the fixed pay for the first twelve months plus the revenue share paid in that time: we invoice the fixed part on the start date and the balance at twelve months. The fixed fee is invoiced on the start date. Invoices are payable within 14 days and are non-refundable.",
  "Anyone you learn of through CadreHealth, whether they applied, were shortlisted, were found in search or accepted a contact request, counts as our introduction for twelve months from that date, however they are later engaged: employed, retained, sessional, or through a related company.",
  "Until an offer is made, you approach candidates through CadreHealth rather than directly, so each conversation is on the record.",
  "If someone we place leaves within three months of starting, we find a replacement for that role at no further fee.",
  "Candidate details are used only for filling these roles, and are handled under the Nigeria Data Protection Act and the Kenya Data Protection Act.",
];
