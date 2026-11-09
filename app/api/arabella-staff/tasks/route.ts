import { getSiteSession } from "@/lib/staffAuth";
import { ARABELLA } from "@/lib/staffSites";
import { tasksPOST } from "@/lib/staffRoutes/tasks";

export const dynamic = "force-dynamic";

export const POST = tasksPOST(() => getSiteSession(ARABELLA));
