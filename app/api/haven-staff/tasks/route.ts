import { getStaffSession } from "@/lib/staffAuth";
import { tasksPOST } from "@/lib/staffRoutes/tasks";

// The handler lives in lib/staffRoutes/tasks.ts so every staff site shares it.

export const dynamic = "force-dynamic";

export const POST = tasksPOST(getStaffSession);
