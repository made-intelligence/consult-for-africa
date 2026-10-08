import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";

/**
 * Medlyfe presents AGELESS.
 *
 * The evening has its own address from 8 October 2026, when it became purely
 * Medlyfe's. It used to live at /lyfe under the aesthetics layout, which
 * put a plastic surgery practice's name in every tab and link preview. Same
 * type pairing as Lyfe so the page itself is unchanged; only the name moves.
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
    default: "MedLYFE presents Ageless",
    template: "%s | MedLYFE Wellness and Longevity Centre",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "MedLYFE Wellness and Longevity Centre",
    images: [
      {
        url: "/medlyfe-og.jpg",
        width: 1200,
        height: 630,
        alt: "MedLYFE presents Ageless",
      },
    ],
  },
  twitter: { card: "summary_large_image", images: ["/medlyfe-og.jpg"] },
  // The Medlyfe mark. The file is named for Lyfe but it has always been
  // Medlyfe's monogram.
  icons: {
    icon: [{ url: "/lyfe-icon.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/lyfe-icon.svg", type: "image/svg+xml" }],
  },
};

export default function AgelessLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} ${sans.variable}`}>{children}</div>;
}
