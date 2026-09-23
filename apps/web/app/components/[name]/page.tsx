import type { Metadata } from "next";
import Link from "next/link";
import { ExampleCard } from "../../../components/gallery/example-card";
import { JsonLd } from "../../../components/json-ld";
import { GALLERY_SLUGS, galleryComponent, galleryExamples } from "../../../lib/gallery";
import { pageMetadata } from "../../../lib/metadata";
import { requirePageMeta } from "../../../lib/page-meta";

type Params = { name: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return GALLERY_SLUGS.map((name) => ({ name }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { name } = await params;
  const route = `/components/${name}`;
  const meta = await requirePageMeta(route, "app/components/[name]/page.tsx");
  return pageMetadata(route, `${meta.title} Components`, meta.description);
}

export default async function GalleryComponentPage({ params }: { params: Promise<Params> }) {
  const { name } = await params; // params is a Promise in Next 16
  const route = `/components/${name}`;

  const component = galleryComponent(name);
  const examples = galleryExamples(name);

  const meta = await requirePageMeta(route, "app/components/[name]/page.tsx");

  return (
    <>
      <header className="border-b border-border px-6 py-10 lg:px-10">
        <h1 className="text-3xl font-semibold tracking-tight">{component.label}</h1>
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
