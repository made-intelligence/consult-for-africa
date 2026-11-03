import { NextRequest } from "next/server";
import { z } from "zod";
import type { Prisma, ProviderSigningStage } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { generateDownloadUrl } from "@/lib/r2";
import { CONTACT_KINDS, STAGES, cadenceAt, isClosed, isSigned, lagosDayStart, programmeAccess } from "@/lib/signings";

const Body = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("LOG"),
    kind: z.enum(CONTACT_KINDS),
    note: z.string().trim().max(2000).nullable().optional(),
    objection: z.string().trim().max(2000).nullable().optional(),
  }),
  z.object({ action: z.literal("STAGE"), stage: z.enum(STAGES as [ProviderSigningStage, ...ProviderSigningStage[]]), note: z.string().trim().max(2000).nullable().optional() }),
  z.object({
    action: z.literal("UPDATE"),
    fields: z
      .object({
        facility: z.string().trim().min(1).max(200),
        groupName: z.string().trim().max(200).nullable(),
        facilityType: z.string().trim().max(80).nullable(),
        lga: z.string().trim().max(80).nullable(),
        area: z.string().trim().max(120).nullable(),
        contactName: z.string().trim().max(160).nullable(),
        contactRole: z.string().trim().max(120).nullable(),
        phone: z.string().trim().max(60).nullable(),
        email: z.string().trim().max(200).nullable(),
        signatoryName: z.string().trim().max(160).nullable(),
        signatoryPhone: z.string().trim().max(60).nullable(),
        signatoryEmail: z.string().trim().max(200).nullable(),
        source: z.string().trim().max(120).nullable(),
        ownerId: z.string().nullable(),
        nextAction: z.string().trim().max(300).nullable(),
        nextActionAt: z.string().nullable(),
        objection: z.string().trim().max(2000).nullable(),
        notes: z.string().trim().max(4000).nullable(),
      })
      .partial(),
  }),
  z.object({ action: z.literal("PAUSE"), paused: z.boolean() }),
]);

async function load(id: string, user: { id: string; role: string }) {
  const p = await prisma.providerSigning.findUnique({ where: { id } });
  if (!p) return null;
  const access = await programmeAccess(p.programmeId, user);
  return access ? { p, access } : null;
}

/**
 * Everything a person does to a provider row. Logging a contact also moves
 * the chase on: if the step that was due has been done, the next one is set,
 * so nobody has to work out what day four means.
 */
export const PATCH = handler(async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const found = await load(id, session.user);
  if (!found) return Response.json({ error: "Not found" }, { status: 404 });
  const { p } = found;

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  const b = parsed.data;
  const now = new Date();
  const data: Prisma.ProviderSigningUpdateInput = {};
  const events: { kind: string; note?: string | null; stage?: ProviderSigningStage }[] = [];

  if (b.action === "LOG") {
    data.lastContactAt = now;
    if (!p.firstContactAt) data.firstContactAt = now;
    if (!p.ownerId) data.owner = { connect: { id: session.user.id } };
    if (p.stage === "TARGET") {
      data.stage = "CONTACTED";
      events.push({ kind: "STAGE", stage: "CONTACTED" });
    }
    if (b.objection) data.objection = p.objection ? `${p.objection}\n${b.objection}` : b.objection;
    // The step due today or earlier counts as done; set the one after it.
    const endOfToday = new Date(lagosDayStart(now).getTime() + 24 * 3600 * 1000);
    if (p.stage === "SLA_SENT" && p.slaSentAt && p.nextActionAt && p.nextActionAt < endOfToday) {
      let step = p.cadenceStep + 1;
      let next = cadenceAt(p.slaSentAt, step);
      while (next && next.nextActionAt < endOfToday) next = cadenceAt(p.slaSentAt, ++step);
      data.cadenceStep = step;
      data.nextAction = next?.nextAction ?? "Escalate or park";
      data.nextActionAt = next?.nextActionAt ?? endOfToday;
    }
    events.push({ kind: b.kind, note: [b.note, b.objection && `Objection: ${b.objection}`].filter(Boolean).join("\n") || null });
  }

  if (b.action === "STAGE" && b.stage !== p.stage) {
    data.stage = b.stage;
    events.push({ kind: "STAGE", stage: b.stage, note: b.note ?? null });
    if (b.stage === "SLA_SENT") {
      const sent = p.slaSentAt && p.stage === "SLA_SENT" ? p.slaSentAt : now;
      const c = cadenceAt(sent, 0);
      Object.assign(data, { slaSentAt: sent, cadenceStep: 0, chaseCount: 0, nextAction: c?.nextAction, nextActionAt: c?.nextActionAt });
    }
    if (isSigned(b.stage) && !p.signedAt) data.signedAt = now;
    if (b.stage === "DOCS_COMPLETE" && !p.docsCompleteAt) data.docsCompleteAt = now;
    if (b.stage === "WITH_CLIENT" && !p.sentToClientAt) data.sentToClientAt = now;
    if (isClosed(b.stage)) Object.assign(data, { nextAction: null, nextActionAt: null });
    if (!p.ownerId) data.owner = { connect: { id: session.user.id } };
  }

  if (b.action === "UPDATE") {
    const { ownerId, nextActionAt, email, signatoryEmail, ...rest } = b.fields;
    Object.assign(data, rest);
    if (email !== undefined) data.email = email?.toLowerCase() || null;
    if (signatoryEmail !== undefined) data.signatoryEmail = signatoryEmail?.toLowerCase() || null;
    if (nextActionAt !== undefined) data.nextActionAt = nextActionAt ? new Date(nextActionAt) : null;
    if (ownerId !== undefined) data.owner = ownerId ? { connect: { id: ownerId } } : { disconnect: true };
  }

  if (b.action === "PAUSE") {
    data.chasePaused = b.paused;
    events.push({ kind: "NOTE", note: b.paused ? "Automatic chase paused" : "Automatic chase resumed" });
  }

  await prisma.$transaction([
    prisma.providerSigning.update({ where: { id }, data }),
    ...events.map((e) =>
      prisma.providerSigningEvent.create({ data: { signingId: id, kind: e.kind, note: e.note ?? null, stage: e.stage ?? null, actorId: session.user.id } }),
    ),
  ]);
  return Response.json({ ok: true });
});

/** A short-lived link to the signed agreement or one of the documents. */
export const GET = handler(async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const found = await load(id, session.user);
  if (!found) return Response.json({ error: "Not found" }, { status: 404 });
  const file = req.nextUrl.searchParams.get("file");
  const key = file === "sla" ? found.p.signedFileKey : found.p.documentKeys[Number(req.nextUrl.searchParams.get("i") ?? -1)];
  if (!key) return Response.json({ error: "No such file" }, { status: 404 });
  return Response.redirect(await generateDownloadUrl(key), 302);
});
