import { NextRequest } from "next/server";
import { requestStaffCode } from "@/lib/staffLogin";
import { HAVEN } from "@/lib/staffSites";

// Public endpoint. A staff member gives their email or mobile number and gets a
// six-digit code. The sign-in itself, and why it works the way it does, lives
// in lib/staffLogin.ts so every staff site shares one copy.

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return requestStaffCode(req, HAVEN);
}
