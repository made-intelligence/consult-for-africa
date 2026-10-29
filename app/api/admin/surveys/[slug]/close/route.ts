import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { ELEVATED_ROLES } from "@/lib/constants";
import { surveyBySlug } from "@/lib/surveys/registry";
import { loadSurvey } from "@/lib/surveys/archive";

const bodySchema = z.object({
  action: z.enum(["close", "reopen"]),
  note: z.string().max(2000).optional(),
});

/**
 * POST /api/admin/surveys/[slug]/close
 *
 * Closing stamps the count at this moment. Reopening removes the stamp rather
 * than editing it, because a frozen count that can be revised is not a frozen
 * count; if the fieldwork restarts, the next close makes a new one.
 */
export const POST = handler(async (req: NextRequest, ctx: { params: Promise<{ slug: string }> }) => {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!ELEVATED_ROLES.includes(session.user.role as (typeof ELEVATED_ROLES)[number])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slug } = await ctx.params;
  if (!surveyBySlug(slug)) {
    return NextResponse.json({ error: "Unknown survey" }, { status: 404 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (parsed.data.action === "reopen") {
    await prisma.surveyClosure.deleteMany({ where: { survey: slug } });
    return NextResponse.json({ ok: true, closed: false });
  }

  const count = (await loadSurvey(slug)).length;
  if (count === 0) {
    return NextResponse.json(
      { error: "There is nothing to freeze. Close it once responses have arrived." },
      { status: 400 },
    );
  }

  const closure = await prisma.surveyClosure.upsert({
    where: { survey: slug },
    create: {
      survey: slug,
      frozenCount: count,
      closedById: session.user.id,
      note: parsed.data.note ?? null,
    },
    // Re-closing after a reopen stamps the new count, which is the point.
    update: {
      frozenCount: count,
      closedAt: new Date(),
      closedById: session.user.id,
      note: parsed.data.note ?? null,
    },
  });

  return NextResponse.json({ ok: true, closed: true, frozenCount: closure.frozenCount });
});
