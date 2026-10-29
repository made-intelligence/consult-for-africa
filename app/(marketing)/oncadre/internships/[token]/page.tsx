import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadApplication, publicView } from "@/lib/cadreHealth/internship/state";
import { INTAKE_LABEL } from "@/lib/cadreHealth/internship/programme";
import { PUBLIC_CENTRE } from "@/lib/cadreHealth/internship/listing";
import { prisma } from "@/lib/prisma";
import { PER_SECTION, SECTIONS, TIME_LIMIT_MINUTES } from "@/lib/cadreHealth/internship/questionBank";
import InternshipApplication from "./InternshipApplication";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your internship application | CadreHealth",
  robots: { index: false, follow: false },
};

export default async function InternshipTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const app = await loadApplication(token);
  if (!app) notFound();
  const centres = await prisma.cadreInternshipCentre.findMany({ where: PUBLIC_CENTRE, orderBy: { name: "asc" }, select: { id: true, name: true, area: true } });

  return (
    <main className="bg-[#F8F9FB] min-h-screen">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">Nursing internship, {INTAKE_LABEL}</p>
        <InternshipApplication
          token={token}
          initial={publicView(app)}
          questionCount={PER_SECTION * Object.keys(SECTIONS).length}
          minutes={TIME_LIMIT_MINUTES}
          centres={centres}
        />
      </div>
    </main>
  );
}
