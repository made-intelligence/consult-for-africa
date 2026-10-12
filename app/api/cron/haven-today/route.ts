import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/zeptomail";
import { whatsWaiting, type WaitingItem } from "@/lib/havenToday";
import { signStaffJWT } from "@/lib/staffAuth";
import { ONBOARDED, staffWhere } from "@/lib/havenAudience";

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

/**
 * For somebody who has not signed in yet. Deliberately carries no list, no
 * count and no reference to anything outstanding: the point is that joining
 * late costs them nothing, because the alternative is a team where the people
 * who were slow to start quietly stop trying.
 */
function welcomeText(firstName: string) {
  return `Hello ${firstName},

Your page at Haven is set up and waiting for you. Nothing has been missed and nothing is outstanding; it only starts when you do.

  ${SITE}/HavenStaff

Put in your email and we will send you a six-digit code. There is no password.

Inside you will find everyone's name, role and number in one place, a short list for your own day, and somewhere to ask for leave from your phone.

If it is not working, or you would rather somebody walked you through it on shift, say so and one of us will come and sit with you.

Consult for Africa`;
}

function welcomeHtml(firstName: string) {
  return `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15.5px;line-height:1.6;color:#1F2937;max-width:520px">
<p>Hello ${firstName},</p>
<p>Your page at Haven is set up and waiting for you. Nothing has been missed and nothing is outstanding; it only starts when you do.</p>
<p style="margin:22px 0"><a href="${SITE}/HavenStaff" style="background:#0B3C5D;color:#fff;text-decoration:none;padding:13px 24px;border-radius:10px;font-weight:600;display:inline-block">Open your page</a></p>
<p>Put in your email and we will send you a six-digit code. There is no password.</p>
<p style="color:#64748b;font-size:14px">If it is not working, or you would rather somebody walked you through it on shift, say so and one of us will come and sit with you.</p>
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
    where: { ...staffWhere(client.id, ONBOARDED), NOT: { email: null } },
    select: { id: true, name: true, email: true, tiers: true, lastLoginAt: true },
  });

  let sent = 0;
  let skipped = 0;
  const failures: string[] = [];

  for (const s of staff) {
    try {
      const firstNameEarly = s.name.replace(/^(Dr|Mr|Mrs|Ms)\s+/i, "").split(" ")[0];

      // Nobody who has not started yet gets a list of things waiting on them.
      // To somebody who has never seen the page, "four things waiting on you"
      // reads as a debt they did not know they had, and by week three it reads
      // as a place they are already behind. They get an invitation instead,
      // twice a week rather than daily, and it says plainly that nothing has
      // been missed.
      if (!s.lastLoginAt) {
        const day = new Date().getUTCDay();
        if (day !== 1 && day !== 4) { skipped++; continue; }
        await sendTransactionalEmail({
          from: process.env.SMTP_FROM ?? "Consult for Africa <hello@consultforafrica.com>",
          replyTo: process.env.REPLY_TO_EMAIL ?? "hello@consultforafrica.com",
          to: s.email!,
          subject: "Your Haven staff page is waiting whenever you are",
          text: welcomeText(firstNameEarly),
          html: welcomeHtml(firstNameEarly),
        });
        sent++;
        await new Promise((r) => setTimeout(r, 250));
        continue;
      }

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
