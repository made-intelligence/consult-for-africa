/**
 * The firm's pricing architecture, in one place, for the rate card surface at
 * /finance/rate-card.
 *
 * This is configuration rather than data: it changes when Debo changes it, not
 * when a client does. Client specific agreed fees and balances are deliberately
 * NOT here, because they live on the engagement record and on
 * /finance/invoices, which is the only place they are current.
 *
 * The day rates below are the same published rate card the fee builders use
 * (scripts/clearview_fee.py and scripts/lib_medbury_aesthetics_fee.py), and
 * lib/__tests__/pricing.test.ts asserts they still match, so a figure cannot
 * drift between what a proposal is built from and what a director reads here.
 */

/** Naira per day, by grade. The published rate card. */
export const DAY_RATES = [
  { grade: "Partner, engagement lead", rate: 750_000 },
  { grade: "Principal, workstream lead", rate: 450_000 },
  { grade: "Senior consultant", rate: 300_000 },
  { grade: "Consultant", rate: 190_000 },
  { grade: "Analyst", rate: 120_000 },
] as const;

/**
 * The one structural concession shown on a resourced build: the workstreams are
 * a single continuous mandate rather than several engagements. Anything beyond
 * this is held for the conversation and kept out of the document.
 */
export const PROGRAMME_RATE = 0.1;

export const MOBILISATION_FLOOR = 25_000_000;

export type Row = { label: string; value: string; note?: string };
export type Block = { heading: string; intro?: string; rows: Row[]; caution?: string };

export const RESOURCED_DELIVERY: Block = {
  heading: "Resourced delivery, which is the base for most work",
  intro:
    "Setup, structuring and delivery programmes are priced as named grades for the days each workstream actually takes, published, with the build shown. A transparent day rate build survives a scope change, because a deprioritised workstream comes straight off, and it keeps the negotiation off percentages of the client's capital.",
  rows: [
    ...DAY_RATES.map((r) => ({ label: r.grade, value: `${(r.rate / 1000).toFixed(0)}k per day` })),
    {
      label: "Programme rate",
      value: "10 per cent",
      note: "The single visible concession on a multi workstream mandate. Show one, never two.",
    },
    {
      label: "Mobilisation",
      value: "25m, non refundable",
      note: "A hard floor, not a percentage.",
    },
    {
      label: "Third party consultants",
      value: "At cost, no mark up",
      note: "Architect, mechanical and electrical, quantity surveyor. Cheap goodwill, and true.",
    },
    {
      label: "Billing",
      value: "Capped, monthly against timesheets",
      note: "So the client never pays for days not worked.",
    },
  ],
  caution:
    "The operating management fee stays out of a resourced build. Running a business for years cannot sensibly be billed by the day, so it sits on a separate management fee and the client can approve the setup programme without reopening the bigger negotiation.",
};

export const RECRUITMENT: Block = {
  heading: "Recruitment and executive search",
  intro:
    "Priced as a percentage of first year gross salary. The position below is Debo's, set on 23 September 2026, and it replaced a higher band. The pricing memo in the documents folder still carries the older one, so read this surface for the rate and the memo for the guardrails.",
  rows: [
    {
      label: "Current position",
      value: "8 to 15 per cent",
      note: "Lower end for nursing and allied batches, upper end for a scarce senior specialist.",
    },
    {
      label: "Superseded position",
      value: "15 to 20 per cent with tier logic",
      note: "Held until 23 September 2026.",
    },
    {
      label: "Market modal rate",
      value: "20 per cent",
      note: "Purple Star against Cedarcrest, November 2024. Executive search houses hold 25.",
    },
    {
      label: "Replacement guarantee",
      value: "3 to 6 months",
      note: "Voluntary resignation only. We cannot underwrite the client's people management.",
    },
    {
      label: "Delivery window",
      value: "6 to 10 weeks",
      note: "Market norm is 8 to 12. Retained work is 4 to 6.",
    },
    {
      label: "Retained search upfront",
      value: "500k",
      note: "Credited in full against the placement fee. Not refundable if the client withdraws the role.",
    },
    {
      label: "Withdrawal fee",
      value: "50 per cent of the would be fee",
      note: "Mirrors the market and protects against tyre kicking.",
    },
    {
      label: "Payment terms",
      value: "14 working days",
      note: "Concede to 30 for a trusted slow paying institution, not casually.",
    },
    {
      label: "Employer subscription",
      value: "100k per year",
      note: "Unlimited postings, verified profile, a curated shortlist per role. Loss leader on purpose: it seeds the placement conversation.",
    },
  ],
  caution:
    "An eight per cent floor on a nursing batch is thin, and the earlier memo argued explicitly against undercutting on the grounds that we compete on platform leverage rather than on price. Worth testing with Debo rather than treating as settled.",
};

