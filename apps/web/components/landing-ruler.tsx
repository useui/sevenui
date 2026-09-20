// Decorative vertical ruler drawn outside the left grid rail, numbering the
// page in 100px increments like a design-canvas measure. Purely visual:
// hidden from assistive tech and from any viewport too narrow to fit it
// beside the 72rem canvas (hence the xl-only display).
//
// Ported class-for-class from `legacy-components/landing-ruler.astro`
// (`class` -> `className`, `style` string -> React style object). It sits at
// the top of `components/` rather than under a landing-only folder because
// `legacy-components/legal-page.astro` imports the same ruler, so Task 4.3's
// `/terms` and `/privacy` are its second consumer — the same reason the
// `.l-row` / `.l-marks` canvas rules live in `app/globals.css`.
//
// No interactivity and no hooks, so it stays a server component: the 90
// tick labels are static markup and never need to reach the client bundle.
const marks = Array.from({ length: 90 }, (_, i) => i * 100);

export function LandingRuler() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-0 right-[calc(50%+36rem)] hidden overflow-hidden select-none xl:block"
    >
      <div
        className="absolute inset-y-0 right-0 w-2"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, var(--border) 0 1px, transparent 1px 25px)",
        }}
      />
      <div className="absolute inset-y-0 right-3.5 flex flex-col">
        {marks.map((m) => (
          <span className="flex h-[100px] shrink-0 items-start justify-end pt-0.5" key={m}>
            <span className="font-mono text-[10px] leading-none text-muted-foreground/60 [writing-mode:vertical-rl]">
              {m}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
