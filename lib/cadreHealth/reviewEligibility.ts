import { prisma } from "@/lib/prisma";

/**
 * Who may write a facility review. Verified accounts, or anyone who has given
 * us a licence number to check. Gating on verification alone blocked everyone,
 * because the verification queue had not been worked.
 */
export async function canReview(professionalId: string): Promise<boolean> {
  const prof = await prisma.cadreProfessional.findUnique({
    where: { id: professionalId },
    select: {
      accountStatus: true,
      _count: {
        select: {
          credentials: {
            where: { licenseNumber: { not: null }, verificationStatus: { in: ["PENDING", "VERIFIED"] } },
          },
        },
      },
    },
  });
  if (!prof) return false;
  return prof.accountStatus === "VERIFIED" || prof._count.credentials > 0;
}

export const REVIEW_BLOCKED_MESSAGE =
  "Add your practising licence number on your profile to write reviews. It keeps reviews to real professionals.";
