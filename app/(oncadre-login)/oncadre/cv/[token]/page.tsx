import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { verifyCvToken } from "@/lib/cadreHealth/cvRequest";
import { greetingFor } from "@/lib/cadreSalutation";
import CvUploadForm from "@/components/cadrehealth/CvUploadForm";

export const metadata: Metadata = {
  title: "Upload your CV | CadreHealth",
  robots: { index: false, follow: false },
};

export default async function CvUploadPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const id = verifyCvToken(token);
  const pro = id
    ? await prisma.cadreProfessional.findUnique({
        where: { id },
        select: {
          firstName: true,
          lastName: true,
          cadre: true,
          cvFileUrl: true,
          mandateMatches: {
            where: { source: "APPLIED" },
            select: { mandate: { select: { title: true } } },
          },
        },
      })
    : null;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div
        className="w-full max-w-md rounded-2xl bg-white p-8"
        style={{ border: "1px solid #E8EBF0", boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}
      >
        <p className="text-xl font-bold text-[#0B3C5D]">
          Cadre<span className="text-[#D4AF37]">Health</span>
        </p>

        {!pro ? (
          <>
            <h1 className="mt-6 text-lg font-semibold text-gray-900">This link has expired</h1>
            <p className="mt-2 text-sm text-gray-500">
              Email hello@consultforafrica.com and we will send you a new one.
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-6 text-lg font-semibold text-gray-900">Dear {greetingFor(pro)}</h1>
            <p className="mt-2 text-sm text-gray-500">
              {pro.mandateMatches.length > 0
                ? `Upload your CV for ${pro.mandateMatches.map((m) => m.mandate.title).join(", ")}.`
                : "Upload your CV to complete your CadreHealth application."}
              {pro.cvFileUrl && " We already have a CV for you. Uploading again replaces it."}
            </p>
            <div className="mt-6">
              <CvUploadForm action={`/api/cadre/cv/${token}`} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