export const LEADERSHIP: Block = {
  heading: "Leadership assessment and coaching",
  intro:
    "The menu below carries the uplift applied on 1 May 2026 to absorb the Founding Circle's ten per cent coaching discount, so a Circle member still nets a small premium over the original card. Rates are stored per coach in the database and set from the coaches admin screen, not in code.",
  rows: [
    { label: "Assessment only", value: "460k to 690k", note: "Less than a conference registration." },
    { label: "Assessment and group coaching", value: "920k to 1.38m", note: "Six monthly sessions." },
    {
      label: "Assessment and one to one coaching",
      value: "2.3m to 4.03m",
      note: "Twelve sessions over six months, biweekly.",
    },
    { label: "Leadership intensive", value: "4.6m to 6.9m", note: "One to one, group and workshop." },
    {
      label: "Executive retreat, per person",
      value: "1.73m to 2.88m",
      note: "Two to three days offsite, ten to twenty leaders.",
    },
    {
      label: "Enterprise cohort, ten or more",
      value: "17.25m to 28.75m",
      note: "The headline comparison: the same as sending one person to Lagos Business School.",
    },
    { label: "Coach share", value: "65 to 70 per cent of the coaching component" },
    { label: "Founding Circle", value: "10 per cent off coaching" },
  ],
  caution:
    "The anchors that make the argument: Lagos Business School's Advanced Management Programme is 17 to 18m per person and its Chief Executive Programme is 26 to 27m, and Harvard's global health leaders programme is 45 to 50 thousand dollars. Use the comparison, never the claim: predictive validity, normative percentiles and integrity measurement are not yet supportable by the instrument.",
};

export const WORKFORCE_PLATFORM: Block = {
  heading: "Workforce platform, member side",
  intro: "The only consumer price the firm holds, and the one line of revenue that has actually been paid for.",
  rows: [
    { label: "Pro subscription", value: "1.5k per month", note: "Unlimited advisor access and reports." },
    { label: "One to one session", value: "5k each" },
    {
      label: "Paid for to date",
      value: "One member",
      note: "A diaspora paediatrician who converted himself off a cold list.",
    },
  ],
  caution:
    "Billing is a one shot charge giving a month of access, not a recurring plan, so there is no auto renewal and no cancellation control. Anything sold on a subscription promise today is a manual renewal in practice.",
};

export const BUILD_AND_OPERATE: Block = {
  heading: "Build and operate, the five bases",
  intro:
    "A build and operate mandate is five different activities, so it carries five separate bases rather than one blended fee. The figures below are the Lyfe Place architecture, built to be reused, shown as the published anchor against the walk away. Publish the anchor. Hold the floor.",
  rows: [
    {
      label: "A. Delivery",
      value: "Anchor 90m fixed. Floor 78m",
      note: "25 on signature, the balance over 48 trading months.",
    },
    {
      label: "B. Capital efficiency share",
      value: "Anchor 20 per cent of cash saved, cap 50m. Floor 15 per cent, cap 35m",
      note: "Against an independently benchmarked budget.",
    },
    {
      label: "C. Establishment",
      value: "Anchor 22m per entity plus 6m on licence granted. Floor 15m with the licence folded in",
    },
    {
      label: "D. Management",
      value:
        "Anchor 6 per cent of revenue, floor 5m a month, plus 25 per cent of contribution above a 15 per cent cash on cash hurdle, indexed 12 per cent a year. Floor 4 per cent plus 15 per cent above 25 per cent",
    },
    { label: "E. Equity", value: "Anchor 15 per cent of the operating company. Floor nil" },
    {
      label: "Recurring, all in",
      value: "Anchor 213m a year, being 12.5 per cent of revenue. Floor 135m, being 7.9 per cent",
    },
  ],
  caution:
    "The finding to carry into every future mandate: a percentage of capital development fee is the wrong instrument whenever the client wants lean capital, because it pays us for spending their money and punishes us for doing what was asked. Replace it with a fixed delivery fee plus a share of the capital saved, which flips the only fee line where our interests and the client's were opposed into the one place they are identical.",
};

