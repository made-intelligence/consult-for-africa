import type { Metadata } from "next";
import { LYFE_PANEL } from "@/lib/lyfe";
import LiveApp from "./LiveApp";

export const metadata: Metadata = {
  title: "AGELESS · Live questions",
  robots: { index: false, follow: false },
};

/** Guests post and vote on questions for the panel from their phones. */
export default function LivePage() {
  const speakers = Array.from(
    new Set(LYFE_PANEL.map((s) => s.name?.replace(/,.*$/, "").trim()).filter((n): n is string => !!n)),
  );
  return <LiveApp speakers={speakers} />;
}
