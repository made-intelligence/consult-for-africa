"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * One definition of the four sections, rendered as a top bar on desktop and a
 * tab bar on phones. The nav previously had no active state at all, so a
 * hospital could not tell where it was.
 */

const NAV = [
  { href: "/oncadre/employer/dashboard", label: "Dashboard", icon: "home" },
  { href: "/oncadre/employer/roles", label: "Roles", icon: "roles" },
  { href: "/oncadre/employer/candidates", label: "Candidates", icon: "search" },
  { href: "/oncadre/employer/pipeline", label: "Pipeline", icon: "pipeline" },
  { href: "/oncadre/employer/account", label: "Account", icon: "account" },
] as const;

export default function EmployerNav({
  variant,
  newApplicants,
  answeredApproaches,
}: {
  variant: "top" | "bottom";
  newApplicants: number;
  answeredApproaches: number;
}) {
  const pathname = usePathname();

  const badgeFor = (href: string) => {
    if (href.endsWith("/pipeline")) return newApplicants;
    if (href.endsWith("/candidates")) return answeredApproaches;
    return 0;
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  if (variant === "top") {
    return (
      <div className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 sm:flex">
        {NAV.map((item) => {
          const active = isActive(item.href);
          const badge = badgeFor(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="relative rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200"
              style={{
                color: active ? "#0B3C5D" : "#6B7280",
                background: active ? "rgba(11,60,93,0.06)" : "transparent",
              }}
            >
              {item.label}
              {badge > 0 && (
                <span
                  className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                  style={{ background: "#D4AF37" }}
                >
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 bg-white sm:hidden"
      style={{
        borderTop: "1px solid #E8EBF0",
        boxShadow: "0 -1px 3px rgba(0,0,0,0.04), 0 -4px 12px rgba(0,0,0,0.03)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex" style={{ minHeight: "56px" }}>
        {NAV.map((item) => {
          const active = isActive(item.href);
          const badge = badgeFor(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors duration-200"
              style={{ minHeight: "44px", color: active ? "#0B3C5D" : "#9CA3AF" }}
            >
              <span className="relative">
                <NavIcon icon={item.icon} />
                {badge > 0 && (
                  <span
                    className="absolute -right-1.5 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-0.5 text-[9px] font-bold text-white"
                    style={{ background: "#D4AF37" }}
                  >
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function NavIcon({ icon }: { icon: string }) {
  const cls = "h-5 w-5";
  const common = {
    className: cls,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24",
  } as const;
  switch (icon) {
    case "home":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
        </svg>
      );
    case "roles":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      );
    case "pipeline":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h10M4 18h6" />
        </svg>
      );
    case "account":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    default:
      return null;
  }
}
