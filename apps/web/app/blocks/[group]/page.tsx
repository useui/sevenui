import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProOffer } from "../../../components/blocks/pro-offer";
import { CategoryCard } from "../../../components/blocks/category-card";
import { Breadcrumb, type Crumb } from "../../../components/breadcrumb";
import { JsonLd } from "../../../components/json-ld";
import { loadBlocksTree } from "../../../lib/blocks";
import { getPageMeta } from "../../../lib/page-meta";
import { pageTitle } from "../../../lib/site";

// Ported from `legacy-pages/blocks/[group]/index.astro`. The shell, the
// category tree, the theme dock and the page singletons are
// `app/blocks/layout.tsx`'s; this file is the group's own content.
//
// HOW A CATEGORY ADDED IN THE PRO REPO REACHES THIS SITE WITHOUT A REBUILD.
// This is the mechanism the whole stage exists for and it is not the obvious
// one, so it is written down rather than inferred:
//
//   1. `generateStaticParams` runs at BUILD TIME ONLY. It does not re-run on
//      revalidation. So a group or category created after the last deploy is
//      never added to the enumerated set, no matter how long the site runs.
//   2. `/blocks` and `/blocks/[group]` revalidate on their own 300-second
//      window and re-render from the FRESH manifest, so their listings — the
//      directory's cards, this page's cards, and the tree in both sidebar
//      mounts — already contain the new entry.
//   3. Those listings link to a path that was never enumerated.
//      `dynamicParams` is what renders it on demand and caches the result.
//
// Step 3 is the load-bearing one: without it the link in step 2 would be a
// dead end, and the new category would 404 until a human triggered a build —
// the exact manual step this migration removes.
export const dynamicParams = true; // not optional: with it off, a new category
//                                    404s until someone rebuilds — the exact
//                                    manual step this migration removes.

type Params = { group: string };

export async function generateStaticParams(): Promise<Params[]> {
  const groups = await loadBlocksTree();
  return groups.map((group) => ({ group: group.id }));
}

// THE CONSEQUENCE OF `dynamicParams`, and it applies to every lookup in this
// file and its sibling. The Astro source wrote `groups.find(...)!` — a
// non-null assertion that was safe only because every path it ever rendered
// came out of `getStaticPaths`. Here an arbitrary path reaches the component,
// so the assertion would produce a 500 where a 404 is correct. Every lookup is
// therefore a `find` followed by `notFound()`.
//
// The same `notFound()` covers REMOVAL: when the pro repo deletes a group, its
// cached route keeps serving until the window elapses, at which point the
// lookup misses and it becomes a 404 on its own.
//
// Note the field is `id`. The plan's prose says `slug`; the manifest schema,
// the join in `lib/blocks.ts` and the Astro source all use `id`, and a
// category names its parent through `category.group`. There is no `slug` in
// this schema.
//
// `generateMetadata` behaves the same way and must not throw: metadata is
// resolved BEFORE the component runs, so a throw here would be a 500 that the
// page's own `notFound()` never gets the chance to correct. A miss returns the
// 404's title instead, the same string `app/not-found.tsx` declares and
// through the same `pageTitle` (§15.8, intended diff #28) — this is exactly
// the shape `app/docs/[[...slug]]/page.tsx` uses for its own miss.
//
// No `requirePageMeta`: see its docstring's list of deliberate non-adopters,
// which names these routes and why.
//
// No `openGraph` block, following Task 4.1: the OG surface is Stage 9's.
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { group } = await params;
  const meta = await getPageMeta(`/blocks/${group}`);
  if (!meta) return { title: pageTitle("Page not found") };
  return { title: pageTitle(meta.title), description: meta.description };
}

export default async function BlocksGroupPage({ params }: { params: Promise<Params> }) {
  const { group: groupId } = await params; // params is a Promise in Next 16
  const route = `/blocks/${groupId}`;

  const groups = await loadBlocksTree();
  const group = groups.find((entry) => entry.id === groupId);
  if (!group) notFound();

  // ONE array, two consumers — the rendered trail and the `BreadcrumbList`
  // node. That is the property `components/json-ld.tsx` insists on: the markup
  // and the structured data cannot describe two different hierarchies, because
  // they are the same value. "Blocks" is the directory page's own title, not a
  // coinage.
  const crumbs: Crumb[] = [{ label: "Blocks", href: "/blocks" }, { label: group.label }];

  // One template literal, for the reason given on `/blocks`'s own summary: two
  // adjacent text children would be separated by an empty HTML comment in
  // React's SSR output, and production emits the bare sentence. Note the
  // single space between the group's own sentence and the count — that comes
  // from this literal, not from JSX whitespace.
  const summary =
    `${group.description} ${group.items.length} ` +
    `${group.items.length === 1 ? "block" : "blocks"} in this group.`;

  return (
    <>
      <header className="border-b border-border px-6 py-12 lg:px-10">
        <div className="max-w-2xl">
          {/*
            The docs breadcrumb's component and markup, not production's bare
            spans — `components/breadcrumb.tsx` explains why `/blocks` moves to
            the shared one rather than 68 docs pages moving to this one. The
            class string is production's for this position, unchanged. No
            pathname hook is involved: a page knows its own route, so it builds
            its trail on the server.
          */}
          <Breadcrumb className="text-sm text-muted-foreground" crumbs={crumbs} />
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">{group.label}</h1>
          <p className="mt-2 text-muted-foreground">{summary}</p>
        </div>
      </header>
      <ProOffer />
      <div className="px-6 py-12 lg:px-10">
        <div className="grid max-w-5xl gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {group.categories.map((category) => (
            <CategoryCard category={category} group={group.id} key={category.id} />
          ))}
        </div>
      </div>
      <JsonLd crumbs={crumbs} route={route} />
    </>
  );
}
