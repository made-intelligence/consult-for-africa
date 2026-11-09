import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendTransactionalEmail } from "@/lib/zeptomail";
import {
  findStaffByIdentifier,
  greetingName,
  hashLoginCode,
  maskEmail,
  MAX_ATTEMPTS,
  newLoginCode,
  signStaffJWT,
  siteClientId,
  TOKEN_TTL_MINUTES,
  type DeliveryChannel,
} from "@/lib/staffAuth";
import { sendSMS } from "@/lib/cadreHealth/sms";
import type { StaffSite } from "@/lib/staffSites";

/**
 * Sign-in for any staff site: ask for a code, then trade it for a session.
 * Moved here from the Haven routes so a second practice gets the same sign-in
 * rather than a copy of it. For Haven every word and every rule is as it was.
 *
 * Public endpoint. A staff member gives their email or mobile number and gets a
 * six-digit code at the email we hold for them.
 *
 * This used to answer identically whether or not the address matched anybody,
 * so it could not be used to learn who works at the hospital. The price was
 * seven of twenty-five staff who typed an address we did not hold, were told a
 * code was on its way, and waited for one that was never sent. For a team whose
 * names and numbers sit in a directory every colleague can open, "we cannot
 * find that" is worth far more than it gives away. The address itself is never
 * returned.
 */

// "email" stays the field name for the page already open in people's browsers;
// it now carries an email address or a mobile number.
const askSchema = z.object({ email: z.string().trim().min(3).max(200) });

/**
 * SMS first where we hold a mobile, email behind it.
 *
 * In Nigeria SMS beats email for this group: most staff are on personal
 * addresses they check at home rather than on shift. Termii is already wired
 * for CadreHealth outreach and normalises 080... to 234... itself.
 *
 * sendSMS returns false rather than throwing when TERMII_API_KEY is absent, so
 * with no key this quietly becomes email-only and nobody is stranded.
 */
async function deliver(site: StaffSite, to: string | null, phone: string | null, firstName: string, code: string): Promise<DeliveryChannel> {
  if (phone) {
    const sent = await sendSMS(
      phone,
      `${code} is your code for the ${site.shortName} staff page. It lasts ${TOKEN_TTL_MINUTES} minutes. Consult for Africa.`,
      process.env.TERMII_SENDER_ID_CFA
    );
    if (sent) return "SMS";
  }
  // Someone held by phone alone (Arabella loads most staff that way) has no
  // email to fall back to; surface the failure rather than claim a send.
  if (!to) throw new Error("SMS not sent and no email on file");
  await sendCodeEmail(site, to, firstName, code);
  return "EMAIL";
}

async function sendCodeEmail(site: StaffSite, to: string, firstName: string, code: string) {
  await sendTransactionalEmail({
    from: process.env.SMTP_FROM ?? "Consult for Africa <hello@consultforafrica.com>",
    replyTo: process.env.REPLY_TO_EMAIL ?? "hello@consultforafrica.com",
    to,
    subject: `${code} is your code for the ${site.shortName} staff page`,
    text: `Hello ${firstName},

Your code for the ${site.shortName} staff page is ${code}

Type it into the page you have open. It lasts ${TOKEN_TTL_MINUTES} minutes and works once.

If you did not ask for this, you can ignore it. The code is no use to anybody without your email address.

Consult for Africa
hello@consultforafrica.com`,
    html: `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15.5px;line-height:1.65;color:#1F2937">
<p>Hello ${firstName},</p>
<p>Your code for the ${site.shortName} staff page:</p>
<p style="font-size:34px;font-weight:700;letter-spacing:.22em;color:${site.palette.ink};margin:22px 0">${code}</p>
<p>Type it into the page you have open. It lasts ${TOKEN_TTL_MINUTES} minutes and works once.</p>
<p style="color:#6B7280;font-size:14px">If you did not ask for this, you can ignore it. The code is no use to anybody without your email address.</p>
<p style="color:#6B7280;font-size:14px">Consult for Africa<br>hello@consultforafrica.com</p>
</div>`,
  });
}

