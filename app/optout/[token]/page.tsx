import type { Metadata } from "next";
import OptOutButton from "./OptOutButton";

export const metadata: Metadata = { title: "Stop these emails | Consult for Africa", robots: { index: false, follow: false } };

// A button rather than an unsubscribe-on-load, because mail scanners open
// every link in a message and would otherwise opt people out on delivery.

export default async function OptOutPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4" style={{ background: "#F8FAFC" }}>
      <div className="w-full max-w-md rounded-2xl bg-white p-8" style={{ border: "1px solid #e5eaf0" }}>
        <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "#D4AF37" }}>Consult for Africa</p>
        <h1 className="mt-2 text-xl font-semibold" style={{ color: "#0B3C5D" }}>Stop these emails</h1>
        <p className="mt-3 text-sm text-gray-600">We will not email this address about our hospital services again.</p>
        <OptOutButton token={token} />
      </div>
    </main>
  );
}