export const CALIBRATION: Block = {
  heading: "What discount has actually been given, so you know where the floor really is",
  intro:
    "Two live calibration points, because a rate card nobody has ever tested is a guess. Read these before you decide what a number means.",
  rows: [
    {
      label: "Medbury Aesthetics setup, Lagos",
      value: "Held at 25m against her 15m",
      note: "25m is already 54 to 67 per cent below what the rate card would produce for that scope, and 15m is below delivery cost. The decision taken was to hold 25, concede on shape rather than on price, and make the gap buy the Abuja mandate.",
    },
    {
      label: "Duchess International Hospital",
      value: "35.69m reduced to 19.71m",
      note: "118 resourced days to 55, day rates unchanged. The distinction matters and is worth saying in exactly this order: a 45 per cent cut on the same scope teaches a client the rate card is soft and sets the reference price for every future piece of their work, while the same cut because the scope genuinely shrank is a different conversation.",
    },
  ],
  caution: "That second line is the most useful sentence on this page. When a client pushes on price, move the scope, not the rate.",
};

export const HOUSE_RULES = [
  "Anchor roughly 35 to 40 per cent above the walk away, then hold an explicit concession ladder: what to give, in what order, what it actually costs, how generous it reads, and what to ask for in return.",
  "Standard, then one named concession, then net. Show what has been given up. Never show a pre discounted number as though it were the price.",
  "Never volunteer a cap, a discount or a self limiting clause. If the client asks, concede it as their win.",
  "Never benchmark the firm at the bottom of a comparator range in a client document. Mid band, for a scope at the top of it.",
  "Never concede two things in one sentence.",
  "Spend the free goodwill late: no mark up on reimbursed staff, no commission on media, substitution free, one reschedule included.",
  "Frame on value created rather than cost recovery. Benchmarking against what it would cost to employ the function invites the wrong argument and makes us a vendor.",
  "Never put a price in marketing copy, and never defend a price nobody has challenged.",
  "Every invoice carries the terms block: fees non refundable, substitution free, one reschedule included. It exists because a client asked for a refund on an invoice that was silent on the point.",
  "Platforms sit outside the fee stack and in an appendix, which keeps the question of why a client is paying for our software out of the main negotiation.",
];

export const NEVER_CONCEDE = [
  "The capital efficiency share mechanism",
  "Exclusivity",
  "First right on further sites",
  "Deferred fees surviving termination",
  "Platforms sitting outside the fee",
  "One naira, one fee",
];

/** The private ladders. Paths, not contents, and none of these is ever sent to a client. */
export const NEGOTIATION_GUIDES = [
  { client: "Lyfe Place medipark mandate", path: "docs/lyfeplace-abuja/cfa-medipark-pricing-guide-PRIVATE.md" },
  { client: "Lyfe Place joint venture", path: "docs/lyfe-jv-negotiation-guide-PRIVATE.md" },
  { client: "Medbury Aesthetics fee", path: "docs/medbury-aesthetics-fee-PRIVATE.md" },
  { client: "Medbury management counter", path: "docs/medbury-mgmt-counter-PRIVATE.md" },
  { client: "Duchess fee benchmarking", path: "docs/duchess/duchess-fee-benchmarking-PRIVATE.md" },
  { client: "Duchess pitch preparation", path: "docs/duchess/duchess-pitch-prep-PRIVATE.md" },
  { client: "Clearview performance structure", path: "docs/clearview/clearview-performance-negotiation-guide-PRIVATE.md" },
  { client: "Grandville call preparation", path: "docs/grandville/grandville-call-prep-PRIVATE.md" },
  { client: "Medlyfe Introduces", path: "docs/medlyfe-introduces-negotiation-PRIVATE.md" },
];

export const OPEN_GAPS = [
  "The marketing agency has no rate card at all, which is what currently blocks the Grandville conversation. The operating brief sets out the logic, being a published card, retainer floors and scope defined tightly enough that a change is visibly a change, and the numbers have never been set.",
  "Recruitment carries two live positions in two places: 8 to 15 per cent here, and 15 to 20 per cent in the pricing memo. The memo needs updating or retiring.",
  "The workforce platform's Pro plan is sold as a subscription and billed as a single charge, so renewal is manual.",
];

export const ALL_BLOCKS: Block[] = [
  RESOURCED_DELIVERY,
  RECRUITMENT,
  LEADERSHIP,
  WORKFORCE_PLATFORM,
  BUILD_AND_OPERATE,
  CALIBRATION,
];
