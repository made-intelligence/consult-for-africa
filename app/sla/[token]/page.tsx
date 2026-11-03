import type { Metadata } from "next";
import ReturnForm from "./ReturnForm";

export const metadata: Metadata = {
  title: "Return your signed agreement",
  robots: { index: false, follow: false },
};

/**
 * The page a hospital opens from its reminder or WhatsApp. Built for a phone
 * at a front desk: download the agreement, photograph or scan the signed
 * copy, send it, done. No login, because asking an MD to make an account is
 * how agreements end up back in the drawer.
 */
export default async function ReturnPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <main style={{ minHeight: "100vh", background: "#F7F4EE", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div style={{ background: "#0B3C5D", borderBottom: "4px solid #D4A017", padding: "20px 16px" }}>
        <p style={{ margin: 0, color: "#D4A017", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase" }}>Provider agreement</p>
      </div>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px 48px" }}>
        <ReturnForm token={token} />
        <p style={{ marginTop: 32, fontSize: 12, color: "#64748B", lineHeight: 1.6 }}>
          This page is private to your facility. What you upload goes only to the team handling your agreement, and is used for nothing else.
          Managed by Consult for Africa.
        </p>
      </div>
    </main>
  );
}
