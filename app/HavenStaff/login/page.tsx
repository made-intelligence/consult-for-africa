import StaffLogin from "@/components/staff/StaffLogin";
import { brandOf, HAVEN } from "@/lib/staffSites";

export default function HavenStaffLogin() {
  return <StaffLogin brand={brandOf(HAVEN)} />;
}
