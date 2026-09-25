import { ArrowRight } from "lucide-react";
import Link from "next/link";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background";

const TIERS = [
  { id: "starter", featured: false },
  { id: "pro", featured: true },
  { id: "team", featured: false },
];

/** A bar of placeholder "text" inside the wireframe. */
function Bar({ className }: { className: string }) {
  return <span className={`block h-2 rounded-full bg-background/15 ${className}`} />;
}

/** A page composed from blocks, drawn in the inverted palette and cropped by the band's bottom edge. */
function ComposedPage() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-full max-w-lg rounded-t-xl border border-b-0 border-background/15 bg-background/[0.04] shadow-[0_-24px_60px_-20px_rgb(0_0_0/0.35)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover/cta:-translate-y-2"
    >
      <div className="flex items-center gap-1.5 border-b border-background/10 px-4 py-3">
        <span className="size-2 rounded-full bg-background/20" />
        <span className="size-2 rounded-full bg-background/20" />
        <span className="size-2 rounded-full bg-background/20" />
        <span className="ms-3 h-4 flex-1 rounded-md bg-background/[0.07]" />
      </div>

      <div className="flex items-center justify-between px-6 pt-5">
        <span className="size-4 rounded-md bg-background/30" />
        <span className="flex gap-3">
          <Bar className="w-8" />
          <Bar className="w-8" />
          <Bar className="w-8" />
        </span>
        <span className="h-5 w-14 rounded-md bg-background/80" />
      </div>

      <div className="flex flex-col items-center px-6 pt-10 pb-8">
        <span className="block h-3.5 w-3/4 rounded-full bg-background/60" />
        <span className="mt-2 block h-3.5 w-1/2 rounded-full bg-background/60" />
        <Bar className="mt-4 w-2/3" />
        <Bar className="mt-1.5 w-1/2" />
        <span className="mt-5 flex gap-2">
          <span className="h-6 w-20 rounded-md bg-background/80" />
          <span className="h-6 w-20 rounded-md border border-background/20" />
        </span>
      </div>

      {/* The pricing section is "selected", the way an installable block is picked out of a page. */}
      <div className="relative grid grid-cols-3 gap-3 border-t border-background/10 px-6 pt-6 pb-10">
        <span className="pointer-events-none absolute inset-x-2 top-2 bottom-4 rounded-lg outline-1 outline-dashed outline-background/35" />
        <span className="absolute -top-2.5 right-4 rounded-md bg-background px-1.5 py-0.5 font-mono text-[10px] leading-none text-foreground">
          pricing-01
        </span>
        {TIERS.map(({ id, featured }) => (
          <div
            className={`flex flex-col gap-2 rounded-lg border p-3 ${
              featured ? "border-background/40 bg-background/10" : "border-background/10"
            }`}
            key={id}
          >
            <Bar className="w-1/2" />
            <span className={`block h-4 w-2/3 rounded-md ${featured ? "bg-background/70" : "bg-background/30"}`} />
            <Bar className="mt-2 w-full" />
            <Bar className="w-5/6" />
            <Bar className="w-4/6" />
            <span
              className={`mt-2 block h-5 rounded-md ${featured ? "bg-background/80" : "border border-background/20"}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Closes the free gallery with the step up: whole sections and pages, from the Pro blocks. */
export function BlocksCta() {
  return (
    <section
      aria-labelledby="blocks-cta-heading"
      className="group/cta overflow-hidden bg-foreground text-background selection:bg-background selection:text-foreground"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-6 pt-16 lg:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-16 lg:pt-24">
        <div className="max-w-xl lg:pb-24">
          <h2
            className="font-display text-4xl leading-[1.05] font-medium tracking-tighter text-balance sm:text-5xl lg:text-6xl"
            id="blocks-cta-heading"
          >
            Components are the parts. Blocks are the page.
          </h2>
          <p className="mt-5 text-pretty text-lg text-background/70">
            Pro blocks are whole sections and pages — heroes, pricing, dashboards, auth — composed from the same
            primitives and themed by the same tokens you already use. Install one and it is yours.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              className={`inline-flex h-11 items-center gap-2 rounded-lg bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-background/90 ${FOCUS} [&_svg]:size-4`}
              href="/blocks"
            >
              Browse blocks
              <ArrowRight aria-hidden="true" className="transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
            </Link>
            <Link
              className={`inline-flex h-11 items-center rounded-lg border border-background/20 px-5 text-sm font-medium transition-colors hover:border-background/40 hover:bg-background/5 ${FOCUS}`}
              href="/pro"
            >
              Get Pro — $99
            </Link>
          </div>
          <p className="mt-4 text-sm text-background/60">
            One purchase, yours forever. $99 at launch instead of $249.
          </p>
        </div>
        <ComposedPage />
      </div>
    </section>
  );
}
