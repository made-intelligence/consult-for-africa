/**
 * The bone motif. An osteon is the structural unit of compact bone: rings of
 * lamellae around a central canal, packed together like the cross-section of
 * a tree. Drawn here as faint line work, never as a picture.
 */

/** A single osteon, used large behind the portrait. */
export function OsteonRings({ className = "", rings = 9 }: { className?: string; rings?: number }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden fill="none">
      {Array.from({ length: rings }, (_, i) => (
        <circle
          key={i}
          cx="200"
          cy="200"
          r={14 + i * 21 + (i % 3) * 2}
          stroke="currentColor"
          strokeWidth={i === 0 ? 1.4 : 1}
        />
      ))}
      <circle cx="200" cy="200" r="5" fill="currentColor" />
    </svg>
  );
}

/**
 * A field of packed osteons as a CSS background. Encoded inline so it costs
 * bytes rather than a request, and drawn at a few per cent opacity.
 */
function field(color: string, opacity: number) {
  const osteon = (x: number, y: number, n: number, r0: number) =>
    Array.from({ length: n }, (_, i) => `<circle cx="${x}" cy="${y}" r="${r0 + i * 7}"/>`).join("") +
    `<circle cx="${x}" cy="${y}" r="1.6" fill="${color}" fill-opacity="${opacity * 1.4}" stroke="none"/>`;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260" viewBox="0 0 260 260">` +
    `<g fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1">` +
    osteon(60, 64, 6, 6) +
    osteon(186, 42, 5, 6) +
    osteon(150, 160, 7, 6) +
    osteon(36, 196, 5, 5) +
    osteon(236, 220, 4, 6) +
    `</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export const OSTEON_FIELD = field("#14233A", 0.07);
export const OSTEON_FIELD_LIGHT = field("#FFFFFF", 0.06);
