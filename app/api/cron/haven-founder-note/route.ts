import { NextRequest, NextResponse } from "next/server";
import { mondayNote, fridayNote } from "@/lib/havenFounderNote";
import { sendWhatsAppTemplate } from "@/lib/zohoWhatsApp";
import { noteToken } from "@/lib/havenNoteLink";
import { sendTransactionalEmail } from "@/lib/zeptomail";

/**
 * Monday and Friday, 07:00 Lagos: the founders' note on WhatsApp.
 *
 * A WhatsApp alert from Mezo's Zoho CPaaS sender goes to the CFA people on
 * HAVEN_NOTE_WHATSAPP (comma-separated numbers). It carries a signed link to
 * the note, ready to copy or forward to the founders' group: the API cannot
 * post into a group, and a template cannot carry a multi-line note.
 *
 * HAVEN_NOTE_WA_TEMPLATE picks the template. Until a CFA one is approved it
 * uses Mezo's mezo-team-booking-update (event, detail, ref, link).
 *
 * Also emailed to Debo, so a WhatsApp failure never means a silent week.
 *
 *   GET ?dry=1           returns the text, sends nothing
 *   GET ?kind=monday     force which note (default: by weekday)
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const dry = url.searchParams.get("dry") === "1";
  const forced = url.searchParams.get("kind");
  const dow = new Date().getUTCDay();
  const kind = forced === "monday" || forced === "friday" ? forced : dow === 1 ? "monday" : dow === 5 ? "friday" : null;
  if (!kind) return NextResponse.json({ ok: true, skipped: "Not Monday or Friday" });

  const text = kind === "monday" ? await mondayNote() : await fridayNote();
  if (dry) return NextResponse.json({ ok: true, kind, text });

  const to = (process.env.HAVEN_NOTE_WHATSAPP ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const site = (process.env.NEXTAUTH_URL ?? "https://www.consultforafrica.com").replace(/\/$/, "");
  const link = `${site}/haven-note/${noteToken(kind)}`;
  const template = process.env.HAVEN_NOTE_WA_TEMPLATE ?? "mezo-team-booking-update";
  const results = [];
  for (const n of to) {
    results.push({
      to: n.slice(-4),
      ...(await sendWhatsAppTemplate(n, template, {
        event: kind === "monday" ? "Haven founders' note: the plan for the week" : "Haven founders' note: what got done",
        detail: "Ready to forward to the founders' group. Open the link, tap Forward on WhatsApp and pick the group",
        ref: "HAVEN",
        link,
      })),
    });
  }

  await sendTransactionalEmail({
    from: process.env.SMTP_FROM ?? "Consult for Africa <hello@consultforafrica.com>",
    replyTo: process.env.REPLY_TO_EMAIL ?? "hello@consultforafrica.com",
    to: "debo.odulana@consultforafrica.com",
    subject: `Haven founders' ${kind === "monday" ? "Monday plan" : "Friday update"}: ready to forward`,
    text: `${results.length ? `WhatsApp: ${results.map((r) => `${r.to} ${r.ok ? "sent" : `failed (${r.error})`}`).join(", ")}` : "WhatsApp: no numbers set in HAVEN_NOTE_WHATSAPP"}\n\nForward page: ${link}\n\nThe text, to paste into the founders' group:\n\n${text}`,
    html: `<pre style="font-family:Helvetica,Arial,sans-serif;white-space:pre-wrap;font-size:15px">${text.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]!)}</pre>`,
  }).catch((e) => console.error("[haven-founder-note] email", e));

  return NextResponse.json({ ok: true, kind, results });
}
