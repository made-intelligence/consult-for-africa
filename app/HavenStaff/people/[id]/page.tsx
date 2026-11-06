import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/staffAuth";
import { canManage } from "@/lib/havenPerformance";
import PersonPerformance from "@/components/haven/PersonPerformance";

export const metadata: Metadata = { title: "Haven Paediatric Centre: performance", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getStaffSession();
  if (!session) redirect("/HavenStaff/login");
  const { id } = await params;
  const p = await prisma.staffMember.findFirst({ where: { id, clientId: session.clientId }, select: { id: true, name: true, position: true, lineManagerId: true } });
  if (!p) notFound();
  if (!canManage(session, p) && p.id !== session.sub) redirect("/HavenStaff/people");
  return (
    <main style={{ background: "#F8FAFC", minHeight: "100vh", fontFamily: "system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" }}>
      <div style={{ background: "#081521", padding: "40px 20px 44px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ width: 44, height: 3, background: "#D4AF37", marginBottom: 16 }} />
          <Link href="/HavenStaff/people" style={{ color: "#9FC6D1", fontSize: 13.5, textDecoration: "none" }}>&lsaquo; My people</Link>
          <h1 style={{ color: "#fff", fontSize: 30, margin: "10px 0 0" }}>{p.name}</h1>
          <p style={{ color: "#B9CBD8", fontSize: 16, margin: "8px 0 0" }}>{p.position}</p>
        </div>
      </div>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 20px 72px" }}>
        <PersonPerformance session={session} personId={p.id} />
      </div>
    </main>
  );
}
