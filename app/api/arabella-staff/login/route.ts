import { NextRequest } from "next/server";
import { requestStaffCode } from "@/lib/staffLogin";
import { ARABELLA } from "@/lib/staffSites";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return requestStaffCode(req, ARABELLA);
}
