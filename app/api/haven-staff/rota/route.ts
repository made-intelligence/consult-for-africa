import { getStaffSession } from "@/lib/staffAuth";
import { rotaPOST } from "@/lib/staffRoutes/rota";

// The handler lives in lib/staffRoutes/rota.ts so every staff site shares it.

export const dynamic = "force-dynamic";

export const POST = rotaPOST(getStaffSession);
