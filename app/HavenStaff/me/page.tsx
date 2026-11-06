import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getStaffSession, greetingName } from "@/lib/staffAuth";
import PersonPerformance from "@/components/haven/PersonPerformance";

export const metadata: Metadata = { title: "Haven Paediatric Centre: my performance", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function MePage() {
  const session = await getStaffSession();
  if (!session) redirect("/HavenStaff/login");
  return (
    <main style={{ background: "#F8FAFC", minHeight: "100vh", fontFamily: "system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" }}>
      <div style={{ background: "#081521", padding: "40px 20px 44px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ width: 44, height: 3, background: "#D4AF37", marginBottom: 16 }} />
          <Link href="/HavenStaff" style={{ color: "#9FC6D1", fontSize: 13.5, textDecoration: "none" }}>&lsaquo; The staff page</Link>
          <h1 style={{ color: "#fff", fontSize: 30, margin: "10px 0 0" }}>My objectives, {greetingName(session.name)}</h1>
          <p style={{ color: "#B9CBD8", fontSize: 16, lineHeight: 1.6, margin: "10px 0 0", maxWidth: 680 }}>
            Your job description, your objectives for the cycle, your monthly conversations and your appraisal, in one place. For your development, never tied to pay.
          </p>
        </div>
      </div>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 20px 72px" }}>
        <PersonPerformance session={session} personId={session.sub} />
      </div>
    </main>
  );
}
