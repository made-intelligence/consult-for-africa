import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendTransactionalEmail } from "@/lib/zeptomail";
import { newLoginToken, TOKEN_TTL_MINUTES } from "@/lib/staffAuth";

// Public endpoint. A staff member types their email and gets a single-use link.
//
// The response is identical whether or not the address belongs to anybody, so
// this cannot be used to find out who works at the hospital. For nineteen named
// people that matters less than usual, but the surface is public and the cost
// of getting it right is one line.

export const dynamic = "force-dynamic";

const CLIENT_NAME = "Haven Paediatric Centre";
const bodySchema = z.object({ email: z.string().email().max(200) });

function siteUrl() {
  return (process.env.NEXTAUTH_URL ?? "https://www.consultforafrica.com").replace(/\/$/, "");
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
      select: { id: true, name: true },
    });
    if (!staff) return NextResponse.json({ ok: true });

    // Retire any link already outstanding, so the most recent request is the
    // only one that works and an old email in a shared inbox is inert.
    await prisma.staffLoginToken.updateMany({
      where: { staffId: staff.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const { raw, hash } = newLoginToken();
    await prisma.staffLoginToken.create({
      data: {
        staffId: staff.id,
        tokenHash: hash,
        expiresAt: new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000),
      },
    });

    const link = `${siteUrl()}/api/haven-staff/verify?token=${encodeURIComponent(raw)}`;
    const firstName = staff.name.split(" ")[0];

    await sendTransactionalEmail({
      from: process.env.SMTP_FROM ?? "Consult for Africa <hello@consultforafrica.com>",
      replyTo: process.env.REPLY_TO_EMAIL ?? "hello@consultforafrica.com",
      to: email,
      subject: "Your link to the Haven staff page",
      text: `Hello ${firstName},

Here is your link to the Haven staff page. Tap it and you are in. There is no password to remember.

${link}

The link works once and lasts ${TOKEN_TTL_MINUTES} minutes. If it expires, just ask for another one.

If you did not ask for this, you can ignore it. Nobody can use it but you.

Consult for Africa
hello@consultforafrica.com`,
      html: `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15.5px;line-height:1.65;color:#1F2937">
<p>Hello ${firstName},</p>
<p>Here is your link to the Haven staff page. Tap it and you are in. There is no password to remember.</p>
<p style="margin:26px 0">
  <a href="${link}" style="background:#0B3C5D;color:#fff;text-decoration:none;padding:14px 26px;border-radius:10px;font-weight:600;display:inline-block">Open the staff page</a>
</p>
<p style="color:#6B7280;font-size:14px">The link works once and lasts ${TOKEN_TTL_MINUTES} minutes. If it expires, just ask for another one.</p>
<p style="color:#6B7280;font-size:14px">If you did not ask for this, you can ignore it. Nobody can use it but you.</p>
<p style="color:#6B7280;font-size:14px">Consult for Africa<br>hello@consultforafrica.com</p>
</div>`,
    });
  } catch (err) {
    // Never leak the reason. A failure here must look the same as success, or
    // the error itself becomes the enumeration oracle.
    console.error("[haven-staff/login]", err);
  }

  return NextResponse.json({ ok: true });
}
