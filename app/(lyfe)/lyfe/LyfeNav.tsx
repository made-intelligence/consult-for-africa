import Link from "next/link";
import { LYFE_EVENT_THEME, LYFE_NAME, MEDLYFE_BRAND as MB } from "@/lib/lyfe";

/**
 * The only navigation either landing gets.
 *
 * Both pages are still single purpose, so this is not a menu. It is the one
 * door between them: a guest who cannot make the evening can reach the diary,
 * and somebody weighing a consultation can see there is an evening. Two items,
 * no dropdowns, nothing else competing with the page's own call to action.
 */
export default function LyfeNav({ on }: { on: "event" | "consult" | "visit" }) {
  const event = on === "event";
  return (
    <nav
      className="sticky top-0 z-40 w-full backdrop-blur"
      style={{
        background: event ? "rgba(21,41,31,0.82)" : "rgba(250,247,242,0.88)",
        borderBottom: `1px solid ${event ? "rgba(196,215,166,0.16)" : "#E4DCD0"}`,
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3.5 md:px-10">
        <Link
          href={event ? "/lyfe" : "/lyfe/consult"}
          className="text-[12px] font-semibold uppercase"
          style={{ color: event ? MB.lime : "#A87B4F", letterSpacing: "0.16em" }}
        >
          {event ? LYFE_EVENT_THEME : LYFE_NAME}
        </Link>

        <div className="flex items-center gap-5">
          <Link
            href={event ? "/lyfe/consult" : "/lyfe"}
            className="hidden text-[13.5px] sm:inline"
            style={{ color: event ? MB.mist : "#4A4D56" }}
          >
            {event ? "Consultations" : "The evening"}
          </Link>
          <Link
            href={event ? "/lyfe/consult" : "#book"}
            className="px-5 py-2.5 text-[13.5px] font-semibold"
            style={
              event
                ? { background: MB.lime, color: MB.greenDeep }
                : { background: "#15161A", color: "#FAF7F2" }
            }
          >
            Book a consultation
          </Link>
        </div>
      </div>
    </nav>
  );
}
