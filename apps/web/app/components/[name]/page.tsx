import { BookOpen, LayoutTemplate } from "lucide-react";
import type { Metadata } from "next";
import { Breadcrumb, type Crumb } from "../../../components/breadcrumb";
import { DocsTocDesktop, DocsTocMobile, DocsTocProvider } from "../../../components/docs/toc";
import { ActionLink, ShareOnX } from "../../../components/page-actions";
import { ExampleCard } from "../../../components/gallery/example-card";
import { GalleryPager } from "../../../components/gallery/pager";
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
  return pageMetadata(route, meta.title, meta.description);
}

export default async function GalleryComponentPage({ params }: { params: Promise<Params> }) {
  const { name } = await params; // params is a Promise in Next 16
  const route = `/components/${name}`;

  const component = galleryComponent(name);
  const examples = galleryExamples(name);

  const meta = await requirePageMeta(route, "app/components/[name]/page.tsx");

  const crumbs: Crumb[] = [
    { label: "Home", href: "/" },
    { label: "Components", href: "/components" },
    { label: component.label },
  ];

  const headings = examples.map((example) => ({ depth: 2 as const, id: example.id, text: example.title }));

  return (
    <DocsTocProvider headings={headings}>
      {/* The rail sits at the viewport edge; header and examples share one column centered in the rest. */}
      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="min-w-0">
          <header className="border-b border-border px-6 pt-8 pb-10 lg:px-10">
            <div className="mx-auto max-w-4xl">
              <Breadcrumb className="text-sm text-muted-foreground" crumbs={crumbs} />
              <h1 className="mt-6 font-display text-4xl leading-[1.1] font-medium tracking-tighter text-balance sm:text-5xl">
                {component.label} components
              </h1>
              <p className="mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">{meta.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <ActionLink href={`/docs/components/${name}`} variant="primary">
                  <BookOpen aria-hidden="true" />
                  Read the docs
                </ActionLink>
                <ActionLink href="/blocks">
                  <LayoutTemplate aria-hidden="true" />
                  Browse Pro blocks
                </ActionLink>
                <ShareOnX
                  route={route}
                  text={`${component.count} ${component.label} components for React, built on Base UI. Copy the code, own it.`}
                />
              </div>
            </div>
          </header>
          <div className="mx-auto flex max-w-4xl flex-col gap-14 px-6 py-10 lg:box-content lg:px-10">
            <DocsTocMobile className="-mb-4" />
            {examples.map((example) => (
              <ExampleCard
                description={example.description}
                id={example.id}
                key={example.id}
                slug={name}
                title={example.title}
              />
            ))}
            <GalleryPager slug={name} />
          </div>
        </div>
        <aside
          aria-label="On this page"
          className="sticky top-16 hidden h-[calc(100dvh-4rem)] scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent overflow-y-auto border-l border-border px-5 pt-10 pb-10 text-sm xl:block"
        >
          <DocsTocDesktop />
        </aside>
      </div>
      <JsonLd crumbs={crumbs} route={route} />
    </DocsTocProvider>
  );
}
