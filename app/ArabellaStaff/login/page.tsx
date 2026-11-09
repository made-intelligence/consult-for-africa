import type { Metadata } from "next";
import StaffLogin from "@/components/staff/StaffLogin";
import { brandOf, ARABELLA } from "@/lib/staffSites";

export const metadata: Metadata = {
  title: "Arabella Women's Health: sign in",
  robots: { index: false, follow: false },
};

export default function ArabellaStaffLogin() {
  return <StaffLogin brand={brandOf(ARABELLA)} />;
}
