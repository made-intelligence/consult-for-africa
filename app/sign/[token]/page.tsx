import type { Metadata } from "next";
import HospitalJourney from "./HospitalJourney";

export const metadata: Metadata = {
  title: "Your provider agreement",
  robots: { index: false, follow: false },
};

/**
 * The page a hospital opens from its introduction, its reminder or a WhatsApp.
 * Built for a phone at a front desk. No login: asking an MD to make an account
 * is how agreements end up back in the drawer.
 */
export default async function SignPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <main style={{ minHeight: "100vh", background: "#F7F4EE", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div style={{ background: "#0B3C5D", borderBottom: "4px solid #D4AF37", padding: "18px 16px" }}>
        <p style={{ margin: 0, color: "#D4AF37", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase" }}>Provider network</p>
      </div>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px 48px" }}>
        <HospitalJourney token={token} />
      </div>
    </main>
  );
}
