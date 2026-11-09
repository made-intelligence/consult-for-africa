import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/zeptomail";
import { siteClientId } from "@/lib/staffAuth";
import { DAILY_SITES } from "@/lib/dailySites";
import { formatValue, headlineLabel, headlineType, headlineValue, isoDay } from "@/lib/dailyReturn";
import { ageLabel, loadDailyView, type DailyView } from "@/lib/dailyView";

/**
 * The principal's morning note, 07:30 in the practice: yesterday, area by area,
 * what is waiting on her, and what is open. It reads from the same loader as
 * her page, so the two never disagree.
 *
 * Sent to whoever holds BOARD at the practice. Areas not started yet are named
 * once at the end, so a gap in the list always means a return that did not
 * come in.
 *
 * ?dryRun=1 returns the text and sends nothing.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BASE = (process.env.NEXTAUTH_URL ?? "https://www.consultforafrica.com").replace(/\/$/, "");

const fmtDay = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

interface Line {
  title: string;
  status: "IN" | "MISSING";
  facts: string;
  note: string | null;
}

function lines(view: DailyView): { lines: Line[]; notStarted: string[] } {
  const y = isoDay(view.yesterday);
  const out: Line[] = [];
  const notStarted: string[] = [];
  for (const row of view.rows) {
    const c = row.days[y];
    if (c.status === "NOT_STARTED") {
      notStarted.push(row.section.title);
      continue;
    }
    const facts =
      c.status === "IN"
        ? row.section.headline
            .map((code) => `${headlineLabel(row.section, code)} ${formatValue(headlineType(row.section, code), headlineValue(row.section, code, c.values))}`)
            .join(", ")
        : `Not in${row.owners.length ? ` (${row.owners.join(", ")})` : ""}`;
    out.push({ title: `${row.section.number}. ${row.section.title}`, status: c.status === "IN" ? "IN" : "MISSING", facts, note: c.note });
  }
  return { lines: out, notStarted };
}

function render(firstName: string, shortName: string, ink: string, link: string, view: DailyView) {
  const { lines: ls, notStarted } = lines(view);
  const inCount = ls.filter((l) => l.status === "IN").length;
  const opening = `Yesterday, ${fmtDay(view.yesterday)}: ${inCount} of ${ls.length} areas in.`;
  const decisions = view.decisions.map((d) => `${d.title} (waiting ${ageLabel(d.ageDays)}${d.raisedBy ? `, from ${d.raisedBy}` : ""})`);

  const text = `Good morning ${firstName},

${opening}

${ls.map((l) => `${l.title}\n  ${l.facts}${l.note ? `\n  Note: ${l.note}` : ""}`).join("\n\n")}

${decisions.length ? `Waiting on you:\n${decisions.map((d) => `  ${d}`).join("\n")}` : "Nothing is waiting on you."}

Open reports: ${view.issues.length}.${notStarted.length ? `\n\nNot started yet: ${notStarted.join(", ")}.` : ""}

Today at ${shortName}:
${link}

Consult for Africa`;

  const rows = ls
    .map(
      (l) => `<tr><td style="padding:10px 0;border-bottom:1px solid #E2E8F0">
<div style="color:${ink};font-weight:600;font-size:15px">${esc(l.title)}</div>
<div style="color:${l.status === "IN" ? "#374151" : "#B0392B"};font-size:14px;margin-top:2px">${esc(l.facts)}</div>
${l.note ? `<div style="color:#64748b;font-size:13.5px;margin-top:2px">Note: ${esc(l.note)}</div>` : ""}
</td></tr>`
    )
    .join("");
  const html = `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15.5px;line-height:1.6;color:#1F2937;max-width:560px">
<p>Good morning ${esc(firstName)},</p>
<p><strong>${esc(opening)}</strong></p>
<table style="width:100%;border-collapse:collapse;margin:12px 0">${rows}</table>
${
  decisions.length
    ? `<p style="margin:18px 0 6px;color:${ink};font-weight:700">Waiting on you</p><ul style="margin:0;padding-left:20px">${decisions.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>`
    : `<p>Nothing is waiting on you.</p>`
}
<p>Open reports: ${view.issues.length}.</p>
${notStarted.length ? `<p style="color:#64748b;font-size:14px">Not started yet: ${esc(notStarted.join(", "))}.</p>` : ""}
<p style="margin:22px 0"><a href="${link}" style="background:${ink};color:#fff;text-decoration:none;padding:13px 24px;border-radius:10px;font-weight:600;display:inline-block">Today at ${esc(shortName)}</a></p>
<p style="color:#64748b;font-size:14px">Consult for Africa</p>
</div>`;
  return { subject: `Yesterday at ${shortName}: ${inCount} of ${ls.length} areas in${decisions.length ? `, ${decisions.length} waiting on you` : ""}`, text, html };
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  const report: { site: string; to: string[]; sent: number; preview?: string }[] = [];

  for (const { site, config } of DAILY_SITES) {
    const clientId = await siteClientId(site);
    if (!clientId) continue;
    const view = await loadDailyView(clientId, config, { canSeeFinancials: true });
    const principals = await prisma.staffMember.findMany({
      where: { clientId, isActive: true, tiers: { has: "BOARD" }, NOT: [{ email: null }, { kind: "TEST" }] },
      select: { name: true, email: true },
    });

    let sent = 0;
    let preview: string | undefined;
    for (const p of principals) {
      const first = p.name.replace(/^(Dr|Mr|Mrs|Ms|Miss|Prof)\.?\s+/i, "").split(" ")[0];
      const greet = /^Dr\.?\s/i.test(p.name) ? `Dr ${first}` : first;
      const mail = render(greet, site.shortName, site.palette.ink, `${BASE}${site.pathPrefix}/today`, view);
      if (dryRun) {
        preview ??= `${mail.subject}\n\n${mail.text}`;
        continue;
      }
      try {
        await sendTransactionalEmail({
          from: process.env.SMTP_FROM ?? "Consult for Africa <hello@consultforafrica.com>",
          replyTo: process.env.REPLY_TO_EMAIL ?? "hello@consultforafrica.com",
          to: p.email!,
          subject: mail.subject,
          text: mail.text,
          html: mail.html,
        });
        sent++;
      } catch (err) {
        console.error("[staff-daily-summary]", site.slug, p.email, err);
      }
    }
    report.push({ site: site.slug, to: principals.map((p) => p.email!), sent, preview });
  }

  return NextResponse.json({ ok: true, dryRun, report });
}
