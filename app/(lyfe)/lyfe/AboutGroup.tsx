import { LYFE_ABOUT } from "@/lib/lyfe";

/**
 * The institution behind the surgeon.
 *
 * Placed low on both pages on purpose. It is not what persuades somebody to
 * book, but it is what stops a careful buyer from hesitating at the last step,
 * which is a different job and belongs after the offer rather than in front
 * of it.
 */
export default function AboutGroup({
  tone,
  items = LYFE_ABOUT,
}: {
  tone: "dark" | "light";
  items?: { name: string; role: string; body: string }[];
}) {
  const dark = tone === "dark";
  const ink = dark ? "#FFFFFF" : "#15161A";
  const body = dark ? "#AFC2B4" : "#4A4D56";
  const accent = dark ? "#C4D7A6" : "#A87B4F";
  const line = dark ? "rgba(196,215,166,0.18)" : "#E4DCD0";

  return (
    <section
      className="px-6 py-16 md:px-10 md:py-20"
      style={{ background: dark ? "#15291F" : "#F3EDE4" }}
    >
      <div className="mx-auto w-full max-w-5xl">
        <p
          className="text-[10.5px] font-semibold uppercase"
          style={{ color: accent, letterSpacing: "0.18em" }}
        >
          Who stands behind this
        </p>

        <div className={`mt-9 grid gap-x-10 gap-y-10 ${items.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
          {items.map((a) => (
            <div key={a.name} className="border-t pt-6" style={{ borderColor: line }}>
              <p
                className="text-[10px] font-semibold uppercase"
                style={{ color: accent, letterSpacing: "0.14em" }}
              >
                {a.role}
              </p>
              <h3
                className="mt-2.5 text-[19px] leading-snug"
                style={{
                  fontFamily: "var(--lyfe-display), Georgia, serif",
                  fontWeight: 600,
                  color: ink,
                }}
              >
                {a.name}
              </h3>
              <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: body }}>
                {a.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
