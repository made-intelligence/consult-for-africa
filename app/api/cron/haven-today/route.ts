import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/zeptomail";
import { whatsWaiting, type WaitingItem } from "@/lib/havenToday";
import { signStaffJWT } from "@/lib/staffAuth";

/**
 * The morning note. One email, one person, only what is waiting on them.
 *
 * Three rules it is built around, each of them a way this normally fails.
 *
 * Nothing waiting means nothing sent. A daily email that arrives whether or not
 * there is anything in it is trained away inside a fortnight, and then the one
 * that matters is trained away with it.
 *
 * It uses the same whatsWaiting as the page. Two implementations of "what do I
 * owe" drift, and the first time the email says three things and the page shows
 * two, people stop believing either.
 *
 * Every line is a deep link. An email that lands somebody on a front page and
 * asks them to find it themselves is a notification about work rather than a
 * way of doing it.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SITE = (process.env.NEXTAUTH_URL ?? "https://www.consultforafrica.com").replace(/\/$/, "");
const CLIENT_NAME = "Haven Paediatric Centre";

const URGENCY_LABEL: Record<WaitingItem["urgency"], string> = {
  NOW: "Now",
  TODAY: "Today",
  THIS_WEEK: "This week",
};

function body(firstName: string, items: WaitingItem[]) {
  const lines = items
    .map((i) => `  ${URGENCY_LABEL[i.urgency]}: ${i.title}${i.detail ? ` (${i.detail})` : ""}\n  ${SITE}${i.href}`)
    .join("\n\n");
  return `Good morning ${firstName},

${items.length === 1 ? "One thing" : `${items.length} things`} waiting on you at Haven.

${lines}

If any of it is wrong, or you cannot do it for a reason the system does not know about, say so on the staff page and somebody will pick it up.

Consult for Africa
${SITE}/HavenStaff`;
}

function html(firstName: string, items: WaitingItem[]) {
  const rows = items
    .map(
      (i) => `<tr><td style="padding:12px 0;border-bottom:1px solid #E2E8F0">
<div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${
        i.urgency === "NOW" ? "#B0392B" : i.urgency === "TODAY" ? "#8A6D1F" : "#1F7A8C"
      }">${URGENCY_LABEL[i.urgency]}</div>
<a href="${SITE}${i.href}" style="color:#0B3C5D;font-size:16px;font-weight:600;text-decoration:none">${i.title}</a>
${i.detail ? `<div style="color:#64748b;font-size:14px;margin-top:2px">${i.detail}</div>` : ""}
</td></tr>`
    )
    .join("");
  return `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15.5px;line-height:1.6;color:#1F2937;max-width:520px">
<p>Good morning ${firstName},</p>
<p>${items.length === 1 ? "One thing" : `${items.length} things`} waiting on you at Haven.</p>
<table style="width:100%;border-collapse:collapse;margin:18px 0">${rows}</table>
<p style="color:#64748b;font-size:14px">If any of it is wrong, or you cannot do it for a reason the system does not know about, say so on the staff page and somebody will pick it up.</p>
<p style="color:#64748b;font-size:14px">Consult for Africa</p>
</div>`;
}

export async function GET(req: NextRequest) {
  // Fails CLOSED. The first version of this read `if (secret && ...)`, which
  // meant that with CRON_SECRET unset the endpoint was open to anybody and
  // would email nineteen people on request. Every other cron in this repo fails
  // closed, and an auth check whose absence disables it is not an auth check.
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await prisma.client.findFirst({ where: { name: CLIENT_NAME }, select: { id: true } });
  if (!client) return NextResponse.json({ error: "No client" }, { status: 404 });

  const staff = await prisma.staffMember.findMany({
    where: { clientId: client.id, isActive: true, NOT: { email: null } },
    select: { id: true, name: true, email: true, tiers: true },
  });

  let sent = 0;
  let skipped = 0;
  const failures: string[] = [];

  for (const s of staff) {
    try {
      const items = await whatsWaiting({
        sub: s.id,
        clientId: client.id,
        name: s.name,
        tiers: s.tiers,
      });
      // Nothing waiting, nothing sent. This is the rule that keeps the rest
      // worth opening.
      if (items.length === 0) {
        skipped++;
        continue;
      }
      const firstName = s.name.replace(/^(Dr|Mr|Mrs|Ms)\s+/i, "").split(" ")[0];
      await sendTransactionalEmail({
        from: process.env.SMTP_FROM ?? "Consult for Africa <hello@consultforafrica.com>",
        replyTo: process.env.REPLY_TO_EMAIL ?? "hello@consultforafrica.com",
        to: s.email!,
        subject: items.length === 1 ? items[0].title : `${items.length} things waiting on you at Haven`,
        text: body(firstName, items),
        html: html(firstName, items),
      });
      sent++;
    } catch (err) {
      // One person's failure must not stop the other eighteen.
      failures.push(s.email!);
      console.error("[haven-today]", s.email, err);
    }
    await new Promise((r) => setTimeout(r, 250));
  }

  console.log(`[haven-today] sent=${sent} skipped=${skipped} failed=${failures.length}`);
  return NextResponse.json({ ok: true, sent, skipped, failed: failures.length });
}

// Not used yet. Kept here because the next obvious step is a one-tap link in
// the email that signs the person straight in, and the session is already
// signable. It is deliberately not wired: a long-lived sign-in link sitting in
// an inbox is a different risk from a thirty minute code, and that is a
// decision rather than an implementation detail.
export const _unusedSignIn = signStaffJWT;
