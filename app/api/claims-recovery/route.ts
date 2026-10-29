import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { isRateLimited } from "@/lib/rate-limit";
import { notifyInternal } from "@/lib/email";
import {
  LEAD_SOURCE,
  NOTIFY_TO,
  OLDEST_UNPAID,
  PAYER_COUNTS,
  PRODUCT_KEY,
  ROLES,
  SAMPLE_SIZE,
  SERVICE_LINE_HOOK,
  check,
  naira,
  score,
} from "@/lib/claims-recovery";
import { advances, importKey, splitPhones } from "@/lib/hospital-sales";

// The claims recovery enquiry. One public POST that:
//   1. writes a Lead into the main pipeline, scored on size and seniority,
//   2. puts the hospital in the sales directory (or finds it from the email
//      link it clicked) and moves it to ENQUIRED for this product,
//   3. tells CFA, and sends the enquirer an acknowledgement with their numbers.
// Notifications sit in try/catch so a mail failure never loses the enquiry.

const body = z.object({
  hospital: z.string().trim().min(2, "Please give the hospital's name").max(160),
  fullName: z.string().trim().min(2, "Please give your name").max(120),
  role: z.enum(ROLES, { message: "Please choose your role" }),
  email: z.string().trim().toLowerCase().email("That email does not look right").max(200),
  phone: z.string().trim().min(7, "We need a number we can reach").max(40),
  city: z.string().trim().max(80).optional().default(""),
  payers: z.union([z.enum(PAYER_COUNTS), z.literal("")]).optional().default(""),
  oldest: z.union([z.enum(OLDEST_UNPAID), z.literal("")]).optional().default(""),
  wantsEarlyPayment: z.boolean().default(false),
  message: z.string().trim().max(2000).optional().default(""),
  monthlyBilled: z.number().min(0).max(10_000_000_000),
  daysToPay: z.number().min(0).max(720),
  queriedPct: z.number().min(0).max(100),
  ref: z.string().regex(/^[A-Za-z0-9_-]{16,40}$/).nullable().optional(),
  consent: z.literal(true, { message: "We need your agreement to hold your details" }),
  website: z.string().optional(),
});

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const POST = handler(async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip, "claims-recovery", { max: 6 })) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }
  const raw = await req.json().catch(() => null);
  if (raw?.website) return NextResponse.json({ ok: true }); // honeypot
  const parsed = body.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const d = parsed.data;
  const nums = { monthlyBilled: d.monthlyBilled, daysToPay: d.daysToPay, queriedPct: d.queriedPct };
  const r = check(nums);
  const s = score(nums, d.role);

  const summary = [
    `Billed to payers monthly: ${naira(d.monthlyBilled)}`,
    `Average days to payment: ${d.daysToPay}`,
    `Queried, cut or rejected: ${d.queriedPct}%`,
    `Owed at any one time: ${naira(r.outstanding)} (in dispute ${naira(r.inDispute)})`,
    `HMOs paying them: ${d.payers || "not given"}`,
    `Oldest unpaid claim: ${d.oldest || "not given"}`,
    `Early payment: ${d.wantsEarlyPayment ? "interested" : "not asked"}`,
    d.message ? `\nThey wrote: ${d.message}` : "",
  ].filter(Boolean).join("\n");

  const lead = await prisma.lead.create({
    data: {
      source: LEAD_SOURCE,
      status: "NEW",
      organizationName: d.hospital,
      organizationType: "HOSPITAL",
      contactName: d.fullName,
      contactEmail: d.email,
      contactPhone: d.phone,
      contactRole: d.role,
      country: "Nigeria",
      city: d.city || null,
      inboundMessage: summary,
      inboundProjectType: SERVICE_LINE_HOOK,
      serviceLineHook: SERVICE_LINE_HOOK,
      serviceLineHooks: [SERVICE_LINE_HOOK],
      qualificationScore: s,
      estimatedSize: r.outstanding >= 200_000_000 ? "LARGE" : r.outstanding >= 50_000_000 ? "MEDIUM" : "SMALL",
    },
  });

  // Tie the enquiry to the directory. A click from our email carries the send
  // token; an organic visitor becomes a new hospital record.
  try {
    let hospitalId: string | null = null;
    if (d.ref) {
      const send = await prisma.salesCampaignSend.findUnique({ where: { token: d.ref }, select: { id: true, hospitalId: true } });
      if (send) {
        hospitalId = send.hospitalId;
        await prisma.salesCampaignSend.update({ where: { id: send.id }, data: { enquiredAt: new Date() } });
      }
    }
    if (!hospitalId) {
      const key = importKey(d.hospital, d.city);
      const h = await prisma.hospital.upsert({
        where: { importKey: key },
        create: { name: d.hospital, state: d.city || "Unknown", city: d.city || null, importKey: key, source: "Website enquiry" },
        update: {},
        select: { id: true },
      });
      hospitalId = h.id;
    }
    const phone = splitPhones(d.phone)[0] ?? d.phone;
    await prisma.hospitalContact.upsert({
      where: { hospitalId_email: { hospitalId, email: d.email } },
      create: { hospitalId, email: d.email, phone, name: d.fullName, role: d.role, isPrimary: true, source: "Website enquiry" },
      update: { name: d.fullName, role: d.role, phone },
    });
    const st = await prisma.hospitalProductStage.findUnique({ where: { hospitalId_product: { hospitalId, product: PRODUCT_KEY } }, select: { stage: true } });
    if (!st || advances(st.stage, "ENQUIRED")) {
      await prisma.hospitalProductStage.upsert({
        where: { hospitalId_product: { hospitalId, product: PRODUCT_KEY } },
        create: { hospitalId, product: PRODUCT_KEY, stage: "ENQUIRED", leadId: lead.id },
        update: { stage: "ENQUIRED", stageAt: new Date(), leadId: lead.id },
      });
    }
  } catch (err) {
    console.error("[claims-recovery] directory link failed", err);
  }

  try {
    await notifyInternal(
      NOTIFY_TO,
      `Claims recovery enquiry (${s}): ${d.hospital}`,
      `<div style="font-family:sans-serif;max-width:620px">
        <h2 style="color:#0B3C5D;margin:0 0 6px">${esc(d.hospital)}</h2>
        <p style="margin:0 0 14px;color:#6b7280">${esc(d.fullName)}, ${esc(d.role)} · <a href="mailto:${esc(d.email)}">${esc(d.email)}</a> · ${esc(d.phone)}${d.city ? ` · ${esc(d.city)}` : ""}</p>
        <pre style="white-space:pre-wrap;font-family:inherit;font-size:14px;line-height:1.6;background:#F8FAFC;padding:14px;border-radius:8px">${esc(summary)}</pre>
        <p><a href="https://www.consultforafrica.com/admin/claims-recovery">Open the claims recovery funnel</a></p>
      </div>`,
    );
  } catch (err) {
    console.error("[claims-recovery] internal notify failed", err);
  }

  try {
    const first = d.fullName.split(/\s+/)[0];
    await notifyInternal(
      d.email,
      `Your receivables check, ${d.hospital}`,
      `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;color:#1f2937;font-size:15px;line-height:1.6">
        <p>Dear ${esc(first)},</p>
        <p>Thank you for checking ${esc(d.hospital)}'s receivables with us. On the figures you entered, about <strong>${naira(r.outstanding)}</strong> is owed to the hospital at any one time, and about <strong>${naira(r.inDispute)}</strong> of it is held up in queries and disputes.</p>
        <p>The next step is a free review of ${SAMPLE_SIZE} unpaid claims. Please send a simple list with the claim reference, the HMO or company, the date of service, the date submitted and the amount. No patient names or records are needed.</p>
        <p>We will come back within two working days with a short written read on what is recoverable, from whom, and how fast.</p>
        <p>Consult for Africa<br><span style="color:#6b7280">Lagos and Abuja · hello@consultforafrica.com</span></p>
      </div>`,
    );
  } catch (err) {
    console.error("[claims-recovery] acknowledgement failed", err);
  }

  return NextResponse.json({ ok: true });
});
