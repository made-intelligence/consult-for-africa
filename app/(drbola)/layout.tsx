import type { Metadata } from "next";
import { Source_Serif_4, Inter } from "next/font/google";
import { DB, DRBOLA, DRBOLA_LIVE } from "@/lib/drbola";
import Header from "@/components/drbola/Header";
import Footer from "@/components/drbola/Footer";
import PreviewBar from "@/components/drbola/PreviewBar";
import FeedbackWidget from "@/components/drbola/FeedbackWidget";
import WhatsAppButton from "@/components/drbola/WhatsAppButton";

/**
 * Dr Bola Akinola's site sits outside the Consult for Africa shell, like ilé
 * and Lyfe. A patient arriving here is choosing a surgeon and has no reason to
 * meet his consultants. While in preview it is kept out of search so it never
 * competes with the domain it will move to.
 */

const display = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--db-display",
  display: "swap",
});

const sans = Inter({ subsets: ["latin"], variable: "--db-sans", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: `${DRBOLA.short}, Revision Hip and Knee Surgeon in Lagos`,
    template: `%s | ${DRBOLA.short}`,
  },
  description:
    "Revision hip and knee surgery, failed and infected replacements, and complex reconstruction in Lagos and Abuja. UK-trained, FRCS (Tr. & Orth.). Free second opinion on your X-rays.",
  robots: DRBOLA_LIVE ? undefined : { index: false, follow: false },
  icons: { icon: "/drbola/monogram.webp", apple: "/drbola/monogram.webp" },
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: DRBOLA.short,
    title: "I fix what others can't.",
    description: "Revision hip and knee surgery in Lagos and Abuja. Free second opinion on your X-rays.",
    images: [{ url: "/drbola/portrait.webp", width: 900, height: 837, alt: DRBOLA.name }],
  },
};

const vars = Object.fromEntries(
  Object.entries(DB).map(([k, v]) => [`--db-${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`, v]),
) as React.CSSProperties;

export default function DrBolaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${display.variable} ${sans.variable} min-h-screen bg-(--db-ground) text-(--db-body) antialiased`}
      style={{ ...vars, fontFamily: "var(--db-sans), system-ui, sans-serif" }}
    >
      {!DRBOLA_LIVE && <PreviewBar />}
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppButton />
      {!DRBOLA_LIVE && <FeedbackWidget />}
    </div>
  );
}
