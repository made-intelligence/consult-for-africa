import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { sendOutboundEmail } from "@/lib/communications-send";
import { composeUpdate, havenFounders, renderUpdate, subjectFor } from "@/lib/havenFounderUpdate";

// Send this week's founders' update.
//
// One email per founder, never a group To line, and each one logged against
// the Haven client so the CRM finally has a record of the engagement. Debo gets
// a single copy: ZeptoMail does not carry a cc, so it goes as its own email.
// Once a week only: a second press the same week is refused rather than
// sending five more emails.

export const dynamic = "force-dynamic";

const SENDERS = ["PARTNER", "ADMIN"];
const DEBO = "debo.odulana@consultforafrica.com";
const TAG = "haven-founders-weekly";

const lines = z.array(z.string().trim().min(1).max(400)).max(10);
const schema = z.object({ done: lines, next: lines, asks: lines });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !SENDERS.includes(session.user.role)) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Each line must be under 400 characters." }, { status: 400 });

  const u = await composeUpdate();
  const { clientId, founders } = await havenFounders();
  const weekTag = `week:${u.week}`;

  const already = await prisma.communication.count({
    where: { clientId, tags: { hasEvery: [TAG, weekTag] }, status: "SENT" },
  });
  if (already > 0) {
    return NextResponse.json({ error: "This week's update has already gone to the founders." }, { status: 409 });
  }

  const subject = subjectFor(u.label);
  const sent: string[] = [];
  const failed: string[] = [];

  for (const f of founders) {
    const { text, html } = renderUpdate(f.salutation, u, parsed.data);
    const res = await sendOutboundEmail({ to: f.email, subject, bodyText: text, bodyHtml: html, replyTo: DEBO });
    await prisma.communication.create({
      data: {
        subjectType: "CLIENT",
        clientId,
        prospectName: f.name,
        prospectEmail: f.email,
        type: "EMAIL",
        direction: "OUTBOUND",
        status: res.ok ? "SENT" : "FAILED",
        subject,
        body: text,
        bodyHtml: html,
        sentAt: res.ok ? new Date() : null,
        toEmails: [f.email],
        externalId: res.messageId,
        tags: [TAG, weekTag],
        loggedById: session.user.id,
      },
    });
    (res.ok ? sent : failed).push(f.name);
  }

  // Debo's copy, headed with who it reached and who it did not.
  const { text, html } = renderUpdate("Debo", u, parsed.data);
  await sendOutboundEmail({
    to: DEBO,
    subject: `[Your copy] ${subject}`,
    bodyText: `Sent individually to: ${sent.join(", ")}${failed.length ? `. FAILED: ${failed.join(", ")}` : ""}\n\n${text}`,
    bodyHtml: `<p style="font-family:Helvetica,Arial,sans-serif;color:#64748b">Sent individually to: ${sent.join(", ")}${failed.length ? `. <b style="color:#B0392B">Failed: ${failed.join(", ")}</b>` : ""}</p>${html}`,
  });

  return NextResponse.json({ ok: failed.length === 0, sent, failed });
}
