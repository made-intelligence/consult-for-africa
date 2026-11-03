import { NextRequest, NextResponse } from "next/server";
import { mondayNote, fridayNote } from "@/lib/havenFounderNote";
import { sendWhatsApp } from "@/lib/termii";
import { sendTransactionalEmail } from "@/lib/zeptomail";

/**
 * Monday and Friday, 07:00 Lagos: the founders' note on WhatsApp.
 *
 * Sent to the CFA people on HAVEN_NOTE_WHATSAPP (comma-separated numbers), who
 * forward it to the founders' group. The API cannot post into a group, and a
 * person reading it first is also the check that it is right.
 *
 * Also emailed to Debo, so a Termii failure never means a silent week.
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
  const results = [];
  for (const n of to) results.push({ to: n.slice(-4), ...(await sendWhatsApp(n, text)) });

  await sendTransactionalEmail({
    from: process.env.SMTP_FROM ?? "Consult for Africa <hello@consultforafrica.com>",
    replyTo: process.env.REPLY_TO_EMAIL ?? "hello@consultforafrica.com",
    to: "debo.odulana@consultforafrica.com",
    subject: `Haven founders' ${kind === "monday" ? "Monday plan" : "Friday update"}: ready to forward`,
    text: `${results.length ? `WhatsApp: ${results.map((r) => `${r.to} ${r.ok ? "sent" : `failed (${r.error})`}`).join(", ")}` : "WhatsApp: no numbers set in HAVEN_NOTE_WHATSAPP"}\n\nThe text, to paste into the founders' group:\n\n${text}`,
    html: `<pre style="font-family:Helvetica,Arial,sans-serif;white-space:pre-wrap;font-size:15px">${text.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]!)}</pre>`,
  }).catch((e) => console.error("[haven-founder-note] email", e));

  return NextResponse.json({ ok: true, kind, results });
}
