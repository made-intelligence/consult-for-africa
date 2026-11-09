import { getStaffSession } from "@/lib/staffAuth";
import { safetyPATCH } from "@/lib/staffRoutes/safety";

// The handler lives in lib/staffRoutes/safety.ts so every staff site shares it.

export const dynamic = "force-dynamic";

export const PATCH = safetyPATCH(getStaffSession);
