import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";

/**
 * The coordinator's write endpoint.
 *
 * The one field that matters here is firstContactedAt, and it is write once.
 * The gap between createdAt and firstContactedAt is the number that explains
 * the March campaign, so it is not something a coordinator should be able to
 * tidy up after the fact by marking a three day old row as contacted twice.
 */

const ALLOWED_ROLES = ["ASSOCIATE_DIRECTOR", "DIRECTOR", "PARTNER", "ADMIN"];

const schema = z.object({
  action: z.enum(["LOG_CONTACT", "UPDATE"]),
  status: z
    .enum([
      "NEW",
      "CONTACTED",
      "BOOKED",
      "ATTENDED",
      "CONVERTED",
      "FOLLOW_UP_LATER",
      "UNREACHABLE",
      "NOT_PROCEEDING",
    ])
    .optional(),
  nextAction: z.string().trim().max(200).optional().nullable(),
  nextActionAt: z.string().datetime().optional().nullable(),
  note: z.string().trim().max(2000).optional().nullable(),
  takeOwnership: z.boolean().optional(),
});

export const PATCH = handler(async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Bad request" },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const existing = await prisma.lyfeEnquiry.findUnique({
    where: { id },
    select: { id: true, firstContactedAt: true, coordinatorNotes: true, contactAttempts: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const now = new Date();
  const update: Record<string, unknown> = {};

  if (data.action === "LOG_CONTACT") {
    // Write once. The clock on this row stops the first time somebody
    // actually speaks to the person, and never restarts.
    if (!existing.firstContactedAt) update.firstContactedAt = now;
    update.lastContactedAt = now;
    update.contactAttempts = existing.contactAttempts + 1;
    if (!data.status) update.status = "CONTACTED";
  }

  if (data.status) update.status = data.status;
  if (data.nextAction !== undefined) update.nextAction = data.nextAction || null;
  if (data.nextActionAt !== undefined) {
    update.nextActionAt = data.nextActionAt ? new Date(data.nextActionAt) : null;
  }
  if (data.takeOwnership) update.ownerId = session.user.id;

  if (data.note) {
    // Newest first, stamped, appended rather than replaced, so the history of
    // a lead survives the next person who picks it up.
    const stamp = `${now.toISOString().slice(0, 16).replace("T", " ")} ${session.user.name ?? session.user.email ?? "unknown"}`;
    const entry = `[${stamp}] ${data.note}`;
    update.coordinatorNotes = existing.coordinatorNotes
      ? `${entry}\n\n${existing.coordinatorNotes}`
      : entry;
  }

  const saved = await prisma.lyfeEnquiry.update({
    where: { id },
    data: update,
    select: {
      id: true,
      status: true,
      firstContactedAt: true,
      lastContactedAt: true,
      contactAttempts: true,
      nextAction: true,
      nextActionAt: true,
      coordinatorNotes: true,
    },
  });

  return NextResponse.json({ ok: true, enquiry: saved });
});
