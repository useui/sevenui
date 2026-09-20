import type { Metadata } from "next";
import Link from "next/link";
import { ExampleCard } from "../../../components/gallery/example-card";
import { JsonLd } from "../../../components/json-ld";
import { GALLERY_SLUGS, galleryComponent, galleryExamples } from "../../../lib/gallery";
import { requirePageMeta } from "../../../lib/page-meta";
import { pageTitle } from "../../../lib/site";

// Ported from the ten `legacy-pages/components/<slug>.astro` files, which
// are byte-identical to one another apart from the slug (verified by
// normalising each against `button.astro`) — the same header, the same
// metadata block, the same four `<ExampleCard>`s in the same order as the
// registry's own item list for that folder.
//
// ONE dynamic segment, not ten files. The page set is still fixed at ten:
// `generateStaticParams` returns exactly `GALLERY_SLUGS` and
// `dynamicParams = false` refuses everything else, so adding a registry
// item still does not add a route — and `lib/gallery.ts` throws at build
// time if that list and the registry's folder set ever disagree, which is
// what `_data.ts`'s `import.meta.glob("./*.astro")` check did. Ten
// near-identical files would instead copy the example list, the header, the
// metadata block and the JSON-LD mount ten times over.

type Params = { name: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return GALLERY_SLUGS.map((name) => ({ name }));
}

// `<Label> Components — SevenUI`, which Stage 0 pre-shipped to `main` and
// production already serves — reproduced, not re-derived. Note the two
// titles are NOT the same string: the page-meta bare title is the label on
// its own (`Button`), which is what the `<h1>` and the JSON-LD `headline`
// use, while the tab appends `Components` before `pageTitle` (§15.8) adds
// the em-dash suffix.
//
// No `openGraph` block, following Task 4.1: the OG surface is Stage 9's.
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { name } = await params;
  const meta = await requirePageMeta(`/components/${name}`, "app/components/[name]/page.tsx");
  return { title: pageTitle(`${meta.title} Components`), description: meta.description };
}

export default async function GalleryComponentPage({ params }: { params: Promise<Params> }) {
  const { name } = await params; // params is a Promise in Next 16
  const route = `/components/${name}`;

  // Both fail loudly rather than returning undefined: `dynamicParams =
  // false` means an unknown slug never reaches this function at all, so
  // anything these two cannot answer is a broken pairing between
  // `GALLERY_SLUGS` and the registry — the case `lib/gallery.ts`'s own
  // build-time assertion exists to catch before a request ever gets here.
  const component = galleryComponent(name);
  const examples = galleryExamples(name);

  // The one-sentence description is `lib/page-meta.ts`'s, not a second copy
  // of the template: it is what `<meta name="description">` emits for this
  // route, and production renders that exact sentence in the page body too.
  const meta = await requirePageMeta(route, "app/components/[name]/page.tsx");

  return (
    <>
      <header className="border-b border-border px-6 py-10 lg:px-10">
        <h1 className="text-3xl font-semibold tracking-tight">{component.label}</h1>
        {/*
          No whitespace between the sentence and the link, and none between
          the link and the full stop — production renders them flush
          (`…primitive.<a …>Read the primitive docs</a>.`), and JSX strips
          exactly the newline-bearing whitespace that sits here, so this
          reads naturally and matches.
        */}
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {meta.description}
          <Link className="underline underline-offset-4" href={`/docs/components/${name}`}>
            Read the primitive docs
          </Link>
          .
        </p>
      </header>
      <div className="flex max-w-4xl flex-col gap-12 px-6 py-10 lg:px-10">
        {examples.map((example) => (
          <ExampleCard id={example.id} key={example.id} slug={name} title={example.title} />
        ))}
      </div>
      <JsonLd route={route} />
    </>
  );
}
