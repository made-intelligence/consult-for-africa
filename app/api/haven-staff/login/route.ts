import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendTransactionalEmail } from "@/lib/zeptomail";
import { findStaffByIdentifier, greetingName, maskEmail, newLoginCode, TOKEN_TTL_MINUTES, type DeliveryChannel } from "@/lib/staffAuth";
import { sendSMS } from "@/lib/cadreHealth/sms";

// Public endpoint. A staff member gives their email or mobile number and gets a
// six-digit code at the email we hold for them.
//
// This used to answer identically whether or not the address matched anybody,
// so it could not be used to learn who works at the hospital. The price was
// seven of twenty-five staff who typed an address we did not hold, were told a
// code was on its way, and waited for one that was never sent. Not one of them
// produced a single code in a fortnight. For twenty-five people whose names and
// numbers sit in a directory every colleague can open, "we cannot find that" is
// worth far more than it gives away. The address itself is never returned.

export const dynamic = "force-dynamic";

const CLIENT_NAME = "Haven Paediatric Centre";
// "email" stays the field name for the page already open in people's browsers;
// it now carries an email address or a mobile number.
const bodySchema = z.object({ email: z.string().trim().min(3).max(200) });

/**
 * SMS first where we hold a mobile, email behind it.
 *
 * In Nigeria SMS beats email for this group: most of the nineteen are on
 * personal addresses they check at home rather than on shift, and we watched a
 * mail to this hospital arrive late only today. Termii is already wired for
 * CadreHealth outreach and normalises 080... to 234... itself.
 *
 * sendSMS returns false rather than throwing when TERMII_API_KEY is absent, so
 * with no key this quietly becomes email-only and nobody is stranded. The
 * person is told the code may arrive either way, because they typed an email
 * and a text message would otherwise be a surprise.
 */
async function deliver(to: string, phone: string | null, firstName: string, code: string): Promise<DeliveryChannel> {
  if (phone) {
    const sent = await sendSMS(
      phone,
      `${code} is your code for the Haven staff page. It lasts ${TOKEN_TTL_MINUTES} minutes. Consult for Africa.`,
      process.env.TERMII_SENDER_ID_CFA
    );
    if (sent) return "SMS";
  }
  await sendEmail(to, firstName, code);
  return "EMAIL";
}

async function sendEmail(to: string, firstName: string, code: string) {
  await sendTransactionalEmail({
    from: process.env.SMTP_FROM ?? "Consult for Africa <hello@consultforafrica.com>",
    replyTo: process.env.REPLY_TO_EMAIL ?? "hello@consultforafrica.com",
    to,
    subject: `${code} is your code for the Haven staff page`,
    text: `Hello ${firstName},

Your code for the Haven staff page is ${code}

Type it into the page you have open. It lasts ${TOKEN_TTL_MINUTES} minutes and works once.

If you did not ask for this, you can ignore it. The code is no use to anybody without your email address.

Consult for Africa
hello@consultforafrica.com`,
    html: `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15.5px;line-height:1.65;color:#1F2937">
<p>Hello ${firstName},</p>
<p>Your code for the Haven staff page:</p>
<p style="font-size:34px;font-weight:700;letter-spacing:.22em;color:#0B3C5D;margin:22px 0">${code}</p>
<p>Type it into the page you have open. It lasts ${TOKEN_TTL_MINUTES} minutes and works once.</p>
<p style="color:#6B7280;font-size:14px">If you did not ask for this, you can ignore it. The code is no use to anybody without your email address.</p>
<p style="color:#6B7280;font-size:14px">Consult for Africa<br>hello@consultforafrica.com</p>
</div>`,
  });
}

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, found: false });

  const typed = parsed.data.email;

  try {
    const client = await prisma.client.findFirst({
      where: { name: CLIENT_NAME },
      select: { id: true },
    });
    if (!client) return NextResponse.json({ ok: false, found: false });

    const staff = await findStaffByIdentifier(client.id, typed);
    if (!staff || !staff.email) {
      // Logged so the next "I am not getting the code" can be answered from
      // the logs: what they typed, against a list we can check.
      console.warn("[haven-staff/login] no match for", typed);
      return NextResponse.json({ ok: false, found: false });
    }

    // Retire anything already outstanding, so only the newest code works and an
    // older email sitting in the inbox is inert.
    await prisma.staffLoginToken.updateMany({
      where: { staffId: staff.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const { code, hash } = newLoginCode(staff.id);
    const via = await deliver(staff.email, staff.phone, greetingName(staff.name), code);

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
    return NextResponse.json({ ok: true, found: true, sentTo: via === "SMS" ? "your phone" : maskEmail(staff.email) });
  } catch (err) {
    console.error("[haven-staff/login]", err);
    return NextResponse.json({ ok: false, found: true, error: "We could not send the code just now. Please try again in a minute." });
  }
}
