/**
 * Haven Paediatric Centre: the delivery phase.
 *
 * The six-month growth mandate starts 6 October 2026. The plan itself lives in
 * scripts/build-haven-milestone-tracker.py (the client-facing tracker) and
 * docs/haven-growth-strategy-cfa.pdf. This file is the operating side of it:
 * who owns which lever, and how we reach them.
 *
 * Single source of truth for the contact register, the daily task push and the
 * evidence drop, so a role named here cannot drift from the role named on the
 * form the team fills in.
 */

export const HAVEN_ENGAGEMENT_ID = "cmqazdnsx0002nzx3kfh8gop0";
export const HAVEN_START = "2026-10-06";

/**
 * The Haven-side owners named across the six-month tracker. "C4A" appears
 * against several of these as a joint owner; those are ours, not theirs, so
 * they are not roles we need contact details for.
 */
export type Workstream = {
  key: string;
  role: string;
  /** What this seat owns, in their words rather than the lever's. */
  owns: string;
  levers: string[];
  /** Named where we already know who holds the seat. */
  knownHolder?: string;
};

export const WORKSTREAMS: Workstream[] = [
  {
    key: "nicu",
    role: "NICU and neonatology",
    owns: "The NICU: repricing it, filling it, and the referral relationships that keep it full.",
    levers: ["Lever 2"],
    knownHolder: "Dr Odedina",
  },
  {
    key: "finance",
    role: "Finance",
    owns: "Billing and revenue capture, the receivables chase, tariffs and the management numbers.",
    levers: ["Lever 6", "Lever 7", "Lever 8"],
  },
  {
    key: "clinical",
    role: "Clinical lead",
    owns: "Safety and just-culture standards, the new clinics, surgery lists and home care.",
    levers: ["Lever 3", "Lever 8", "Lever 9"],
  },
  {
    key: "operations",
    role: "Operations",
    owns: "The facility day to day, and the neonatal transport ambulance.",
    levers: ["Lever 2", "Lever 8"],
  },
  {
    key: "bd",
    role: "Business development",
    owns: "The referral portal and call list, corporate and school retainers, HMO panels.",
    levers: ["Lever 1", "Lever 4"],
  },
  {
    key: "pharmacy",
    role: "Pharmacy",
    owns: "Stock, the vendor-managed inventory partner, and ending the stockouts.",
    levers: ["Lever 7"],
  },
  {
    key: "hr",
    role: "HR and people",
    owns: "The staff app, incentives, and making the culture work stick.",
    levers: ["Lever 8"],
  },
  {
    key: "membership",
    role: "Membership / Haven Club",
    owns: "Launching the Club, the events cadence, and renewals.",
    levers: ["Lever 5"],
  },
  {
    key: "culture",
    role: "Culture and re-onboarding",
    owns: "Taking every member of staff through induction again, as if Haven were opening today, and making the new standards the normal ones.",
    levers: ["Lever 8"],
  },
  {
    key: "marketing",
    role: "Marketing",
    owns: "The Haven brand, the campaigns, and the agency relationship.",
    levers: ["Lever 1", "Lever 5"],
  },
  {
    key: "frontdesk",
    role: "Front desk and records",
    owns: "Where every billable event is first captured, or lost.",
    levers: ["Lever 6"],
  },
  {
    key: "board",
    role: "Board / founder",
    owns: "The decisions that are the board's to make, including the senior operations hire.",
    levers: ["Lever 8"],
  },
  {
    key: "other",
    role: "Something else",
    owns: "A seat we have not named. Tell us what you hold.",
    levers: [],
  },
];

export const workstreamLabel = (key: string): string =>
  WORKSTREAMS.find((w) => w.key === key)?.role ?? key;

/**
 * The evidence drop. Month 1 asks for things that either exist or do not, and
 * the fastest way to tell the difference is to ask for the artefact.
 */
export const UPLOAD_SECTIONS: { key: string; title: string; hint: string }[] = [
  { key: "billing", title: "Billing and revenue capture", hint: "Daily takings, the billing export, anything that replaced the handover sheet" },
  { key: "tariff", title: "Tariffs and pricing", hint: "Current price list, payer tariffs, the mystery-shop results" },
  { key: "receivables", title: "Receivables", hint: "The debtor ledger, Leadway and NEM correspondence, what has landed" },
  { key: "nicu", title: "NICU", hint: "Occupancy, referral agreements, the catchment map" },
  { key: "stock", title: "Pharmacy and stock", hint: "Stock counts, the VMI terms, stockout log" },
  { key: "people", title: "People and culture", hint: "The ops leader spec and candidates, incentive drafts, the just-culture standard" },
  { key: "other", title: "Something else", hint: "Anything you think we should see that we did not ask for" },
];

export const uploadSectionLabel = (key: string): string =>
  UPLOAD_SECTIONS.find((s) => s.key === key)?.title ?? key;
