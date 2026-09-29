import { auth } from "@/auth";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateDownloadUrl } from "@/lib/r2";
import { ARABELLA_ENGAGEMENT } from "@/lib/arabella-audit";

// Reading an uploaded audit document back. Platform auth only, and the answer
// is a presigned GET that expires in five minutes rather than a durable link,
// because these are the client's bank statements, payer tariffs and patient data.

const ALLOWED_ROLES = ["PARTNER", "ADMIN", "ASSOCIATE_DIRECTOR", "DIRECTOR"];

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  // Scoped to this engagement, so an Arabella URL can only ever serve an
  // Arabella document even though every audit shares one table.
  const row = await prisma.auditUpload.findFirst({
    where: { id, engagement: ARABELLA_ENGAGEMENT },
    select: { storageKey: true, filename: true },
  });
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });

  const url = await generateDownloadUrl(row.storageKey, 300);
  return Response.redirect(url, 307);
}
