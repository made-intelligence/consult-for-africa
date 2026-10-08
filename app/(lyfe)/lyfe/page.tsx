import { redirect } from "next/navigation";

/**
 * The evening moved to /ageless on 8 October 2026 when it became purely
 * Medlyfe's. Links already shared, and any ads, still point here, so they are
 * sent on with their tracking intact.
 */
export default async function LyfeRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") qs.set(k, v);
  }
  const q = qs.toString();
  redirect(q ? `/ageless?${q}` : "/ageless");
}
