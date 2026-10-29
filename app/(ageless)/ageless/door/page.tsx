import type { Metadata } from "next";
import DoorApp from "./DoorApp";

export const metadata: Metadata = {
  title: "AGELESS · Door",
  robots: { index: false, follow: false },
};

/** The ushers' check-in screen. Everything behind the door PIN happens in the API. */
export default function DoorPage() {
  return <DoorApp />;
}
