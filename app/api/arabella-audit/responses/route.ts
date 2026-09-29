import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { notifyInternal } from "@/lib/email";

// Public, unauthenticated endpoint: submissions from the four Arabella Women's
// Health diagnostic-audit forms.
//
//   public/arabella-staff-survey.html      -> arabella-staff-culture        (anonymous)
//   public/arabella-patient-survey.html    -> arabella-patient-experience   (anonymous)
//   public/arabella-referrer-survey.html   -> arabella-referrer             (attributed)
//   public/arabella-leadership-survey.html -> arabella-leadership-direction (attributed)
//
// The two anonymous forms collect no PII at all. The two attributed ones carry
// the respondent's name inside `responses` by design: a referring colleague's
// answer is only actionable if we know which colleague gave it, and the
// leadership instrument exists to compare named views against each other.
//
// The referrer form also collects the names of colleagues the respondent
// nominates, which is the only way this engagement gets a referrer list at all.
// Those names are registered as piiKeys in lib/surveys/registry.ts so an
// erasure request can find them.

const ALLOWED = [
  "arabella-staff-culture",
  "arabella-patient-experience",
  "arabella-referrer",
  "arabella-leadership-direction",
] as const;

// Attributed surveys are chased by name, so tell us the moment one lands. The
// patient survey is also flagged, because it is the channel that tells us who
// referred each patient and Arabella has no referrer list of its own.
const NOTIFIES: Record<string, string> = {
  "arabella-referrer": "A referring colleague has completed the Arabella referrer survey",
  "arabella-leadership-direction": "An Arabella leader has completed the direction survey",
};

const bodySchema = z.object({
  survey: z.enum(ALLOWED),
  respondent: z.string().max(120).optional(),
  submittedAt: z.string().optional(),
  responses: z.record(z.string(), z.any()),
});

const NOTIFY_TO = "debo.odulana@consultforafrica.com";
const ADMIN_BASE = "https://www.consultforafrica.com/admin/surveys";

async function notifySubmission(survey: string, respondent?: string) {
  const count = await prisma.auditSurveyResponse.count({ where: { survey } });
  const who = respondent?.trim() || "Someone";
  const html = `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1F2937">
<p><b>${who}</b> has completed the <b>${survey}</b> survey.</p>
<p>That is <b>${count}</b> in so far.</p>
<p><a href="${ADMIN_BASE}/${survey}" style="color:#0B3C5D">See the results</a></p>
</div>`;
  await notifyInternal(NOTIFY_TO, `${NOTIFIES[survey]} (${count} in)`, html);
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
    }
    if (JSON.stringify(parsed.data.responses).length > 20_000) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    await prisma.auditSurveyResponse.create({
      data: {
        survey: parsed.data.survey,
        payload: parsed.data.responses,
        userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
      },
    });

    // Never let a notification failure fail the submission for the respondent.
    if (NOTIFIES[parsed.data.survey]) {
      try {
        await notifySubmission(parsed.data.survey, parsed.data.respondent);
      } catch (err) {
        console.error("[arabella-audit] notification failed:", err);
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
