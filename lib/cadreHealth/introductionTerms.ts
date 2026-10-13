/**
 * The terms a client accepts before their roles reach their dashboard.
 *
 * The protection is in the order: a client sees nobody until these are
 * accepted, and contact details only ever pass through a contact request the
 * professional accepts, which is logged against the client. The version is
 * stamped on every acceptance so a later edit cannot be read back onto an
 * earlier one.
 *
 * One basis (Debo, 13 Oct 2026, after weighing a fixed fee and a per-role
 * fee): a percentage of first-year gross with a minimum per hire. The rate
 * card runs 8 to 15 per cent; digital health organisations get the network
 * rate at the bottom of it, shown against the standard so the discount is
 * seen as one. The minimum keeps a sessional placement worth doing.
 */
export const INTRO_TERMS_VERSION = "2026-10-13";

export const STANDARD_FEE_PERCENT = 15;
export const NETWORK_FEE_PERCENT = 8;
export const MINIMUM_FEE = "USD 2,000";
export const FEE_SUMMARY = `${NETWORK_FEE_PERCENT}% of first-year gross, minimum ${MINIMUM_FEE} per hire`;

export const INTRO_TERMS: string[] = [
  `Our fee is ${NETWORK_FEE_PERCENT} per cent of the first year's gross remuneration for each person you engage, our digital health network rate (our standard is ${STANDARD_FEE_PERCENT} per cent), with a minimum of ${MINIMUM_FEE} per person. It is charged once, in the currency they are paid in. For a retainer or sessional role with a revenue share, first-year remuneration is the fixed pay for the first twelve months plus the revenue share paid in that time: we invoice the fixed part, or the minimum if higher, on the start date and the balance at twelve months. Invoices are payable within 14 days and are non-refundable.`,
  "Anyone you learn of through CadreHealth, whether they applied, were shortlisted, were found in search or accepted a contact request, counts as our introduction for twelve months from that date, however they are later engaged: employed, retained, sessional, or through a related company.",
  "Until an offer is made, you approach candidates through CadreHealth rather than directly, so each conversation is on the record.",
  "If someone we place leaves within three months of starting, we find a replacement for that role at no further fee.",
  "Candidate details are used only for filling these roles, and are handled under the Nigeria Data Protection Act and the Kenya Data Protection Act.",
];
