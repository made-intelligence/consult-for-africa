/**
 * A module's text: plain lines, short headings on their own line, numbered
 * steps. The same reading as Haven's module page, in the site's own colours.
 */
export default function ModuleBody({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        const first = lines[0];
        const isHeading = first.length < 70 && !/[.:;?"]$/.test(first) && !/^\d+[.)]/.test(first) && first === first.toUpperCase();
        const head = isHeading ? <h3 style={{ color: "var(--staff-ink, #0B3C5D)", fontSize: 15, letterSpacing: ".04em", margin: "10px 0 0" }}>{first.replace(/^#+\s*/, "")}</h3> : null;
        const rest = isHeading ? lines.slice(1) : lines;
        return (
          <div key={i}>
            {head}
            {rest.length > 0 && (
              <div style={{ fontSize: 15.5, lineHeight: 1.7, color: "#1F2937", marginTop: head ? 4 : 0 }}>
                {rest.map((l, j) => <div key={j} style={{ paddingLeft: /^(\d+[.)]|[-•])\s/.test(l) ? 4 : 0, marginTop: j ? 4 : 0 }}>{l}</div>)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
