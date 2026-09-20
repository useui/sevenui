import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlockCard } from "../../../../components/blocks/block-card";
import { PackageManagerIcons } from "../../../../components/blocks/package-manager-icons";
import { ProOffer } from "../../../../components/blocks/pro-offer";
import { Breadcrumb, type Crumb } from "../../../../components/breadcrumb";
import { JsonLd } from "../../../../components/json-ld";
import { loadBlocksTree } from "../../../../lib/blocks";
import { getPageMeta } from "../../../../lib/page-meta";
import { pageTitle } from "../../../../lib/site";

// Ported from `legacy-pages/blocks/[group]/[category].astro`. The shell, the
// category tree, the theme dock, the live region, the preview queue and the
// tooltip context are `app/blocks/layout.tsx`'s; this file is the category's
// own content, plus the one page singleton that belongs to it alone (the
// package-manager sprite, below).
//
// This is the only one of the three pages that renders live previews: a
// vertically divided stack of `<BlockCard>`s, each one an iframe under the
// layout's concurrency cap.
//
// HOW A CATEGORY ADDED IN THE PRO REPO REACHES THIS SITE WITHOUT A REBUILD —
// the mechanism the whole stage exists for, and not the obvious one:
//
//   1. `generateStaticParams` runs at BUILD TIME ONLY; it does not re-run on
//      revalidation, so a category created after the last deploy never enters
//      the enumerated set however long the site runs.
//   2. `/blocks` and `/blocks/[group]` revalidate on their 300-second window
//      and re-render from the FRESH manifest, so their listings — and the
//      category tree in both of its mounts — already carry the new entry.
//   3. Those listings link to a path that was never enumerated.
//      `dynamicParams` renders it on demand and caches the result.
//
// Step 3 is what turns step 2's link from a dead end into a page.
export const dynamicParams = true; // not optional: with it off, a new category
//                                    404s until someone rebuilds — the exact
//                                    manual step this migration removes.

type Params = { group: string; category: string };

export async function generateStaticParams(): Promise<Params[]> {
  const groups = await loadBlocksTree();
  return groups.flatMap((group) =>
    group.categories.map((category) => ({ group: group.id, category: category.id })),
  );
}

// THE CONSEQUENCE OF `dynamicParams`. The Astro source's two `find(...)!`
// assertions were safe only because every path it rendered came from
// `getStaticPaths`; here an arbitrary path reaches the component, so each one
// becomes a `find` plus `notFound()` — otherwise a mistyped URL is a 500 where
// a 404 is correct. The same `notFound()` covers removal: a deleted category's
// cached route keeps serving until its window elapses, then misses and 404s.
//
// THE CASE THAT MATTERS MOST is neither of the obvious two. A category id that
// really exists, but under a DIFFERENT group, produces a path where the first
// lookup succeeds and the second must fail — `group.categories` is the joined
// tree's own array, so a category is only ever found under its real parent.
// Looking the category up in the flat manifest instead would have rendered
// that path happily under the wrong breadcrumb.
//
// `generateMetadata` must not throw for the same reason as its sibling's:
// metadata resolves before the component runs, so a throw is a 500 the page's
// `notFound()` never gets to correct. A miss returns the 404 title.
//
// No `requirePageMeta`: see its docstring's list of deliberate non-adopters.
// No `openGraph` block, following Task 4.1: the OG surface is Stage 9's.
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { group, category } = await params;
  const meta = await getPageMeta(`/blocks/${group}/${category}`);
  if (!meta) return { title: pageTitle("Page not found") };
  return { title: pageTitle(meta.title), description: meta.description };
}

export default async function BlocksCategoryPage({ params }: { params: Promise<Params> }) {
  const { group: groupId, category: categoryId } = await params; // params is a Promise in Next 16
  const route = `/blocks/${groupId}/${categoryId}`;

  const groups = await loadBlocksTree();
  const group = groups.find((entry) => entry.id === groupId);
  if (!group) notFound();
  const category = group.categories.find((entry) => entry.id === categoryId);
  if (!category) notFound();

  // ONE array, two consumers — the rendered trail and the `BreadcrumbList`
  // node — which is what keeps the markup and the structured data from ever
  // describing two different hierarchies.
  const crumbs: Crumb[] = [
    { label: "Blocks", href: "/blocks" },
    { label: group.label, href: `/blocks/${group.id}` },
    { label: category.label },
  ];

  const summary =
    `${category.description} ${category.items.length} ` +
    `${category.items.length === 1 ? "block" : "blocks"} in this category.`;

  return (
    <>
      {/*
        The one page singleton that is NOT in the layout: ~10 KB of brand path
        data referenced only by each install control's `<use href="#pm-icon-*">`,
        which exists on this page and nowhere else in the section. Its position
        in the document does not affect `<use>` resolution; it is first here
        because that is where `blocks-prefs.astro` sat in the content column.
      */}
      <PackageManagerIcons />
      <header className="border-b border-border px-6 py-12 lg:px-10">
        <div className="max-w-2xl">
          <Breadcrumb className="text-sm text-muted-foreground" crumbs={crumbs} />
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">{category.label}</h1>
          <p className="mt-2 text-muted-foreground">{summary}</p>
        </div>
      </header>
      <ProOffer />
      <div className="px-6 py-12 lg:px-10">
        <div className="divide-y divide-border">
          {category.items.map((item) => (
            <BlockCard
              badge="Pro"
              description={item.description}
              height={item.previewHeight}
              installItem={`pro/${item.name}`}
              key={item.name}
              name={item.name}
              previewUrl={`/previews/${item.name}`}
              title={item.title}
            />
          ))}
        </div>
      </div>
      <JsonLd crumbs={crumbs} route={route} />
    </>
  );
}
