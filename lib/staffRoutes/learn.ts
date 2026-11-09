import { prisma } from "@/lib/prisma";
import type { StaffSession } from "@/lib/staffAuth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { can } from "@/lib/staffAuth";
import { PASS_MARK } from "@/lib/havenLearn";

// Read a module, take its test, or approve it for staff. Shared by every staff
// site; Haven's route was the original and behaves exactly as it did.
//
// Marking happens here and never in the browser: the answers are not sent to
// the page until somebody has submitted, so the test cannot be read off it.

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("read"), protocolId: z.string().min(1) }),
  z.object({ action: z.literal("test"), protocolId: z.string().min(1), answers: z.array(z.number().int().min(-1)).max(30) }),
  z.object({ action: z.literal("approve"), protocolId: z.string().min(1), note: z.string().max(500).optional() }),
  z.object({ action: z.literal("sendBack"), protocolId: z.string().min(1), note: z.string().trim().min(3).max(2000) }),
  z.object({ action: z.literal("review"), protocolId: z.string().min(1), questionIds: z.array(z.string()).min(1).max(3), answers: z.array(z.number().int()).max(3) }),
  z.object({ action: z.literal("observe"), protocolId: z.string().min(1), staffId: z.string().min(1) }),
]);

const DAY = 864e5;
/** Days until the next re-test, by the stage just reached. */
const GAP: Record<number, number | null> = { 1: 2, 2: 14, 3: 60, 4: null };

export interface LearnRouteOptions {
  /**
   * The approver may return a module with a note instead of approving it.
   * Off for Haven, whose approvers say what is wrong on the staff page.
   */
  sendBack?: boolean;
}

export function learnPOST(getSession: () => Promise<StaffSession | null>, opts: LearnRouteOptions = {}) {
  return async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
    const body = parsed.data;
    // A site that has not switched send-back on sees it as an unknown action.
    if (body.action === "sendBack" && !opts.sendBack) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    const protocol = await prisma.protocol.findUnique({
      where: { id: body.protocolId },
      select: {
        id: true, clientId: true, isActive: true, approvedAt: true, version: true, startsOn: true,
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
        data: {
          approvedById: session.sub, approvedAt: new Date(), approvalNote: body.note?.trim() || null,
          ...(opts.sendBack ? { sentBackAt: null } : {}),
        },
      });
      return NextResponse.json({ ok: true });
    }

    if (body.action === "sendBack") {
      if (!me?.canApproveClinical) return NextResponse.json({ error: "Only a clinician named to approve can do this" }, { status: 403 });
      if (protocol.approvedAt) return NextResponse.json({ error: "Already approved" }, { status: 409 });
      await prisma.protocol.update({
        where: { id: protocol.id },
        data: { sentBackAt: new Date(), approvalNote: body.note },
      });
      return NextResponse.json({ ok: true });
    }

    // Nothing reaches staff until a clinician has approved it.
    if (!protocol.approvedAt) return NextResponse.json({ error: "Not approved yet" }, { status: 403 });
    // Nor before its week. Null is live now (every Haven module).
    if (protocol.startsOn && protocol.startsOn.getTime() > Date.now()) {
      return NextResponse.json({ error: "Not open yet" }, { status: 403 });
    }

    if (body.action === "observe") {
      // Watched doing it, on shift, by a supervisor. Never your own.
      if (!can(session, "SIGN_OFF_SKILL")) return NextResponse.json({ error: "Only a supervisor can sign off a skill" }, { status: 403 });
      if (body.staffId === session.sub) return NextResponse.json({ error: "Nobody signs off their own skill" }, { status: 403 });
      const who = await prisma.staffMember.findFirst({ where: { id: body.staffId, clientId: session.clientId }, select: { id: true } });
      if (!who) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const now = new Date();
      await prisma.protocolProgress.upsert({
        where: { protocolId_staffId: { protocolId: protocol.id, staffId: who.id } },
        create: { protocolId: protocol.id, staffId: who.id, observedById: session.sub, observedAt: now, againstVersion: protocol.version },
        update: { observedById: session.sub, observedAt: now },
      });
      return NextResponse.json({ ok: true });
    }

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

    if (body.action === "review") {
      if (!existing || existing.againstVersion !== protocol.version || !existing.passed) {
        return NextResponse.json({ error: "Pass the module first" }, { status: 409 });
      }
      const byId = new Map(protocol.questions.map((q) => [q.id, q]));
      const results = body.questionIds.map((id, i) => {
        const q = byId.get(id);
        return { correct: q?.correct ?? -1, right: !!q && body.answers[i] === q.correct, because: q?.because ?? null };
      });
      const allRight = results.every((r) => r.right);
      const stage = allRight ? Math.min(4, existing.reviewStage + 1) : Math.max(1, existing.reviewStage);
      const gap = allRight ? GAP[stage] : 2;
      await prisma.protocolProgress.update({
        where: key,
        data: { reviewStage: stage, nextReviewAt: gap === null ? null : new Date(now.getTime() + gap * DAY) },
      });
      return NextResponse.json({ ok: true, results, allRight, stage });
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
        ...(passed ? { reviewStage: 1, nextReviewAt: new Date(now.getTime() + 2 * DAY) } : {}),
      },
      update: {
        acknowledgedAt: existing?.acknowledgedAt ?? now,
        studiedAt: existing?.studiedAt ?? now,
        testedAt: now,
        score,
        outOf: qs.length,
        // Once passed on this version, a later slip does not undo it.
        passed: !stale && existing?.passed ? true : passed,
        ...(passed && (stale || !existing?.passed) ? { reviewStage: 1, nextReviewAt: new Date(now.getTime() + 2 * DAY) } : {}),
        attempts: stale ? 1 : (existing?.attempts ?? 0) + 1,
        againstVersion: protocol.version,
      },
    });

    return NextResponse.json({ ok: true, score, outOf: qs.length, passed, results });
  };
}
