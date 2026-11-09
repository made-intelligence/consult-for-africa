import { NextRequest } from "next/server";
import { verifyStaffCode } from "@/lib/staffLogin";
import { ARABELLA } from "@/lib/staffSites";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return verifyStaffCode(req, ARABELLA);
}
