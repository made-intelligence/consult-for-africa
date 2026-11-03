import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readNoteToken } from "@/lib/havenNoteLink";
import { mondayNote, fridayNote } from "@/lib/havenFounderNote";
import CopyNote from "@/components/haven/CopyNote";

// The founders' note, ready to forward. Reached only from the signed link in
// the WhatsApp alert; the page holds the text because a WhatsApp template
// cannot carry line breaks.

export const metadata: Metadata = { title: "Haven founders' note", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NotePage({ params }: { params: Promise<{ token: string }> }) {
  const t = readNoteToken((await params).token);
  if (!t) notFound();
  // 07:00 Lagos on the note's day, so the week it describes does not drift.
  const at = new Date(`${t.date}T06:00:00Z`);
  const text = t.kind === "monday" ? await mondayNote(at) : await fridayNote(at);
  return (
    <main style={{ background: "#F8FAFC", minHeight: "100vh", fontFamily: "system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif", padding: "28px 16px 60px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ color: "#D4AF37", fontWeight: 700, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase" }}>
          Haven founders&apos; group
        </div>
        <h1 style={{ color: "#0B3C5D", fontSize: 24, margin: "8px 0 18px" }}>
          {t.kind === "monday" ? "Monday: the plan for the week" : "Friday: what got done"}
        </h1>
        <CopyNote text={text} />
      </div>
    </main>
  );
}
