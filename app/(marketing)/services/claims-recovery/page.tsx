import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PartnerCTA from "@/components/cfa/PartnerCTA";
import ReceivablesCheck from "@/components/cfa/claims/ReceivablesCheck";
import { ADVANCE_HOURS, ADVANCE_LIVE, ADVANCE_RATE, SAMPLE_SIZE } from "@/lib/claims-recovery";

// Copy is deliberately short: proof and the calculator do the selling, and the
// FAQ carries the depth. The early payment line only promises once a funding
// partner has signed (ADVANCE_LIVE in lib/claims-recovery.ts).

export const metadata: Metadata = {
  title: "Claims Recovery for Hospitals | Consult For Africa",
  description: "We recover unpaid HMO and corporate claims for private hospitals in Nigeria, by settling disputes with the payors claim by claim.",
  keywords: ["HMO claims recovery Nigeria", "hospital receivables Nigeria", "unpaid HMO claims", "hospital debt recovery Lagos", "claims reconciliation Nigeria", "invoice discounting hospitals Nigeria"],
  openGraph: {
    title: "Claims Recovery for Hospitals | Consult For Africa",
    description: "Your hospital has already done the work. We get the payors to pay for it.",
    type: "website",
    images: ["/og-image.jpg"],
  },
};

const stuck = [
  { why: "No authorisation code, or one that does not match what was billed", fix: "Retrospective authorisation, agreed with the payor's medical team" },
  { why: "Billed on the wrong or an old tariff", fix: "Rebilled at the agreed rate, so the claim is paid rather than written off" },
  { why: "Notes, results or a discharge summary missing", fix: "Records pulled and the claim resubmitted inside the payor's window" },
  { why: "Submitted late, or never submitted", fix: "Negotiated case by case, with the payor's claims lead" },
];

const steps = [
  { n: "01", t: "Vet", d: "Every claim is checked against the payor's tariff, the authorisation record and the paperwork before anyone chases it. Claims that will not pay as they stand are repaired first." },
  { n: "02", t: "Reconcile", d: "We match what you billed against what each payor says it owes and clear the difference claim by claim, with the people at the payor who decide." },
  { n: "03", t: "Recover", d: "We follow up, escalate and settle. You see every claim's status from submission to cash, the same view we work from." },
];

const faqs = [
  { q: "Will this damage our relationship with the HMOs?", a: "It should improve it. Most unpaid claims are disputes nobody has had time to settle. We settle them at claims level, with documents, and nobody is threatened." },
  { q: "Do you need our patients' records?", a: `No. To start we need a list of ${SAMPLE_SIZE} unpaid claims by claim reference, payor, date and amount. Records stay in your system, and when a claim needs a document we ask for that document only.` },
  { q: "What does it cost?", a: "The first review is free. After that we are paid from what we recover, so there is no fee on money we do not bring in. We agree the terms in writing before we start." },
  { q: "Which hospitals is this for?", a: "Private hospitals, clinics, diagnostic centres and specialist practices that bill payors, corporate accounts or a state scheme, in Lagos, Abuja and beyond." },
  {
    q: "Can we be paid before the HMO pays?",
    a: ADVANCE_LIVE
      ? `Yes. Once a claim has passed vetting, our funding partner disburses ${Math.round(ADVANCE_RATE * 100)}% of its value to you within ${ADVANCE_HOURS} hours, less a one time discount taken at disbursement. You know the number before you accept, you pay it once, and you owe nothing further however long the payor then takes. The remaining balance reaches you when the payor settles.`
      : "We are setting up early payment against vetted claims for a first group of hospitals. If that interests you, say so in the form and we will tell you when it opens.",
  },
];

export default async function ClaimsRecoveryPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  const refToken = ref && /^[A-Za-z0-9_-]{16,40}$/.test(ref) ? ref : null;

  return (
    <main>
      <section className="relative overflow-hidden text-white" style={{ paddingTop: "5rem", minHeight: "56svh" }}>
        <div className="absolute inset-0" style={{ background: "#06090f" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 80% at 80% 40%, rgba(20,130,200,0.15) 0%, rgba(12,70,130,0.06) 55%, transparent 70%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 40% 50% at 20% 10%, rgba(201,168,76,0.1) 0%, transparent 60%)" }} />
        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">
          <p className="mb-6 text-xs font-medium uppercase tracking-[0.22em]" style={{ color: "#D4AF37" }}>C4A Service</p>
          <h1 className="font-semibold leading-[1.1] tracking-tight text-white max-w-3xl" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            Claims Recovery
          </h1>
          <div className="mt-6 w-12 h-[2px]" style={{ background: "#D4AF37" }} />
          <p className="mt-6 max-w-2xl leading-relaxed" style={{ fontSize: "clamp(1rem,1.5vw,1.15rem)", color: "rgba(255,255,255,0.7)" }}>
            Your hospital has already done the work. We get the payors to pay for it.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href="#check" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm" style={{ background: "#D4AF37", color: "#0F2744" }}>
              Check your receivables <ArrowRight size={15} />
            </a>
            <Link href="/services" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm" style={{ border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.8)" }}>
              All Services
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-6" style={{ background: "#F8FAFC" }}>
        <div className="max-w-5xl mx-auto">
          <p className="uppercase tracking-[0.2em] text-xs text-[#0B3C5D]/50 mb-3">Why the money is stuck</p>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">Most of it is disputed, not refused.</h2>
          <p className="text-gray-500 text-sm max-w-xl mb-10">Settle the dispute and the claim gets paid.</p>
          <div className="space-y-3">
            {stuck.map((s) => (
              <div key={s.why} className="grid gap-2 rounded-xl bg-white p-5 md:grid-cols-2 md:gap-8" style={{ border: "1px solid #e5eaf0" }}>
                <p className="text-sm font-medium text-gray-900">{s.why}</p>
                <p className="text-sm text-gray-600">{s.fix}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6" style={{ background: "linear-gradient(145deg, #0a1e32 0%, #112e4a 100%)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="uppercase tracking-[0.2em] text-xs text-white/50 mb-3">How it works</p>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-12">Vet, reconcile, recover</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="glass-card p-7">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold mb-4" style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.35)", color: "#D4AF37" }}>{s.n}</div>
                <p className="font-semibold text-white text-lg mb-2">{s.t}</p>
                <p className="text-white/70 text-sm leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="check" className="py-20 px-6 scroll-mt-20" style={{ background: "#ffffff" }}>
        <div className="max-w-6xl mx-auto">
          <p className="uppercase tracking-[0.2em] text-xs text-[#0B3C5D]/50 mb-3">Check your receivables</p>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-10">What is sitting outside your hospital?</h2>
          <ReceivablesCheck refToken={refToken} />
        </div>
      </section>

      <section className="py-20 px-6" style={{ background: "#F8FAFC" }}>
        <div className="max-w-3xl mx-auto">
          <p className="uppercase tracking-[0.2em] text-xs text-[#0B3C5D]/50 mb-3">Questions</p>
          <div className="mt-6 space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-xl bg-white p-5" style={{ border: "1px solid #e5eaf0" }}>
                <summary className="cursor-pointer list-none text-sm font-semibold text-gray-900">{f.q}</summary>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <PartnerCTA />
    </main>
  );
}
