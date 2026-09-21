import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import { CategoryCard } from "../../components/blocks/category-card";
import { ProOffer } from "../../components/blocks/pro-offer";
import { JsonLd } from "../../components/json-ld";
import { loadBlocksTree } from "../../lib/blocks";
import { pageMetadataOrNotFound } from "../../lib/metadata";
import { getPageMeta } from "../../lib/page-meta";
import { lucideIcon } from "../../lib/pro-manifest";

// Ported from `legacy-pages/blocks/index.astro`. Everything that page took
// from Blume's `PageLayout` — header, theme, drawer, footer, skip link,
// fonts, analytics — comes from `app/layout.tsx` now, and the two-column
// shell, the category tree, the theme dock and the three page singletons come
// from `app/blocks/layout.tsx`, so this file is the directory's own content
// and nothing else.
//
// The directory lists GROUPS: each one's mark, a link to it, its item count,
// its own sentence, and its categories as cards.

const ROUTE = "/blocks";

// No `requirePageMeta`, and the reason is written out in that function's own
// docstring: the three `/blocks` routes are on its list of deliberate
// non-adopters. On THIS route the entry is a literal in `CUSTOM`, so the miss
// branch below cannot fire while that stays true — it is written anyway so the
// section's three files have one shape, and so that a future move of this
// entry into the manifest-backed branch does not silently turn a removed
// registration into a 500. Its two children genuinely need it.
//
// `pageMetadataOrNotFound` (task-9.2b) is the shared "may miss" shape every
// route in this stage that sits under `dynamicParams = true` uses: it
// reproduces production's reduced 404 tag set on a miss and the full one on
// a hit, because a lookup miss here is a user's mistyped URL, not a
// programming error, and must resolve to the 404's metadata rather than a
// throw.
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadataOrNotFound(ROUTE);
}

export default async function BlocksPage() {
  const meta = await getPageMeta(ROUTE);
  if (!meta) notFound();

  // Reads the SAME tree the layout above already resolved, through the same
  // URL-keyed Data Cache entry — no second network request. See the layout's
  // header.
  const groups = await loadBlocksTree();

  // Computed, never written down, so the sentence stays true as the pro repo
  // adds groups, categories and items without this repo rebuilding — which is
  // the property the whole section exists to have. It is the same property the
  // two child pages' own "N in this …" sentences carry.
  const totalBlocks = groups.reduce((sum, group) => sum + group.items.length, 0);
  const totalCategories = groups.reduce((sum, group) => sum + group.categories.length, 0);

  // One template literal rather than the Astro source's five adjacent JSX
  // expressions separated by literal spaces. The rendered run of characters is
  // identical; what changes is that React's SSR writer puts an empty HTML
  // comment between two adjacent text children, and a single expression is a
  // single text node. Production emits the bare sentence, so this keeps the
  // bytes matching instead of adding a marker to the page. Both count words
  // keep their singular branch.
  const summary =
    `${meta.description} ${totalBlocks} ${totalBlocks === 1 ? "block" : "blocks"} ` +
    `in ${totalCategories} ${totalCategories === 1 ? "category" : "categories"}.`;

  return (
    <>
      <header className="border-b border-border px-6 py-12 lg:px-10">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight">{meta.title}</h1>
          <p className="mt-2 text-muted-foreground">{summary}</p>
        </div>
      </header>
      {/* Immediately below the header, on all three pages — see its own header
          for why the offer is a band of its own rather than a pill in the
          title's prose wrapper. */}
      <ProOffer />
      <div className="px-6 py-12 lg:px-10">
        <div className="flex max-w-5xl flex-col gap-12">
          {groups.map((group) => {
            // The same narrowing the layout does for the nav tree's marks, and
            // for the same reason — `lucideIcon` is deliberately typed without
            // naming a React type. This mark is a size larger than the nav's:
            // it sits on an `<h2>`, not on a tree row.
            const GroupIcon = group.icon
              ? (lucideIcon(group.icon) as ComponentType<SVGProps<SVGSVGElement>>)
              : null;
            return (
              <section key={group.id}>
                <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                  {GroupIcon && <GroupIcon aria-hidden="true" className="size-4 text-muted-foreground" />}
                  <Link className="hover:underline" href={`/blocks/${group.id}`}>
                    {group.label}
                  </Link>
                  <span className="text-sm font-normal text-muted-foreground">{group.items.length}</span>
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>
                <div className="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {group.categories.map((category) => (
                    <CategoryCard category={category} group={group.id} key={category.id} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
      {/* No `crumbs` prop: the directory is the trail's root and draws no
          breadcrumb, so there is no `BreadcrumbList` node for it either —
          the same one-item rule `components/breadcrumb.tsx` applies. */}
      <JsonLd route={ROUTE} />
    </>
  );
}
