import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStaffSession } from "@/lib/staffAuth";
import { PASS_MARK } from "@/lib/havenLearn";

// Read a module, take its test, or approve it for staff.
//
// Marking happens here and never in the browser: the answers are not sent to
// the page until somebody has submitted, so the test cannot be read off it.

export const dynamic = "force-dynamic";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("read"), protocolId: z.string().min(1) }),
  z.object({ action: z.literal("test"), protocolId: z.string().min(1), answers: z.array(z.number().int().min(-1)).max(30) }),
  z.object({ action: z.literal("approve"), protocolId: z.string().min(1), note: z.string().max(500).optional() }),
]);

export async function POST(req: NextRequest) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const body = parsed.data;

  const protocol = await prisma.protocol.findUnique({
    where: { id: body.protocolId },
    select: {
      id: true, clientId: true, isActive: true, approvedAt: true, version: true,
      questions: { orderBy: { sortOrder: "asc" }, select: { id: true, correct: true, because: true } },
    },
  });
  if (!protocol || protocol.clientId !== session.clientId || !protocol.isActive) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const me = await prisma.staffMember.findUnique({ where: { id: session.sub }, select: { canApproveClinical: true } });

  if (body.action === "approve") {
    // A person, never a tier: see canApproveClinical in the schema.
    if (!me?.canApproveClinical) return NextResponse.json({ error: "Only a clinician named to approve can do this" }, { status: 403 });
    await prisma.protocol.update({
      where: { id: protocol.id },
      data: { approvedById: session.sub, approvedAt: new Date(), approvalNote: body.note?.trim() || null },
    });
    return NextResponse.json({ ok: true });
  }

  // Nothing reaches staff until a clinician has approved it.
  if (!protocol.approvedAt) return NextResponse.json({ error: "Not approved yet" }, { status: 403 });

  const key = { protocolId_staffId: { protocolId: protocol.id, staffId: session.sub } };
  const existing = await prisma.protocolProgress.findUnique({ where: key });
  // A reissued module re-opens the loop rather than inheriting the old pass.
  const stale = existing && existing.againstVersion !== protocol.version;
  const now = new Date();

  if (body.action === "read") {
    await prisma.protocolProgress.upsert({
      where: key,
      create: { protocolId: protocol.id, staffId: session.sub, acknowledgedAt: now, studiedAt: now, againstVersion: protocol.version },
      update: stale
        ? { acknowledgedAt: now, studiedAt: now, testedAt: null, score: null, outOf: null, passed: null, attempts: 0, againstVersion: protocol.version }
        : { acknowledgedAt: existing?.acknowledgedAt ?? now, studiedAt: existing?.studiedAt ?? now },
    });
    return NextResponse.json({ ok: true });
  }

  const qs = protocol.questions;
  if (qs.length === 0) return NextResponse.json({ error: "This module has no questions yet" }, { status: 422 });
  const results = qs.map((q, i) => ({ correct: q.correct, right: body.answers[i] === q.correct, because: q.because }));
  const score = results.filter((r) => r.right).length;
  const passed = score / qs.length >= PASS_MARK;

  await prisma.protocolProgress.upsert({
    where: key,
    create: {
      protocolId: protocol.id, staffId: session.sub, acknowledgedAt: now, studiedAt: now, testedAt: now,
      score, outOf: qs.length, passed, attempts: 1, againstVersion: protocol.version,
    },
    update: {
      acknowledgedAt: existing?.acknowledgedAt ?? now,
      studiedAt: existing?.studiedAt ?? now,
      testedAt: now,
      score,
      outOf: qs.length,
      // Once passed on this version, a later slip does not undo it.
      passed: !stale && existing?.passed ? true : passed,
      attempts: stale ? 1 : (existing?.attempts ?? 0) + 1,
      againstVersion: protocol.version,
    },
  });

  return NextResponse.json({ ok: true, score, outOf: qs.length, passed, results });
}
