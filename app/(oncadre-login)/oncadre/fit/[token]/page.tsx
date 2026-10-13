import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { orgFromFitToken, readFitProfile } from "@/lib/cadreHealth/fitProfile";
import { FEE_OPTIONS, INTRO_TERMS } from "@/lib/cadreHealth/introductionTerms";
import FitForm from "./FitForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "What fit looks like | CadreHealth", robots: { index: false, follow: false } };

export default async function FitPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const orgId = orgFromFitToken(token);
  if (!orgId) notFound();
  const org = await prisma.cadreEmployerOrg.findUnique({ where: { id: orgId }, select: { name: true, facilityId: true } });
  if (!org?.facilityId) notFound();

  const mandates = await prisma.cadreMandate.findMany({
    where: { facilityId: org.facilityId, status: "OPEN" },
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true, slug: true, fitProfile: true, _count: { select: { matches: { where: { source: "APPLIED" } } } } },
  });
  const roles = mandates.map((m) => ({ id: m.id, title: m.title, slug: m.slug, applied: m._count.matches, fit: readFitProfile(m.fitProfile) }));
  const first = roles.find((r) => r.fit)?.fit;

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <p>
        <span className="text-lg font-bold text-[#0B3C5D]">Cadre</span>
        <span className="text-lg font-bold text-[#D4AF37]">Health</span>
      </p>
      <h1 className="mt-6 font-bold text-gray-900 leading-tight" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2rem)" }}>
        What fit looks like at {org.name}
      </h1>
      <p className="mt-3 text-gray-600">
        Every applicant is scored against what you write here, and only the ones who meet it reach your dashboard. Ten minutes now saves you reading applications that were never going to work. You can come back to this link and change your answers at any time; everyone is re-scored when you do.
      </p>
      <FitForm
        token={token}
        orgName={org.name}
        roles={roles.map((r) => ({ id: r.id, title: r.title, applied: r.applied, fit: r.fit }))}
        shared={{ relocation: first?.relocation ?? "", process: first?.process ?? "" }}
        name={first?.answeredBy ?? ""}
        feeOption={first?.feeOption}
        terms={INTRO_TERMS}
        feeOptions={FEE_OPTIONS.map((f) => ({ value: f.value, label: f.label }))}
      />
    </main>
  );
}
