import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/apiAuth";
import { isProduct, ALL_STAGES } from "@/lib/hospital-sales";
import { queueCampaign, sendBatch, sendTest } from "@/lib/hospital-sales-send";

// Hospital sales campaigns. Sending is in two deliberate steps: queue (which
// shows how many will go and how many are suppressed), then send in slices
// under the daily cap. A test to yourself is always available before either.

export const maxDuration = 300;

const ROLES = ["PARTNER", "ADMIN", "ASSOCIATE_DIRECTOR", "DIRECTOR"];
const id = z.string().min(1).max(40);
const Body = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create"),
    product: z.string().refine(isProduct, "Unknown product"),
    name: z.string().trim().min(3).max(120),
    subject: z.string().trim().min(3).max(160),
    body: z.string().trim().min(40).max(6000),
    ctaText: z.string().trim().min(3).max(80),
    dailyCap: z.number().int().min(10).max(500),
  }),
  z.object({ action: z.literal("test"), campaignId: id }),
  z.object({ action: z.literal("queue"), campaignId: id, categories: z.array(z.string()).optional(), lgas: z.array(z.string()).optional() }),
  z.object({ action: z.literal("start"), campaignId: id }),
  z.object({ action: z.literal("pause"), campaignId: id }),
  z.object({ action: z.literal("send"), campaignId: id, max: z.number().int().min(1).max(200) }),
  z.object({ action: z.literal("stage"), hospitalId: id, product: z.string().refine(isProduct), stage: z.enum(ALL_STAGES as [string, ...string[]]), note: z.string().max(1000).optional() }),
  z.object({ action: z.literal("logContact"), hospitalId: id, channel: z.enum(["CALL", "WHATSAPP", "EMAIL", "VISIT", "MEETING"]), summary: z.string().trim().min(2).max(2000) }),
]);

export const POST = handler(async function POST(req: NextRequest) {
  const { error, session } = await requireAuth(ROLES);
  if (error) return error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  const b = parsed.data;

  try {
    switch (b.action) {
      case "create": {
        const c = await prisma.salesCampaign.create({ data: { product: b.product, name: b.name, subject: b.subject, body: b.body, ctaText: b.ctaText, dailyCap: b.dailyCap, createdById: session.user.id } });
        return NextResponse.json(c);
      }
      case "test": {
        const r = await sendTest(b.campaignId, session.user.email!);
        return r.ok ? NextResponse.json({ ok: true, to: session.user.email }) : NextResponse.json({ error: r.error }, { status: 502 });
      }
      case "queue":
        return NextResponse.json(await queueCampaign(b.campaignId, { categories: b.categories, lgas: b.lgas }));
      case "start":
        await prisma.salesCampaign.update({ where: { id: b.campaignId }, data: { status: "SENDING" } });
        return NextResponse.json({ ok: true });
      case "pause":
        await prisma.salesCampaign.update({ where: { id: b.campaignId }, data: { status: "PAUSED" } });
        return NextResponse.json({ ok: true });
      case "send":
        return NextResponse.json(await sendBatch(b.campaignId, b.max));
      case "stage": {
        await prisma.hospitalProductStage.upsert({
          where: { hospitalId_product: { hospitalId: b.hospitalId, product: b.product } },
          create: { hospitalId: b.hospitalId, product: b.product, stage: b.stage, note: b.note },
          update: { stage: b.stage, stageAt: new Date(), ...(b.note ? { note: b.note } : {}) },
        });
        return NextResponse.json({ ok: true });
      }
      case "logContact": {
        await prisma.$transaction([
          prisma.hospitalContactLog.create({ data: { hospitalId: b.hospitalId, contactedBy: session.user.name ?? session.user.email ?? session.user.id, channel: b.channel, summary: b.summary } }),
          prisma.hospital.update({ where: { id: b.hospitalId }, data: { lastContactDate: new Date() } }),
        ]);
        return NextResponse.json({ ok: true });
      }
    }
  } catch (err) {
    console.error(`[hospital-sales ${b.action}]`, err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 422 });
  }
});
