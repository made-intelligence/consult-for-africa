import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendTransactionalEmail } from "@/lib/zeptomail";
import { newLoginCode, TOKEN_TTL_MINUTES, type DeliveryChannel } from "@/lib/staffAuth";
import { sendSMS } from "@/lib/cadreHealth/sms";

// Public endpoint. A staff member gives their email and gets a six-digit code.
//
// The response is identical whether or not the address belongs to anybody, so
// this cannot be used to find out who works at the hospital. For nineteen named
// people that matters less than usual, but the surface is public and the cost
// of getting it right is one line.

export const dynamic = "force-dynamic";

const CLIENT_NAME = "Haven Paediatric Centre";
const bodySchema = z.object({ email: z.string().email().max(200) });

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
  // Same shape as success: a malformed address is not worth distinguishing.
  if (!parsed.success) return NextResponse.json({ ok: true });

  const email = parsed.data.email.trim().toLowerCase();

  try {
    const client = await prisma.client.findFirst({
      where: { name: CLIENT_NAME },
      select: { id: true },
    });
    if (!client) return NextResponse.json({ ok: true });

    const staff = await prisma.staffMember.findFirst({
      where: { clientId: client.id, email, isActive: true },
      select: { id: true, name: true, phone: true },
    });
    if (!staff) return NextResponse.json({ ok: true });

    // Retire anything already outstanding, so only the newest code works and an
    // older email sitting in the inbox is inert.
    await prisma.staffLoginToken.updateMany({
      where: { staffId: staff.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const { code, hash } = newLoginCode(staff.id);
    await prisma.staffLoginToken.create({
      data: {
        staffId: staff.id,
        tokenHash: hash,
        expiresAt: new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000),
      },
    });

    const via = await deliver(email, staff.phone, staff.name.split(" ")[0], code);
    console.log(`[haven-staff/login] code issued via ${via}`);
  } catch (err) {
    // Never leak the reason. A failure here must look the same as success, or
    // the error itself becomes the enumeration oracle.
    console.error("[haven-staff/login]", err);
  }

  return NextResponse.json({ ok: true });
}
