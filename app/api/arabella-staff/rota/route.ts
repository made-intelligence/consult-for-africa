import { getSiteSession } from "@/lib/staffAuth";
import { ARABELLA } from "@/lib/staffSites";
import { rotaPOST } from "@/lib/staffRoutes/rota";

export const dynamic = "force-dynamic";

export const POST = rotaPOST(() => getSiteSession(ARABELLA));
