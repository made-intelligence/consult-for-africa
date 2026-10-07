import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

/**
 * The claims recovery desk's AI layer. Three jobs, each a single structured
 * call that a person then confirms:
 *
 *   vetClaims      reads a batch of claims and says which will pay, which need
 *                  repair and which will not, with the fix for each
 *   planRecovery   for one payer's open claims, ranks what to chase first and
 *                  drafts the reconciliation letter and the call script
 *   digestCall     turns a call note or transcript into promises, disputes and
 *                  next actions the desk can track
 *
 * Decisioning is deliberately NOT here: whether a claim is advanced is decided
 * by fixed rules in lib/recovery-rules.ts using the vetting result as one
 * input, and the funder makes the credit call. A model's opinion is evidence,
 * never the authority to move money.
 *
 * Only claim references, payer names, dates, amounts and a de-identified
 * service description are sent. Never patient names or records.
 */

const MODEL = "claude-opus-5-5";
let _client: Anthropic | null = null;
const client = () => (_client ??= new Anthropic());

const SYSTEM = `You work on the claims recovery desk of Consult for Africa, a healthcare management consultancy in Lagos and Abuja. Private Nigerian hospitals send us claims that health plans (HMOs), corporate accounts, the NHIA or state schemes have not paid. Our job is to get them paid by settling the dispute with the payer, not by threatening anyone.

How claims fail in Nigeria, in rough order of frequency: no pre-authorisation code, or a code that does not match the service billed; billing above the agreed tariff or on an old tariff; missing documents (clinical notes, results, discharge summary, signed claim form); submission outside the payer's window; the enrollee's cover lapsed or the service was excluded; the payer is simply slow or short of cash.

Escalation runs in this order and no further: the payer's claims officer, then its medical director or head of claims, then a formal complaint to the NHIA, which must mediate before any arbitration (NHIA Act 2022 s.47; failing to settle claims within the time in the operational guidelines is an offence under s.48). Mention the NHIA route only when the history shows the earlier steps have failed, and never as a threat in a first letter.

Be specific and practical. When you are unsure, say so and lower the likelihood rather than guessing. Never invent a tariff, an authorisation code or a payer's policy that is not in the input. British spelling. Do not use the em dash character.`;

async function ask<T extends z.ZodType>(schema: T, prompt: string, effort: "medium" | "high"): Promise<{ data: z.infer<T> | null; model: string; refused: boolean }> {
  const res = await client().messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system: SYSTEM,
    output_config: { effort, format: zodOutputFormat(schema) },
    messages: [{ role: "user", content: prompt }],
  });
  if (res.stop_reason === "refusal") return { data: null, model: res.model, refused: true };
  return { data: (res.parsed_output as z.infer<T> | null) ?? null, model: res.model, refused: false };
}

// ── Verification ──────────────────────────────────────────────────────────

export type ClaimForVetting = {
  id: string;
  claimRef: string;
  payer: string;
  payerType: string;
  serviceDate: string | null;
  submittedAt: string | null;
  ageDays: number | null;
  serviceSummary: string | null;
  authCode: string | null;
  documentsHeld: string[];
  billedAmount: number;
  tariffAmount: number | null;
  payerResponse: string | null;
};

const VetSchema = z.object({
  claims: z.array(
    z.object({
      id: z.string(),
      verdict: z.enum(["PASS", "REPAIR", "FAIL"]),
      likelihood: z.number().int().min(0).max(100),
      expectedPayable: z.number().min(0),
      issues: z.array(z.object({ check: z.enum(["authorisation", "tariff", "documents", "timeliness", "cover", "duplicate", "other"]), finding: z.string() })),
      repairs: z.array(z.string()),
      rationale: z.string(),
    }),
  ),
});
export type VetResult = z.infer<typeof VetSchema>["claims"][number];

