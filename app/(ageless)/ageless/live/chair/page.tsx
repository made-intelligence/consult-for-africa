import type { Metadata } from "next";
import ChairApp from "./ChairApp";

export const metadata: Metadata = {
  title: "AGELESS · Chair",
  robots: { index: false, follow: false },
};

/** The chair's phone: questions by votes, mark answered, hide. Behind a PIN. */
export default function ChairPage() {
  return <ChairApp />;
}