export async function requestStaffCode(req: NextRequest, site: StaffSite) {
  const tag = `[${site.slug}-staff/login]`;
  const parsed = askSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, found: false });

  const typed = parsed.data.email;

  try {
    const clientId = await siteClientId(site);
    if (!clientId) return NextResponse.json({ ok: false, found: false });

    const staff = await findStaffByIdentifier(clientId, typed);
    if (!staff || (!staff.email && !staff.phone)) {
      // Logged so the next "I am not getting the code" can be answered from
      // the logs: what they typed, against a list we can check.
      console.warn(tag, "no match for", typed);
      return NextResponse.json({ ok: false, found: false });
    }

    // Retire anything already outstanding, so only the newest code works and an
    // older email sitting in the inbox is inert.
    await prisma.staffLoginToken.updateMany({
      where: { staffId: staff.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const { code, hash } = newLoginCode(staff.id);
    const via = await deliver(site, staff.email, staff.phone, greetingName(staff.name), code);

    await prisma.staffLoginToken.create({
      data: {
        staffId: staff.id,
        tokenHash: hash,
        expiresAt: new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000),
        // Recorded for the learning questions, not for the sign-in itself.
        channel: via,
        userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
      },
    });

    // Masked, so the person knows which inbox to open without the page reading
    // anybody's address out to whoever typed their number.
    return NextResponse.json({ ok: true, found: true, sentTo: via === "SMS" || !staff.email ? "your phone" : maskEmail(staff.email) });
  } catch (err) {
    console.error(tag, err);
    return NextResponse.json({ ok: false, found: true, error: "We could not send the code just now. Please try again in a minute." });
  }
}

// Takes the email and the six-digit code and, if they match, sets the session.
//
// The attempt counter is what actually protects six digits. No hash choice can
// make a million possibilities safe; killing the code after five wrong tries
// can. Every failure answers the same way, so a wrong code and an unknown email
// are indistinguishable from outside.

const verifySchema = z.object({
  // An email address or a mobile number, whichever they asked for the code with.
  email: z.string().trim().min(3).max(200),
  code: z.string().regex(/^\d{6}$/),
});

const no = () => NextResponse.json({ ok: false, error: "That code is not right, or it has expired." }, { status: 400 });

export async function verifyStaffCode(req: NextRequest, site: StaffSite) {
  const parsed = verifySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return no();

  const clientId = await siteClientId(site);
  if (!clientId) return no();

  const staff = await findStaffByIdentifier(clientId, parsed.data.email);
  if (!staff) return no();

  const token = await prisma.staffLoginToken.findFirst({
    where: { staffId: staff.id, usedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!token || token.expiresAt < new Date()) return no();

  if (token.tokenHash !== hashLoginCode(staff.id, parsed.data.code)) {
    const attempts = token.attempts + 1;
    await prisma.staffLoginToken.update({
      where: { id: token.id },
      // Burn the code at the cap. They ask for another one, which costs them
      // ten seconds and costs an attacker the whole attempt budget.
      data: { attempts, ...(attempts >= MAX_ATTEMPTS ? { usedAt: new Date() } : {}) },
    });
    return no();
  }

  // Burn before issuing, so a code submitted twice in parallel cannot mint two
  // sessions. If this does not claim exactly one row, somebody else just did.
  const burned = await prisma.staffLoginToken.updateMany({
    where: { id: token.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (burned.count !== 1) return no();

  await prisma.staffMember.update({
    where: { id: staff.id },
    data: { lastLoginAt: new Date() },
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(
    site.cookie,
    signStaffJWT({ sub: staff.id, clientId: staff.clientId, name: staff.name, tiers: staff.tiers }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    }
  );
  return res;
}
