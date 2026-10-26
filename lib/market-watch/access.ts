import { auth } from "@/auth";

/** Who can see and run Market Watch. The raw feed names members of the public, so it stays senior. */
export const WATCH_ROLES = ["PARTNER", "ADMIN", "DIRECTOR", "ASSOCIATE_DIRECTOR"];

export async function watchSession() {
  const session = await auth();
  if (!session?.user || !WATCH_ROLES.includes(session.user.role)) return null;
  return session;
}

export const forbidden = () => Response.json({ error: "Not allowed" }, { status: 403 });
