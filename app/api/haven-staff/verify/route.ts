import { NextRequest } from "next/server";
import { verifyStaffCode } from "@/lib/staffLogin";
import { HAVEN } from "@/lib/staffSites";

// Takes the email and the six-digit code and, if they match, sets the session.
// See lib/staffLogin.ts.

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return verifyStaffCode(req, HAVEN);
}