export async function vetClaims(claims: ClaimForVetting[]) {
  const prompt = `Verify each claim below before we chase it or fund it.

For each claim return:
- verdict: PASS if it should pay as it stands, REPAIR if it will pay once something specific is fixed, FAIL if it is unlikely to pay at all.
- likelihood: 0 to 100, the chance the payer pays (after repair, for REPAIR).
- expectedPayable: the naira amount you expect the payer to pay. If billed is above tariff, the tariff is the most it pays.
- issues: each problem you see, tagged by check. Flag possible duplicates (same payer, near-identical amount and date).
- repairs: the concrete steps that would make it payable, in order.
- rationale: two sentences at most.

A claim with no authorisation code for a service that normally needs one is REPAIR at best. A claim older than about six months with no payer response is at risk on timeliness. Missing documents are usually repairable.

Claims (JSON):
${JSON.stringify(claims)}`;
  return ask(VetSchema, prompt, "high");
}

// ── Recovery planning ─────────────────────────────────────────────────────

export type OpenClaim = {
  id: string;
  claimRef: string;
  ageDays: number | null;
  billedAmount: number;
  vetPayable: number | null;
  vetVerdict: string | null;
  payerResponse: string | null;
  lastActivity: string | null;
};

const PlanSchema = z.object({
  queue: z.array(z.object({ id: z.string(), priority: z.number().int().min(1), nextAction: z.string(), dueInDays: z.number().int().min(0).max(60) })),
  letterSubject: z.string(),
  letterBody: z.string(),
  callScript: z.string(),
  escalateTo: z.string().nullable(),
});
export type RecoveryPlan = z.infer<typeof PlanSchema>;

export async function planRecovery(input: { hospital: string; payer: string; payerType: string; payerContact: string | null; history: string[]; claims: OpenClaim[] }) {
  const prompt = `Plan this week's recovery work for ${input.hospital}'s open claims with ${input.payer} (${input.payerType}).

Return:
- queue: every claim, ranked (1 = chase first), with the single next action and how many days until it is due. Rank on expected naira recovered per hour of effort: large, clean, recently queried claims first; stale or failing claims last.
- letterSubject and letterBody: a reconciliation letter from Consult for Africa on behalf of ${input.hospital} to the payer's claims team${input.payerContact ? ` (${input.payerContact})` : ""}. Courteous and factual. List the claims by reference and amount, say what has been fixed on each, and ask for a payment date. No threats, no legal language. Plain text.
- callScript: a short script for the follow-up call to the claims officer: the opening, the three claims to raise first, what to ask for, and how to close with a date.
- escalateTo: who to escalate to if the history shows the claims officer has stopped responding, or null.

Recent history with this payer:
${input.history.length ? input.history.map((h) => `- ${h}`).join("\n") : "- none recorded"}

Open claims (JSON):
${JSON.stringify(input.claims)}`;
  return ask(PlanSchema, prompt, "high");
}

// ── Calls ─────────────────────────────────────────────────────────────────

const CallSchema = z.object({
  summary: z.string(),
  outcome: z.enum(["PROMISE", "DISPUTE", "INFO_REQUESTED", "NO_PROGRESS", "UNREACHABLE"]),
  promises: z.array(z.object({ claimRefs: z.array(z.string()), amount: z.number().nullable(), byDate: z.string().nullable(), who: z.string().nullable() })),
  disputes: z.array(z.object({ claimRef: z.string(), reason: z.string() })),
  nextActions: z.array(z.object({ action: z.string(), dueInDays: z.number().int().min(0).max(60), claimRef: z.string().nullable() })),
});
export type CallDigest = z.infer<typeof CallSchema>;

export async function digestCall(input: { payer: string; hospital: string; today: string; notes: string; knownClaimRefs: string[] }) {
  const prompt = `Below are notes or a transcript from a call between our desk and ${input.payer} about ${input.hospital}'s claims. Today is ${input.today}.

Extract:
- summary: three sentences at most.
- outcome: the main result of the call.
- promises: every commitment the payer made, with the claim references it covers, the amount and the date (ISO yyyy-mm-dd) if stated. Only include what was actually said.
- disputes: every claim the payer is disputing, and why.
- nextActions: what our desk must do next, with days until due.

Use only claim references from this list where possible: ${input.knownClaimRefs.join(", ") || "(none on file)"}.

Notes:
"""
${input.notes}
"""`;
  return ask(CallSchema, prompt, "medium");
}
