import { getStaffSession } from "@/lib/staffAuth";
import { learnPOST } from "@/lib/staffRoutes/learn";

// Read a module, take its test, or approve it for staff. The handler lives in
// lib/staffRoutes/learn.ts so every staff site shares it.

export const dynamic = "force-dynamic";

export const POST = learnPOST(getStaffSession);
