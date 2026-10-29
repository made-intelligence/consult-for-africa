import type { Metadata } from "next";
import CrewConsole from "./CrewConsole";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Estate team",
  robots: { index: false, follow: false },
  other: { referrer: "no-referrer" },
};

/**
 * The ground team's screen.
 *
 * Client-rendered against one state endpoint rather than server-rendered,
 * because the thing this page is for — is the generator on right now — is live,
 * and a cached server render showing OFF next to a running set is how a run
 * gets started twice.
 */
export default async function CrewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <CrewConsole token={token} />;
}
