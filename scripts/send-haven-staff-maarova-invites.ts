/**
 * Invite the Haven staff to Maarova: every one of the nineteen on the roster,
 * less Dr Odedina who is already in the org as a founder. Eighteen invites.
 *
 * Individual emails, one per person, never a group To or Cc. ZeptoMail HTTP API
 * only, with no SMTP fallback. Dry run unless --send.
 *
 * Framing, which matters more than the mechanics here. This goes out as part of
 * the relaunch, where all nineteen are onboarded afresh, so it reaches people as
 * something everybody is doing rather than something being done to them. The
 * promise in the town hall deck is explicit: where anyone is assessed
 * individually the result belongs to that person and goes to nobody else. That
 * promise is repeated in this email and it has to hold, including against a
 * board that will ask to see individual results. Only team-level patterns ever
 * reach us or them.
 *
 *   npx tsx --env-file=.env.local scripts/send-haven-staff-maarova-invites.ts
 *   npx tsx --env-file=.env.local scripts/send-haven-staff-maarova-invites.ts --send
 */
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { PrismaClient, type MaarovaTrack } from "@prisma/client";

const prisma = new PrismaClient();
const SEND = process.argv.includes("--send");
// --test sends Debo one real copy and creates no MaarovaUser rows.
const TEST = process.argv.includes("--test");
const TEST_TO = ["debo.odulana@consultforafrica.com", "dodulana@gmail.com"];
// Reviewed by the office before it goes anywhere near the hospital.
const TEST_CC = [
  "abigail.ayomide04@gmail.com",   // Abigail Oladejo
  "ogeriorji845@gmail.com",        // Ezinne Orji
];
const PORTAL = "https://www.consultforafrica.com/maarova/portal/login";
const CC = ["debo.odulana@consultforafrica.com"];
const SUBJECT = "Your place on the Haven leadership assessment";

interface Staff {
  firstName: string; lastName: string; email: string;
  department: string; position: string; dataIssue?: string;
}

const CLINICAL_DEPTS = new Set(["MEDICAL", "NURSING", "LAB", "PHARMACY"]);

function greeting(s: Staff) {
  return s.department === "MEDICAL" ? `Dr ${s.firstName}` : s.firstName;
}

function body(s: Staff, password: string) {
  return `Dear ${greeting(s)},

As part of the work we are doing at Haven, everybody on the team is being given a place on a leadership and development assessment. Everybody, from the ward to the front desk. This is not a test and nobody passes or fails it.

Maarova was built for healthcare people in Africa rather than adapted from a corporate tool. It covers six areas: how you tend to work, what you value, how you read and handle emotion, the move from doing the work to leading it, how you operate in a team, and how you see the culture around you. Set aside about an hour. Your report is generated as soon as you finish.

The part worth reading twice: your report belongs to you. Your individual results are not shared with Haven, with the owners, with your manager or with anyone else. What we see is the pattern across the whole team, with no names attached. That is how we work everywhere and it is not negotiable here.

What we use it for is to understand where the team is strong, where people want to grow, and how to build the training and support around what you actually need rather than what we assume.

  Portal:     ${PORTAL}
  Email:      ${s.email}
  Temporary:  ${password}

Change the password when you first log in. If anything in your report is worth talking through, say so and we will.

Warm regards,

Dr Debo Odulana
Founding Partner, Consult for Africa
hello@consultforafrica.com  ·  +234 913 813 8553  ·  consultforafrica.com`;
}

