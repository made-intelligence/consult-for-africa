import { Suspense } from "react";
import Navbar from "@/components/cfa/Navbar";
import Footer from "@/components/cfa/Footer";
import NuruChat from "@/components/cfa/NuruChat";
import CadreHealthAnalytics from "@/components/cadrehealth/Analytics";
import PortalNav from "@/app/(oncadre-portal)/PortalNav";
import { getCadreSession } from "@/lib/cadreAuth";
import { prisma } from "@/lib/prisma";
import { showsDocuments } from "@/lib/cadreHealth/portalNav";

export { metadata } from "@/app/(marketing)/oncadre/metadata";

/**
 * Jobs and mentorship are public pages that members also use daily. Under the
 * marketing layout a signed-in member lost the portal nav and, on a phone, the
 * bottom tab bar, with no way back but the browser. Logged-out visitors get
 * exactly the marketing chrome they had; members get the portal shell.
 */
export default async function OncadreShellLayout({ children }: { children: React.ReactNode }) {
  const session = await getCadreSession();

  if (!session) {
    return (
      <>
        <Navbar />
        {children}
        <Footer />
        <NuruChat />
        <Suspense fallback={null}>
          <CadreHealthAnalytics />
        </Suspense>
      </>
    );
  }

  const professional = await prisma.cadreProfessional.findUnique({
    where: { id: session.sub },
    select: { firstName: true, lastName: true, accountStatus: true, recruitmentStage: true },
  });

  return (
    <div className="min-h-screen" style={{ background: "#F8F9FB" }}>
      <PortalNav
        firstName={professional?.firstName ?? session.firstName}
        lastName={professional?.lastName ?? session.lastName}
        accountStatus={professional?.accountStatus ?? session.accountStatus}
        showDocuments={showsDocuments(professional?.recruitmentStage)}
      />
      {/* Room for the mobile bottom tab bar */}
      <div className="pb-24 md:pb-0">{children}</div>
      <Suspense fallback={null}>
        <CadreHealthAnalytics />
      </Suspense>
    </div>
  );
}
