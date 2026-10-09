import { auth } from "@/auth";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Publish or withdraw a client dashboard. Publishing archives whatever was
// live for that engagement, so the portal only ever has one version to show.

const PUBLISHERS = ["PARTNER", "ADMIN"];
const body = z.object({ action: z.enum(["publish", "unpublish"]) });

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !PUBLISHERS.includes(session.user.role)) {
    return Response.json({ error: "Only a partner can publish to a client." }, { status: 403 });
  }
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });

  const { id } = await ctx.params;
  const row = await prisma.engagementDashboard.findUnique({ where: { id }, select: { id: true, engagementId: true, status: true } });
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });

  if (parsed.data.action === "publish") {
    await prisma.$transaction([
      prisma.engagementDashboard.updateMany({
        where: { engagementId: row.engagementId, status: "PUBLISHED", NOT: { id } },
        data: { status: "ARCHIVED" },
      }),
      prisma.engagementDashboard.update({
        where: { id },
        data: { status: "PUBLISHED", publishedAt: new Date(), publishedBy: session.user.name ?? session.user.email ?? null },
      }),
    ]);
  } else {
    await prisma.engagementDashboard.update({ where: { id }, data: { status: "DRAFT", publishedAt: null, publishedBy: null } });
  }
  return Response.json({ ok: true });
}
