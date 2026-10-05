import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";

/**
 * Lyfe Plastics and Dermatology sits outside the Consult for Africa marketing
 * shell, the same way ilé does and for the same reason: a woman arriving here
 * is deciding whether to trust someone with her face, and has no reason to
 * have heard of her clinic's management consultant.
 *
 * Typography is a high-contrast modern serif for display against a plain
 * humanist sans for anything that has to be read quickly, which is the pairing
 * the category reads as expensive without reading as a spa.
 */

const display = Fraunces({
  subsets: ["latin"],
  variable: "--lyfe-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--lyfe-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Lyfe Plastics and Dermatology",
    template: "%s | Lyfe Plastics and Dermatology",
  },
  description:
    "Aesthetic care in Lagos for the woman who wants to look rested, not rearranged. Registered clinicians, and a consultation that will tell you when the answer is no.",
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "Lyfe Plastics and Dermatology",
    title: "The Art of Looking Like Yourself",
    description:
      "Aesthetic care in Lagos for the woman who wants to look rested, not rearranged. A consultation that will tell you when the answer is no.",
  },
};

export default function LyfeLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} ${sans.variable}`}>{children}</div>;
}