async function main() {
  const roster: Staff[] = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), "docs/data/haven-staff-roster.json"), "utf8")
  ).staff;

  const unresolved = roster.filter((s) => s.dataIssue?.toLowerCase().includes("bounce"));
  if (unresolved.length) {
    throw new Error(`Unresolved email issues, refusing to send: ${unresolved.map((s) => s.email).join(", ")}`);
  }

  const org = await prisma.maarovaOrganisation.findFirst({
    where: { name: { contains: "Haven", mode: "insensitive" } },
    select: { id: true, name: true, maxAssessments: true, _count: { select: { users: true } } },
  });
  if (!org) throw new Error("Haven Maarova organisation not found.");

  const existing = new Set(
    (await prisma.maarovaUser.findMany({
      where: { email: { in: roster.map((s) => s.email.toLowerCase()) } },
      select: { email: true },
    })).map((u) => u.email.toLowerCase())
  );

  const todo = roster.filter((s) => !existing.has(s.email.toLowerCase()));
  const need = org._count.users + todo.length;
  console.log(`Org "${org.name}": ${org._count.users} users, cap ${org.maxAssessments}`);
  console.log(`Roster ${roster.length}, already in Maarova ${roster.length - todo.length}, to invite ${todo.length}`);
  console.log(`Would hold ${need} against a cap of ${org.maxAssessments}.\n`);
  if (need > org.maxAssessments) {
    throw new Error(`Cap too low: need ${need}, cap ${org.maxAssessments}. Run scripts/raise-haven-maarova-cap.ts.`);
  }

  for (const s of todo) {
    const track: MaarovaTrack = CLINICAL_DEPTS.has(s.department) ? "CLINICAL" : "NON_CLINICAL";
    console.log(`  ${(s.firstName + " " + s.lastName).padEnd(28)} ${s.email.padEnd(34)} ${track.padEnd(13)} ${s.position}`);
  }

  if (TEST) {
    const rawKey = process.env.ZEPTOMAIL_API_KEY;
    if (!rawKey) throw new Error("ZEPTOMAIL_API_KEY not set.");
    const apiKey = rawKey.replace(/^Zoho-enczapikey\s*/i, "").trim();
    const fromRaw = process.env.SMTP_FROM ?? "Consult for Africa <hello@consultforafrica.com>";
    const fm = fromRaw.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
    const from = fm ? { address: fm[2].trim(), name: fm[1].trim() } : { address: fromRaw.trim() };
    const sample = todo.find((s) => s.department === "NURSING") ?? todo[0];
    const text = body(sample, "Haven-a1b2c3");
    for (const address of [TEST_TO[0]]) {
      const res = await fetch("https://api.zeptomail.com/v1.1/email", {
        method: "POST",
        headers: { Authorization: `Zoho-enczapikey ${apiKey}`, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          from,
          to: [{ email_address: { address, name: "Debo Odulana" } }],
          cc: TEST_CC.map((a) => ({ email_address: { address: a } })),
          reply_to: [{ address: process.env.REPLY_TO_EMAIL ?? "hello@consultforafrica.com" }],
          subject: `[FOR REVIEW, not sent to staff] ${SUBJECT}`,
          htmlbody: text.replace(/\n/g, "<br>"),
          textbody: text,
        }),
      });
      const data: any = await res.json().catch(() => null);
      if (!res.ok) throw new Error(`ZeptoMail ${res.status}: ${JSON.stringify(data)}`);
      console.log(`  TEST sent to ${address} request=${data?.request_id ?? "?"}`);
    }
    console.log("  No MaarovaUser rows created. Staff untouched.");
    return;
  }

  if (!SEND) {
    console.log(`\n  Sample (${todo[0].firstName}):\n`);
    console.log(body(todo[0], "Haven-xxxxxx").split("\n").map((l) => `  | ${l}`).join("\n"));
    console.log(`\n  DRY RUN. No users created, no emails sent. Re-run with --send.\n`);
    return;
  }

  const rawKey = process.env.ZEPTOMAIL_API_KEY;
  if (!rawKey) throw new Error("ZEPTOMAIL_API_KEY not set. Bulk sends go via ZeptoMail only, never Zoho SMTP.");
  const apiKey = rawKey.replace(/^Zoho-enczapikey\s*/i, "").trim();
  const fromRaw = process.env.SMTP_FROM ?? "Consult for Africa <hello@consultforafrica.com>";
  const m = fromRaw.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
  const from = m ? { address: m[2].trim(), name: m[1].trim() } : { address: fromRaw.trim() };

  let sent = 0, failed = 0;
  for (const s of todo) {
    const password = `Haven-${randomBytes(3).toString("hex")}`;
    const track: MaarovaTrack = CLINICAL_DEPTS.has(s.department) ? "CLINICAL" : "NON_CLINICAL";
    const user = await prisma.maarovaUser.create({
      data: {
        organisationId: org.id,
        email: s.email.toLowerCase(),
        name: `${s.firstName} ${s.lastName}`,
        title: s.position,
        department: s.department,
        track,
        passwordHash: await bcrypt.hash(password, 10),
        role: "USER",
        isPortalEnabled: true,
        invitedAt: new Date(),
      },
      select: { id: true },
    });

    const text = body(s, password);
    const res = await fetch("https://api.zeptomail.com/v1.1/email", {
      method: "POST",
      headers: { Authorization: `Zoho-enczapikey ${apiKey}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        from,
        to: [{ email_address: { address: s.email, name: `${s.firstName} ${s.lastName}` } }],
        cc: CC.map((address) => ({ email_address: { address } })),
        reply_to: [{ address: process.env.REPLY_TO_EMAIL ?? "hello@consultforafrica.com" }],
        subject: SUBJECT,
        htmlbody: text.replace(/\n/g, "<br>"),
        textbody: text,
      }),
    });
    const data: any = await res.json().catch(() => null);
    if (!res.ok) {
      failed++;
      await prisma.maarovaUser.update({
        where: { id: user.id },
        data: { inviteEmailStatus: "FAILED", inviteEmailError: JSON.stringify(data).slice(0, 500) },
      });
      console.error(`  FAILED ${s.email}: ${res.status} ${JSON.stringify(data)}`);
    } else {
      sent++;
      await prisma.maarovaUser.update({
        where: { id: user.id },
        data: { inviteEmailStatus: "SENT", inviteEmailSentAt: new Date() },
      });
      console.log(`  sent ${s.email} message=${data?.data?.[0]?.message_id ?? "?"}`);
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  console.log(`\n  ${sent} sent, ${failed} failed.`);
}

main().catch((e) => { console.error(String(e)); process.exitCode = 1; }).finally(() => prisma.$disconnect());
