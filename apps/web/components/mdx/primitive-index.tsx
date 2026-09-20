import "server-only";

import Link from "next/link";
import { getDocIndex } from "../../lib/docs";

// The same prefix `lib/docs/nav.ts` groups the sidebar by, re-declared here
// rather than imported: that module's copy is module-private on purpose (it is
// the one constant construction and lookup share there), and exporting it to
// reach it from a second file would widen its surface for one string. Both
// copies derive the same set from the same `route` field, and
// `assertNavCoversIndex` fails the build if they ever disagree about which
// pages belong under the group.
const PRIMITIVES_PREFIX = "/docs/components/";

/**
 * The card grid on `/docs/components` (§11.3, Task 3.3 §G). One card per
 * primitive, ALPHABETICAL by slug — the same sort key and therefore the same
 * order as the sidebar (`buildNavTree` sorts on `route` for the reasons its
 * own comment gives: filename order is not slug order, and title order is
 * prose). Grouping by wave was rejected: it would duplicate `/docs`'s
 * hand-maintained Coverage section with a second list free to drift from it.
 *
 * Labels and descriptions come from each primitive page's own frontmatter, so
 * this list cannot drift from the pages it indexes and a new primitive appears
 * here the moment its `.mdx` file exists — the same property
 * `buildNavTree` gives the sidebar.
 *
 * The card is `/components`'s gallery card verbatim (measured from the shipped
 * HTML, `legacy-pages/components/index.astro:55-64`), with the `<p>` carrying
 * the primitive's description instead of an example count. The GRID drops two
 * things from that page's own wrapper, which are named in prose rather than
 * quoted because Tailwind's `@source` scan is a plain text scan that lifts
 * class candidates straight out of COMMENTS — verified on the first build of
 * this file, where all three of the dropped utilities below shipped live rules
 * into `.next/static/chunks/*.css` despite never being rendered. Dropped: the
 * gallery page's horizontal and vertical page padding (including its large-
 * breakpoint override), which is full-width page chrome and wrong inside a
 * 42rem article; and its extra-large-breakpoint three-column override, which
 * at 42rem would give ~13rem columns. What is left is the two-column grid
 * below.
 *
 * These `<h2>`s are NOT MDX headings: they are emitted by this component, so
 * they never pass through `mdx-components.tsx`'s `h2` override, never get a
 * `rehype-slug` id, and never reach the TOC — the content index's heading scan
 * reads the page's raw MDX text (`lib/docs/headings.ts`), where the only thing
 * written is this component's tag. That is intended: 65 card titles in the
 * "On this page" list would be a second copy of the grid.
 */
export async function PrimitiveIndex() {
  const primitives = (await getDocIndex())
    .filter((page) => page.route.startsWith(PRIMITIVES_PREFIX))
    .sort((a, b) => (a.route < b.route ? -1 : a.route > b.route ? 1 : 0));

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {primitives.map((page) => (
        <Link
          className="rounded-xl border border-border p-5 transition-colors hover:bg-muted/50"
          href={page.route}
          key={page.route}
        >
          <h2 className="font-medium text-sm">{page.title}</h2>
          <p className="mt-1 text-muted-foreground text-sm">{page.description}</p>
        </Link>
      ))}
    </div>
  );
}
