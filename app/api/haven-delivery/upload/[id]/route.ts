import { auth } from "@/auth";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateDownloadUrl } from "@/lib/r2";

// Reading a piece of Haven evidence back. Platform auth only, and the answer is
// a presigned GET that expires in five minutes rather than a durable link,
// because the bucket itself is readable to anyone holding a key.

const ALLOWED_ROLES = ["PARTNER", "ADMIN", "ASSOCIATE_DIRECTOR", "DIRECTOR"];
const HAVEN_ENGAGEMENT = "haven";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  // Scoped to this engagement, so a Haven URL can only ever serve a Haven
  // document even though every engagement shares one table.
  const row = await prisma.auditUpload.findFirst({
    where: { id, engagement: HAVEN_ENGAGEMENT },
    select: { storageKey: true },
  });
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });

  const url = await generateDownloadUrl(row.storageKey, 300);
  return Response.redirect(url, 307);
}
