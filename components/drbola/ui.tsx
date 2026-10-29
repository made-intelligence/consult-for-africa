import Link from "next/link";
import { DRBOLA_LIVE, href } from "@/lib/drbola";

/** Display serif, used for every headline. */
export const serif = { fontFamily: "var(--db-display), Georgia, serif" } as const;

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-(--db-gold-deep)">{children}</div>
  );
}

export function H2({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 style={serif} className={`text-3xl font-medium leading-tight tracking-tight text-(--db-ink) sm:text-4xl ${className}`}>
      {children}
    </h2>
  );
}

export function Button({
  to,
  children,
  variant = "primary",
  external,
}: {
  to: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  external?: boolean;
}) {
  const cls =
    variant === "primary"
      ? "bg-(--db-ink) text-white hover:bg-(--db-ink-soft)"
      : "border border-(--db-ink)/20 text-(--db-ink) hover:border-(--db-ink)/50";
  const c = `inline-flex items-center justify-center rounded-full px-6 py-3 text-[15px] font-medium transition ${cls}`;
  if (external)
    return (
      <a href={to} className={c} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  return (
    <Link href={to.startsWith("/") && !to.startsWith("/drbola") ? href(to) : to} className={c}>
      {children}
    </Link>
  );
}

/**
 * Wraps anything Dr Bola still has to confirm. In preview it is marked so he
 * can see exactly what needs his word; once live it is plain text.
 */
export function Confirm({ children, note }: { children: React.ReactNode; note: string }) {
  if (DRBOLA_LIVE) return <>{children}</>;
  return (
    <span className="group relative cursor-help underline decoration-amber-500 decoration-dotted decoration-2 underline-offset-4">
      {children}
      <span className="pointer-events-none absolute bottom-full left-0 z-30 mb-2 hidden w-64 rounded-lg bg-amber-50 p-2.5 text-left text-xs font-normal normal-case leading-snug tracking-normal text-amber-900 shadow-lg ring-1 ring-amber-200 group-hover:block">
        To confirm: {note}
      </span>
    </span>
  );
}
