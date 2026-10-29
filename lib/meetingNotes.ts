import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

/**
 * Nuru's notes from a meeting transcript: a summary, the decisions, and the
 * commitments people made, each with who owes it and by when.
 *
 * The commitments are drafts. They land on the meeting for the office to
 * confirm, and only a confirmed one enters the register and starts being
 * chased. That is the step that lets Ezinne stay out of the meeting without
 * letting a misheard name turn into a wrong chase.
 */

const MODEL = "claude-opus-5-5";
let _client: Anthropic | null = null;
const client = () => (_client ??= new Anthropic());

const SYSTEM = `You are Nuru, the note-taker for Consult for Africa, a healthcare management consultancy in Lagos and Abuja. You read the transcript of a meeting you did not attend and write up what the office needs to run the follow-through.

A commitment is a promise by a named person or organisation to do a specific thing: "I will send the tariff sheet by Friday", "we'll get you the staff list next week", "Debo to call the MD". It is not a topic discussed, a hope, an idea floated, or something already done in the meeting. If nobody took it on, it is not a commitment, however important.

Who owes it: pick the participant who said they would do it, or who was asked and agreed. When the speaker says "I" or "we", the owner is the speaker. When the transcript has no speaker labels, infer the owner only when the words make it plain (they name themselves, or are addressed by name and agree); otherwise give no owner and say so in "heard". Never guess.

Due dates: convert relative dates ("Friday", "end of next week", "before the board meets on the 30th") to a calendar date using the meeting date given. If no time was said, leave it empty. Do not invent a deadline.

"heard" is the closest thing to a direct quote from the transcript that supports the commitment, so the office can check it in seconds.

Write plainly. British spelling. Do not use the em dash character. Do not pad the summary: three to five sentences on what was decided and what happens next.`;

const NotesSchema = z.object({
  summary: z.string(),
  keyDecisions: z.array(z.string()),
  commitments: z.array(
    z.object({
      what: z.string(),
      /** Index into the participant list, or null when no participant owns it. */
      owner: z.number().int().nullable(),
      /** For an owner who is not on the invite, e.g. "the HMO" or "Dr Ade's PA". */
      ownerOutsideInvite: z.string().nullable(),
      dueDate: z.string().nullable(),
      heard: z.string(),
    }),
  ),
});

export interface NotesParticipant {
  name: string;
  email: string;
  userId: string | null;
  role: string | null;
}

/** One drafted promise, shaped for POST /api/commitments/from-meeting. */
export interface CommitmentDraft {
  what: string;
  owedByUserId: string | null;
  owedByName: string | null;
  owedByEmail: string | null;
  dueDate: string | null;
  heard: string;
}

export interface MeetingNotes {
  summary: string;
  keyDecisions: string[];
  /** The plain lines the meeting page and summary email have always shown. */
  actionItems: string[];
  commitments: CommitmentDraft[];
}

export async function draftMeetingNotes(params: {
  title: string;
  type: string;
  meetingDate: Date;
  context: string[];
  participants: NotesParticipant[];
  transcript: string;
}): Promise<MeetingNotes | null> {
  const date = params.meetingDate.toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos",
  });
  const people = params.participants
    .map((p, i) => `${i}. ${p.name}${p.role ? ` (${p.role})` : ""}${p.userId ? ", C4A" : ""}`)
    .join("\n");

  const prompt = `Meeting: ${params.title} (${params.type})
Date: ${date}
${params.context.join("\n")}

Participants, by index:
${people}

Transcript:
${params.transcript}`;

  const res = await client().messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system: SYSTEM,
    output_config: { effort: "high", format: zodOutputFormat(NotesSchema) },
    messages: [{ role: "user", content: prompt }],
  });
  if (res.stop_reason === "refusal" || !res.parsed_output) return null;

  const out = res.parsed_output;
  const commitments: CommitmentDraft[] = out.commitments.map((c) => {
    const p = c.owner !== null ? params.participants[c.owner] : undefined;
    const due = c.dueDate && !Number.isNaN(Date.parse(c.dueDate)) ? c.dueDate.slice(0, 10) : null;
    return {
      what: c.what.trim(),
      owedByUserId: p?.userId ?? null,
      owedByName: p ? p.name : c.ownerOutsideInvite?.trim() || null,
      owedByEmail: p && !p.userId ? p.email : null,
      dueDate: due,
      heard: c.heard.trim(),
    };
  });

  return {
    summary: out.summary.trim(),
    keyDecisions: out.keyDecisions,
    actionItems: commitments.map((c) => (c.owedByName ? `${c.what} - ${c.owedByName}` : c.what)),
    commitments,
  };
}
