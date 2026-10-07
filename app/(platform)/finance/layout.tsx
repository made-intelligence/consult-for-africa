"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { FileText, BarChart3, Tag } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { inRoles, RATE_CARD_ROLES } from "@/lib/constants";

interface Tab {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: readonly string[];
}

const TABS: Tab[] = [
  { label: "Invoices", href: "/finance/invoices", icon: FileText },
  { label: "Reports", href: "/finance/reports", icon: BarChart3 },
  // Tighter than the rest of Finance, because the office reads invoice status
  // to chase and sees no rates. The page itself re-checks; this is cosmetic.
  { label: "Rate card", href: "/finance/rate-card", icon: Tag, roles: RATE_CARD_ROLES },
];

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const tabs = TABS.filter((t) => !t.roles || inRoles(role, t.roles));

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Sub-navigation */}
      <div
        className="flex items-center gap-1 px-6 pt-4 pb-0 shrink-0"
        style={{ background: "#ffffff" }}
      >
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors"
              style={{
                color: active ? "#0F2744" : "#64748B",
                borderBottom: active ? "2px solid #D4AF37" : "2px solid transparent",
              }}
            >
              <tab.icon size={15} />
              {tab.label}
            </Link>
          );
        })}
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
