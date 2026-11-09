import { getSiteSession } from "@/lib/staffAuth";
import { ARABELLA } from "@/lib/staffSites";
import { learnPOST } from "@/lib/staffRoutes/learn";

// Read a module, take its test, approve it or send it back. The same handler
// as Haven's (lib/staffRoutes/learn.ts), with send-back switched on so Dr Chito
// can return a module with a note instead of approving it.

export const dynamic = "force-dynamic";

export const POST = learnPOST(() => getSiteSession(ARABELLA), { sendBack: true });
