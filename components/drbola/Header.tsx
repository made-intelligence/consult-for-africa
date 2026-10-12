import Image from "next/image";
import Link from "next/link";
import { DRBOLA, NAV, href } from "@/lib/drbola";
import { Container, serif } from "./ui";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-(--db-line) bg-(--db-ground)/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href={href()} className="flex items-center gap-2.5">
          <Image src="/drbola/monogram.webp" alt="" width={34} height={34} priority />
          <span className="leading-tight">
            <span style={serif} className="block text-[17px] font-medium text-(--db-ink)">
              {DRBOLA.short}
            </span>
            <span className="block text-[10.5px] uppercase tracking-[0.14em] text-(--db-muted)">
              Orthopaedic surgeon
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV.map((n) => (
            <Link key={n.path} href={href(n.path)} className="text-[14px] text-(--db-ink-soft) hover:text-(--db-ink)">
              {n.label}
            </Link>
          ))}
          <Link
            href={href("/second-opinion")}
            className="rounded-full bg-(--db-ink) px-4 py-2 text-[14px] font-medium text-white hover:bg-(--db-ink-soft)"
          >
            Free second opinion
          </Link>
        </nav>

        <details className="group relative lg:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-(--db-line) px-3.5 py-1.5 text-sm text-(--db-ink) [&::-webkit-details-marker]:hidden">
            Menu
          </summary>
          <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-(--db-line) bg-white p-2 shadow-xl">
            {NAV.map((n) => (
              <Link key={n.path} href={href(n.path)} className="block rounded-lg px-3 py-2.5 text-[15px] text-(--db-ink) hover:bg-(--db-bone)">
                {n.label}
              </Link>
            ))}
            <Link href={href("/book")} className="block rounded-lg px-3 py-2.5 text-[15px] text-(--db-ink) hover:bg-(--db-bone)">
              Book a consultation
            </Link>
            <Link
              href={href("/second-opinion")}
              className="mt-1 block rounded-lg bg-(--db-ink) px-3 py-2.5 text-center text-[15px] font-medium text-white"
            >
              Free second opinion
            </Link>
          </div>
        </details>
      </Container>
    </header>
  );
}
