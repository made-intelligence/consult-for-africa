import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";

/**
 * The Medlyfe aesthetics pages sit outside the Consult for Africa marketing
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
    default: "Medlyfe Wellness and Longevity Centre",
    template: "%s | Medlyfe",
  },
  description:
    "Aesthetic care in Lagos for the woman who wants to look rested, not rearranged. Registered clinicians, and a consultation that will tell you when the answer is no.",
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "Medlyfe Wellness and Longevity Centre",
    images: [
      {
        url: "/medlyfe-og.jpg",
        width: 1200,
        height: 630,
        alt: "Medlyfe presents Ageless",
      },
    ],
    title: "The Art of Looking Like Yourself",
    description:
      "Aesthetic care in Lagos for the woman who wants to look rested, not rearranged. A consultation that will tell you when the answer is no.",
  },
  // The root layout declares icons explicitly, and an explicit declaration
  // beats the icon file convention in a child segment, which is why the mark
  // was sitting in the tree doing nothing. Stated here, it wins back.
  twitter: { card: "summary_large_image", images: ["/medlyfe-og.jpg"] },
  icons: {
    icon: [{ url: "/lyfe-icon.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/lyfe-icon.svg", type: "image/svg+xml" }],
  },
};

export default function LyfeLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} ${sans.variable}`}>{children}</div>;
}
