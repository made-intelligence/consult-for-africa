"use client";

import { useEffect, useState } from "react";
import { LYFE_EVENT, MEDLYFE_BRAND as MB } from "@/lib/lyfe";

/**
 * A single persistent call to action, appearing once the hero has gone.
 *
 * The page has one job for the next ten days, which is to fill a room on the
 * fifteenth. On a phone the RSVP button is off screen for most of the scroll,
 * and an invitation nobody can accept without scrolling back is a worse
 * invitation. It hides again at the form so it is not competing with itself.
 */
export default function StickyRsvp() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const form = document.getElementById("enquire");
      const pastHero = window.scrollY > window.innerHeight * 0.85;
      const atForm = form ? form.getBoundingClientRect().top < window.innerHeight * 0.9 : false;
      setShow(pastHero && !atForm);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden={!show}
      className="fixed inset-x-0 bottom-0 z-50 transition-transform duration-300"
      style={{
        transform: show ? "translateY(0)" : "translateY(110%)",
        background: MB.greenDeep,
        borderTop: `1px solid ${MB.lime}55`,
      }}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-3.5 md:px-8">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold" style={{ color: MB.white }}>
            {LYFE_EVENT.date}
          </p>
          <p className="truncate text-[12px]" style={{ color: MB.greenSoft }}>
            Arrival {LYFE_EVENT.arrival} &middot; {LYFE_EVENT.venueName}
          </p>
        </div>
        <a
          href="?go=rsvp#enquire"
          tabIndex={show ? 0 : -1}
          className="shrink-0 rounded-lg px-5 py-3 text-[13px] font-semibold transition hover:opacity-90"
          style={{ background: MB.lime, color: MB.greenDeep }}
        >
          RSVP
        </a>
      </div>
    </div>
  );
}
