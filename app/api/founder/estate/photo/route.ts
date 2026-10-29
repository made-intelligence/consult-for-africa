import { handler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/apiAuth";
import { ELEVATED_ROLES } from "@/lib/constants";
import { isEstateKey, viewUrl } from "@/lib/estate/photos";

/**
 * Reading a photograph back.
 *
 * Platform auth, and the answer is a five-minute presigned GET rather than a
 * durable link. These are pictures of the inside of tenants' homes and the
 * bucket serves anything whose key is known, so a link that does not expire is
 * effectively a permanent public copy.
 */
export const GET = handler(async function GET(req: Request) {
  const { error } = await requireAuth(ELEVATED_ROLES);
  if (error) return error;

  const key = new URL(req.url).searchParams.get("key");
  if (!key || !isEstateKey(key)) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.redirect(await viewUrl(key), 307);
});
