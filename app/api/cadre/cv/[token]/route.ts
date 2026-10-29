import { NextRequest, NextResponse } from "next/server";
import { handler } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { storeCv, verifyCvToken } from "@/lib/cadreHealth/cvRequest";

export const runtime = "nodejs";

/**
 * POST /api/cadre/cv/:token
 *
 * Takes a CV against the record the signed token names. No login: the token is
 * the authority, and it can do nothing but this. See lib/cadreHealth/cvRequest.ts.
 */
export const POST = handler(async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const professionalId = verifyCvToken(token);
  if (!professionalId) {
    return NextResponse.json(
      { error: "This link has expired. Email hello@consultforafrica.com and we will send a new one." },
      { status: 401 },
    );
  }

  const exists = await prisma.cadreProfessional.findUnique({
    where: { id: professionalId },
    select: { id: true },
  });
  if (!exists) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const error = await storeCv(professionalId, file);
  if (error) return NextResponse.json({ error }, { status: 422 });
  return NextResponse.json({ ok: true });
});
