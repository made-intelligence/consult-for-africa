import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { handler } from "@/lib/api-handler";
import { sendCvRequests } from "@/lib/cadreHealth/cvRequest";

import { CADRE_ADMIN_ROLES as ALLOWED_ROLES } from "@/lib/cadreHealth/mandateAccess";

// One email every 250ms; a few hundred applicants needs the headroom.
export const maxDuration = 300;

/**
 * POST /api/admin/cadrehealth/request-cvs
 *
 * Body: { mandateId?: string }. With a mandate, emails that role's applicants
 * who have no CV on file. Without one, every applicant to a live role. Anyone
 * asked in the last seven days, and anyone suppressed, is skipped.
 */
export const POST = handler(async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const mandateId = typeof body.mandateId === "string" ? body.mandateId : undefined;

  const result = await sendCvRequests({ mandateId, userId: session.user.id });
  return NextResponse.json(result);
});
