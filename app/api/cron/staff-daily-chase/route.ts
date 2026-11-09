import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/zeptomail";
import { ONBOARDED, staffWhere } from "@/lib/havenAudience";
import { siteClientId } from "@/lib/staffAuth";
import { DAILY_SITES } from "@/lib/dailySites";
import { isoDay, missingSections, ownersFor, practiceDay, type DailySection } from "@/lib/dailyReturn";

/**
 * The evening chase, 20:00 in the practice. Each area with no return for today
 * goes to whoever owns it, one email per person listing only their areas, each
 * a link straight to the form.
 *
 * Nothing missing, nothing sent. An area with no owner matched yet is not
 * chased; it shows as a gap in the morning summary instead, which is where an
 * unowned area should be seen.
 *
 * ?dryRun=1 returns who would be sent what, and sends nothing.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BASE = (process.env.NEXTAUTH_URL ?? "https://www.consultforafrica.com").replace(/\/$/, "");
const FROM = () => process.env.SMTP_FROM ?? "Consult for Africa <hello@consultforafrica.com>";
const REPLY = () => process.env.REPLY_TO_EMAIL ?? "hello@consultforafrica.com";

function firstName(name: string) {
  return name.replace(/^(Dr|Mr|Mrs|Ms|Miss|Prof)\.?\s+/i, "").split(" ")[0];
}

function text(name: string, links: { s: DailySection; href: string }[]) {
  const lines = links.map((l) => `  ${l.s.title}\n  ${l.href}`).join("\n\n");
  return `Good evening ${firstName(name)},

Today's numbers are not in yet for:

${lines}

About two minutes each. If you cannot do it tonight, you can put it in first thing tomorrow.

Consult for Africa`;
}

function html(name: string, ink: string, links: { s: DailySection; href: string }[]) {
  const rows = links
    .map((l) => `<p style="margin:12px 0"><a href="${l.href}" style="background:${ink};color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;display:inline-block">${l.s.title}</a></p>`)
    .join("");
  return `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15.5px;line-height:1.6;color:#1F2937;max-width:520px">
<p>Good evening ${firstName(name)},</p>
<p>Today's numbers are not in yet for:</p>
${rows}
<p style="color:#64748b;font-size:14px">About two minutes each. If you cannot do it tonight, you can put it in first thing tomorrow.</p>
<p style="color:#64748b;font-size:14px">Consult for Africa</p>
</div>`;
}

export async function GET(req: NextRequest) {
  // Fails closed, as every cron here does.
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  const report: { site: string; sent: number; unowned: string[]; plan: { to: string; sections: string[] }[]; failed: number }[] = [];

  for (const { site, config } of DAILY_SITES) {
    const clientId = await siteClientId(site);
    if (!clientId) continue;
    const now = new Date();
    const day = practiceDay(config, now);
    const returns = await prisma.dailyReturn.findMany({ where: { clientId, day }, select: { section: true } });
    const missing = missingSections(config, day, returns.map((r) => r.section), now);

    const staff = await prisma.staffMember.findMany({
      where: { ...staffWhere(clientId, ONBOARDED), NOT: { email: null } },
      select: { id: true, name: true, email: true, position: true, department: true },
    });

    const byPerson = new Map<string, { person: (typeof staff)[number]; sections: DailySection[] }>();
    const unowned: string[] = [];
    for (const s of missing) {
      const owners = ownersFor(s, staff);
      if (owners.length === 0) unowned.push(s.code);
      for (const o of owners) {
        const entry = byPerson.get(o.id) ?? { person: o, sections: [] };
        entry.sections.push(s);
        byPerson.set(o.id, entry);
      }
    }

    let sent = 0;
    let failed = 0;
    const plan: { to: string; sections: string[] }[] = [];
    for (const { person, sections } of byPerson.values()) {
      plan.push({ to: person.email!, sections: sections.map((s) => s.code) });
      if (dryRun) continue;
      const links = sections.map((s) => ({ s, href: `${BASE}${site.pathPrefix}/daily?section=${s.code}&day=${isoDay(day)}` }));
      try {
        await sendTransactionalEmail({
          from: FROM(),
          replyTo: REPLY(),
          to: person.email!,
          subject: sections.length === 1 ? `${sections[0].title}: today's numbers` : `${sections.length} areas not in yet today`,
          text: text(person.name, links),
          html: html(person.name, site.palette.ink, links),
        });
        sent++;
      } catch (err) {
        failed++;
        console.error("[staff-daily-chase]", site.slug, person.email, err);
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    console.log(`[staff-daily-chase] ${site.slug} missing=${missing.length} sent=${sent} unowned=${unowned.join(",")}`);
    report.push({ site: site.slug, sent, unowned, plan, failed });
  }

  return NextResponse.json({ ok: true, dryRun, report });
}
