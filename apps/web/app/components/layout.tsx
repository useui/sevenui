import { GalleryNav } from "../../components/gallery/nav";
import { galleryComponents } from "../../lib/gallery";

/**
 * The `/components` gallery layout, ported from
 * `legacy-components/component-gallery.astro`: a sticky component list in a
 * left column with a structural border, content on the right. The sticky
 * offset mirrors the docs sidebar's.
 *
 * Wrapping all 11 gallery routes means the list is mounted ONCE and survives
 * every navigation between them — which is the migration's whole point, and
 * the reason this is a layout rather than something each page draws.
 *
 * Desktop only, exactly as the Astro version: below `lg` the same tree is
 * reached through the header's nav drawer, which `components/site-drawer.tsx`
 * renders on these routes (the list used to stack above the content on
 * mobile, pushing the page down).
 *
 * NOT a route group. The brief names `app/(gallery)/components/…`; a route
 * group exists to share a layout across SIBLING segments without affecting
 * the URL, and there is exactly one segment here, which this file already
 * scopes itself to.
 *
 * A SERVER component: `lib/gallery.ts` reads two registry JSON files and
 * `GalleryNav` is `"use client"`, so the list is resolved here and handed
 * down as plain serialized data.
 *
 * No `<main>` and no page chrome — `app/layout.tsx` owns the document
 * (§11.1), and the root `<main id="content">` is the skip link's target.
 */
export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden lg:sticky lg:top-16 lg:block lg:h-[calc(100dvh-4rem)] lg:overflow-y-auto lg:border-r lg:border-border lg:px-5 lg:py-8">
        <GalleryNav components={galleryComponents} />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
