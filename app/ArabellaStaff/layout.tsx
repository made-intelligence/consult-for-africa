import type { Metadata } from "next";

// Every page under here is for Arabella's own staff. Unindexed and unlisted.
export const metadata: Metadata = {
  title: "Arabella Women's Health: staff page",
  robots: { index: false, follow: false },
};

export default function ArabellaStaffLayout({ children }: { children: React.ReactNode }) {
  return children;
}
