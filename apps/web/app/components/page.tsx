import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "../../components/json-ld";
import { galleryComponents } from "../../lib/gallery";
import { requirePageMeta } from "../../lib/page-meta";
import { pageTitle } from "../../lib/site";

// Ported from `legacy-pages/components/index.astro`. Everything that page
// took from Blume's `PageLayout` — header, theme, drawer, footer, skip
// link, fonts, analytics — comes from `app/layout.tsx` now, and the
// two-column shell comes from `app/components/layout.tsx`, so this file is
// the index's own content and nothing else.

const ROUTE = "/components";

// `/components` has been in `lib/page-meta.ts` since Task 1.7, with its
// description probed from the live site — this page does not add or rewrite
// it, it reads it. `pageTitle` applies the em-dash suffix in the one place
// it is ever applied (§15.8, §16.8), and unlike the 10 children below the
// bare title is NOT suffixed with "Components": production's tab reads
// `Components — SevenUI`, not `Components Components — SevenUI`.
//
// No `openGraph` block, following Task 4.1: the OG surface is Stage 9's.
export async function generateMetadata(): Promise<Metadata> {
  const meta = await requirePageMeta(ROUTE, "app/components/page.tsx");
  return { title: pageTitle(meta.title), description: meta.description };
}

export default async function ComponentsPage() {
  const meta = await requirePageMeta(ROUTE, "app/components/page.tsx");

  const totalExamples = galleryComponents.reduce((sum, component) => sum + component.count, 0);

  // One template literal rather than the source's four adjacent JSX
  // expressions: the rendered text is the same run of characters either
  // way, and interleaving expressions with literal spaces is the shape that
  // silently loses a space the first time someone reformats the line.
  const summary =
    `${meta.description} ${totalExamples} ${totalExamples === 1 ? "component" : "components"} ` +
    `across ${galleryComponents.length} ${galleryComponents.length === 1 ? "primitive" : "primitives"}.`;

  return (
    <>
      <header className="border-b border-border px-6 py-12 lg:px-10">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight">{meta.title}</h1>
          <p className="mt-2 text-muted-foreground">{summary}</p>
        </div>
      </header>
      <div className="grid gap-4 px-6 py-12 sm:grid-cols-2 xl:grid-cols-3 lg:px-10">
        {galleryComponents.map((component) => (
          <Link
            className="rounded-xl border border-border p-5 transition-colors hover:bg-muted/50"
            href={`/components/${component.slug}`}
            key={component.slug}
          >
            <h2 className="text-sm font-medium">{component.label}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {`${component.count} ${component.count === 1 ? "component" : "components"}`}
            </p>
          </Link>
        ))}
      </div>
      <JsonLd route={ROUTE} />
    </>
  );
}
