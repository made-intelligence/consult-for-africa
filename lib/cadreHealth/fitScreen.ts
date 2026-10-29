/**
 * Scores an applicant against what the client said fit looks like.
 *
 * Debo's brief (13 Oct 2026): no man hours spent filtering. The hard gates
 * (relocation, qualification, years, registration) are settled by the form
 * before this runs; this reads everything else, the client's must-haves,
 * deal-breakers and their own questions, and decides. A shortlist goes
 * straight to the client's pipeline; a decline is recorded with its reason so
 * either side can overrule it.
 *
 * Until the client has answered the fit request, the job description stands
 * in as the rubric, and nobody is declined on it alone: the weak are held for
 * a re-score once the client's answers arrive.
 */
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { prisma } from "@/lib/prisma";
import { readFitProfile } from "@/lib/cadreHealth/fitProfile";
import { withoutRelocationBlock } from "@/lib/cadreHealth/zuriRelocationFit";

const client = new Anthropic();

const Assessment = z.object({
  score: z.number().int().min(0).max(100),
  verdict: z.enum(["shortlist", "hold", "decline"]),
  summary: z.string(),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
});

const SYSTEM = `You screen applicants for clinical roles on behalf of a hiring organisation. You are given the role, what the organisation says makes the right person, and one applicant's answers.

Score the applicant 0 to 100 on how well they match what the organisation asked for, and choose a verdict:
- shortlist: worth the organisation's time for an interview now.
- hold: plausible, but something material is missing or unclear.
- decline: they fail a must-have or hit a deal-breaker the organisation named.

Judge only on what the organisation asked for and what the applicant said. Do not reward polish or length. Do not infer anything from the applicant's name, sex, age, religion or ethnicity, and do not mention them. Where an answer is thin, say what is missing rather than guess.

The summary is one or two plain sentences the organisation will read first. Strengths and gaps are short phrases, at most four each.`;

export type Assessment = z.infer<typeof Assessment>;

/** One call to Claude. Null on a refusal or an API failure, so the application waits rather than being decided wrongly. */
export async function assess(input: { role: string; rubric: string; applicant: string }, label = "assessment"): Promise<Assessment | null> {
  try {
    const res = await client.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      output_config: { effort: "medium", format: zodOutputFormat(Assessment) },
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `<role>\n${input.role}\n</role>\n\n<what_the_organisation_wants>\n${input.rubric}\n</what_the_organisation_wants>\n\n<applicant>\n${input.applicant}\n</applicant>`,
        },
      ],
    });
    if (res.stop_reason === "refusal" || !res.parsed_output) {
      console.error(`[fitScreen] no assessment for ${label}: stop_reason=${res.stop_reason}`);
      return null;
    }
    return res.parsed_output;
  } catch (err) {
    if (err instanceof Anthropic.APIError) console.error(`[fitScreen] API ${err.status} for ${label}:`, err.message);
    else console.error(`[fitScreen] failed for ${label}:`, err);
    return null;
  }
}

type Outcome = "SHORTLISTED" | "REVIEWING" | "REJECTED";

/** Statuses the scorer may move. Anything a person has moved further on is theirs. */
const SCORABLE = ["NEW", "REVIEWING", "SHORTLISTED", "REJECTED"];

export async function scoreApplication(matchId: string): Promise<Outcome | null> {
  const match = await prisma.cadreMandateMatch.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      status: true,
      notes: true,
      professional: { select: { subSpecialty: true, yearsOfExperience: true, currentRole: true, currentFacility: true } },
      mandate: { select: { title: true, description: true, requiredQualifications: true, preferredQualifications: true, fitProfile: true } },
    },
  });
  if (!match || !match.notes || !SCORABLE.includes(match.status)) return null;
  // Failed a hard gate on the form; there is nothing to weigh.
  if (match.notes.includes("Screened out:")) return null;

  const fit = readFitProfile(match.mandate.fitProfile);
  const m = match.mandate;
  const rubric = fit
    ? [
        `Must have:\n${fit.mustHave || "(not stated)"}`,
        `Rules someone out:\n${fit.dealBreakers || "(not stated)"}`,
        `Stands out:\n${fit.standOut || "(not stated)"}`,
      ].join("\n\n")
    : `The organisation has not yet said what fit looks like beyond the job description. Use the requirements below. Do not decline anyone on this basis alone: use hold for the weak.\n\nRequired:\n- ${m.requiredQualifications.join("\n- ")}\n\nPreferred:\n- ${m.preferredQualifications.join("\n- ")}`;

  const p = match.professional;
  // Relocation fit is its own answer, shown to the client beside this one; it
  // must not lower a clinical score or turn a flag into a decline.
  const applicant = [
    withoutRelocationBlock(match.notes),
    p.subSpecialty && `Specialty on record: ${p.subSpecialty}`,
    p.yearsOfExperience != null && `Years of experience on record: ${p.yearsOfExperience}`,
    p.currentRole && `Current role on record: ${p.currentRole}`,
    p.currentFacility && `Current facility on record: ${p.currentFacility}`,
  ]
    .filter(Boolean)
    .join("\n");

  const assessment = await assess({ role: `${m.title}\n\n${m.description ?? ""}`, rubric, applicant }, matchId);
  if (!assessment) return null;

  let verdict = assessment.verdict;
  if (!fit && verdict === "decline") verdict = "hold";
  const status: Outcome = verdict === "shortlist" ? "SHORTLISTED" : verdict === "decline" ? "REJECTED" : "REVIEWING";

  const explanation = [
    assessment.summary,
    assessment.strengths.length ? `Strengths: ${assessment.strengths.join("; ")}.` : "",
    assessment.gaps.length ? `Gaps: ${assessment.gaps.join("; ")}.` : "",
    fit ? "" : "Scored on the job description; will be re-scored against your fit answers.",
  ]
    .filter(Boolean)
    .join("\n");

  await prisma.cadreMandateMatch.update({
    where: { id: matchId },
    data: { matchScore: assessment.score, matchExplanation: explanation, status },
  });
  return status;
}

/** Re-scores every open application on a mandate, after the client's fit answers change. */
export async function rescoreMandate(mandateId: string): Promise<number> {
  const matches = await prisma.cadreMandateMatch.findMany({
    where: { mandateId, source: "APPLIED", status: { in: SCORABLE } },
    select: { id: true },
  });
  let n = 0;
  for (const { id } of matches) if (await scoreApplication(id)) n++;
  return n;
}
