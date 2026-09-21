// Every registry:ui item as a grid cell linking to its docs page. The list
// comes from registry.json at build time, so the wall grows with the
// registry. 65 items + the trailing docs cell = 66, which divides evenly
// into the 2 / 3 / 6 column counts — every breakpoint ends on a full row.
//
// Cell borders: each cell draws its end + bottom edge; the inner grid is
// pulled 1px past the clipping wrapper so the outermost borders vanish
// instead of doubling up against the section rails.
//
// Ported class-for-class from `legacy-components/component-wall.astro`. Two
// differences, both forced:
//   - `@lucide/astro`'s `ArrowRight` becomes `lucide-react`'s
//     `ArrowRightIcon` — the same glyph from the same icon set, in the
//     package every other ported component in this app already imports from.
//   - every cell is a `next/link`, not a bare `<a>`: App Router owns soft
//     navigation now that Astro's `<ClientRouter>` is gone (§11.1), and the
//     rest of this port's internal links (header, drawer, footer, sidebar,
//     pagination, breadcrumb, the primitive index) already made that move.
//     The rendered `href` is unchanged, which is what §17.2's link gate
//     compares.
//   - `SPECIAL_NAMES` loses its `"form-rhf": "Form (RHF)"` entry (§14.6).
//     `form-rhf` was deleted from registry.json when Field was rewritten on
//     Base UI, so the mapping has had no item to name for some time; the
//     `input-otp` entry stays, because that item is still in the registry and
//     the generic title-case would render it "Input Otp".
//
// The trailing cell's target comes in as `primitivesHref`, resolved once by
// `app/page.tsx` from `resolvePrimitivesHref(await getNavTree())` — the same
// value `app/layout.tsx` hands the header, drawer and footer. The source
// hard-codes `/docs/components/accordion` here, and so did `SiteFooter`'s
// "All primitives" link until Task 4.1; resolving only one of the two would
// have left the page naming one semantic target two different ways, 60 lines
// apart. Nothing about the rendered `href` changes — the resolver returns
// exactly that route today, which is asserted against the built HTML — what
// changes is that the wall can no longer drift from the nav it points into.
// This component stays presentational: `lib/docs` is `server-only`, so the
// lookup belongs to the route, not to the wall.
//
// A server component: `registry.json` is read at build time and the wall is
// 66 prerendered anchors, none of which needs to reach the client bundle.
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import registry from "../../../packages/registry/registry.json";

const SPECIAL_NAMES: Record<string, string> = {
  "input-otp": "Input OTP",
};

const displayName = (name: string) =>
  SPECIAL_NAMES[name] ??
  name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const components = registry.items.filter((item) => item.type === "registry:ui").map((item) => item.name);

export function ComponentWall({ primitivesHref }: { primitivesHref: string }) {
  return (
    <div className="overflow-hidden">
      <nav aria-label="All primitives" className="-me-px -mb-px grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {components.map((name, i) => (
          <Link
            className="group flex items-baseline justify-between gap-2 border-e border-b border-border px-4 py-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            href={`/docs/components/${name}`}
            key={name}
          >
            <span className="truncate">{displayName(name)}</span>
            <span className="font-mono text-[10px] text-muted-foreground/50 tabular-nums transition-colors group-hover:text-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </span>
          </Link>
        ))}
        <Link
          className="group flex items-center justify-between gap-2 border-e border-b border-border bg-muted/40 px-4 py-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
          href={primitivesHref}
        >
          <span className="truncate">Browse all primitives</span>
          <ArrowRightIcon aria-hidden="true" className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </nav>
    </div>
  );
}
