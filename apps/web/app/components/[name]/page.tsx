import { BookOpen, LayoutTemplate } from "lucide-react";
import type { Metadata } from "next";
import type { Crumb } from "../../../components/breadcrumb";
import { PageIntro } from "../../../components/shell/page-intro";
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
      {/*
        The rail takes the docs shell's geometry (app/docs/layout.tsx, app/docs/[[...slug]]/page.tsx): a
        16.25rem column flush with the viewport edge, 2.5rem after the content column. The gallery's <main>
        comes from its layout and keeps lg:pe-8 for the index page, so this grid gives that padding back
        at xl, and the rail's -mt-10 pt-10 cancels <main>'s top padding so it sticks under the header
        exactly where the docs rail does.
      */}
      <div className="xl:-me-8 xl:grid xl:grid-cols-[minmax(0,1fr)_16.25rem] xl:gap-x-10">
        <div className="min-w-0">
          <div className="max-w-4xl">
            <PageIntro crumbs={crumbs} description={meta.description} title={`${component.label} components`}>
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
                text={`${component.count} ${component.label} components for React, built on Base UI or UI SDK. Copy the code, own it.`}
              />
            </PageIntro>
          </div>
          <div className="flex max-w-4xl flex-col gap-14 py-10">
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
          className="sticky top-(--header-h) -mt-10 hidden h-[calc(100dvh-var(--header-h))] scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent overflow-y-auto pe-7 pt-10 pb-10 text-sm xl:block"
        >
          <DocsTocDesktop />
        </aside>
      </div>
      <JsonLd crumbs={crumbs} route={route} />
    </DocsTocProvider>
  );
}
