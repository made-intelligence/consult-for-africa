import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { addWorkingDays } from "@/lib/outreach";
import { viewUrl } from "@/lib/outreach-hospital";
import { canWork, sprintAccess } from "@/lib/outreach-server";

// A file a hospital returned. Viewing is a five-minute signed link, only for
// people on the sprint. Rejecting one tells the hospital on its page to send
// it again; a rejected agreement takes the provider back out of the count.

async function load(slug: string, fileId: string, user: { id: string; role: string }) {
  const a = await sprintAccess(slug, user);
  if (!a) return null;
  const f = await prisma.sprintFile.findUnique({ where: { id: fileId }, include: { target: true } });
  if (!f || f.target.sprintId !== a.sprint.id) return null;
  return { a, f };
}

export const GET = handler(async (_req: NextRequest, ctx: { params: Promise<{ slug: string; fileId: string }> }) => {
  const session = await auth();
  if (!session) return Response.json({ error: "Please sign in" }, { status: 401 });
  const { slug, fileId } = await ctx.params;
  const x = await load(slug, fileId, session.user);
  if (!x) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.redirect(await viewUrl(x.f.key), 302);
});

const body = z.object({ action: z.literal("reject"), note: z.string().trim().min(3, "Say what is wrong, so the hospital can fix it").max(500) });

export const PATCH = handler(async (req: NextRequest, ctx: { params: Promise<{ slug: string; fileId: string }> }) => {
  const session = await auth();
  if (!session) return Response.json({ error: "Please sign in" }, { status: 401 });
  const { slug, fileId } = await ctx.params;
  const x = await load(slug, fileId, session.user);
  if (!x) return Response.json({ error: "Not found" }, { status: 404 });
  if (!canWork(x.a, x.f.target, session.user.id)) return Response.json({ error: "This provider is on someone else's list" }, { status: 403 });
  const parsed = body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
  const { f } = x;
  const t = f.target;
  const now = new Date();

  await prisma.sprintFile.update({ where: { id: f.id }, data: { rejectedAt: now, rejectNote: parsed.data.note } });
  const others = await prisma.sprintFile.count({ where: { targetId: t.id, kind: "AGREEMENT", rejectedAt: null } });
  const unsign = f.kind === "AGREEMENT" && others === 0 && ["SIGNED", "DOCS"].includes(t.stage);
  await prisma.$transaction([
    prisma.sprintTouch.create({ data: { targetId: t.id, userId: session.user.id, channel: "NOTE", outcome: "FILE_REJECTED", note: `${f.fileName}: ${parsed.data.note}`, stageFrom: t.stage, stageTo: unsign ? "SENT" : t.stage } }),
    prisma.sprintTarget.update({
      where: { id: t.id },
      data: {
        packReadyAt: null,
        nextAction: unsign ? "Signed copy rejected: get a clean signed copy" : `Get ${f.fileName} again`,
        nextActionAt: addWorkingDays(now, 1),
        ...(unsign ? { stage: "SENT", signedAt: null, docsAt: null } : {}),
      },
    }),
  ]);
  return Response.json({ ok: true });
});
