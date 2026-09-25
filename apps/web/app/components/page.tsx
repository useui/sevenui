import type { Metadata } from "next";
import { Breadcrumb, type Crumb } from "../../components/breadcrumb";
import { ShareOnX } from "../../components/page-actions";
import { ComponentCard } from "../../components/gallery/component-card";
import { JsonLd } from "../../components/json-ld";
import { galleryComponents, galleryFamilies } from "../../lib/gallery";
import { pageMetadata } from "../../lib/metadata";
import { requirePageMeta } from "../../lib/page-meta";

const ROUTE = "/components";

const CRUMBS: Crumb[] = [{ label: "Home", href: "/" }, { label: "Components" }];

export async function generateMetadata(): Promise<Metadata> {
  const meta = await requirePageMeta(ROUTE, "app/components/page.tsx");
  return pageMetadata(ROUTE, meta.title, meta.description);
}

export default async function ComponentsPage() {
  const meta = await requirePageMeta(ROUTE, "app/components/page.tsx");

  const totalExamples = galleryComponents.reduce((sum, component) => sum + component.count, 0);

  const summary =
    `${meta.description} ${totalExamples} ${totalExamples === 1 ? "component" : "components"} ` +
    `across ${galleryComponents.length} ${galleryComponents.length === 1 ? "primitive" : "primitives"}.`;

  return (
    <>
      <header className="border-b border-border px-6 pt-8 pb-10 lg:px-10">
        <Breadcrumb className="text-sm text-muted-foreground" crumbs={CRUMBS} />
        <div className="mt-6 flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl leading-[1.1] font-medium tracking-tighter text-balance sm:text-5xl">
              {meta.title}
            </h1>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">{summary}</p>
          </div>
          <ShareOnX
            route={ROUTE}
            text={`${totalExamples} free, copy-and-go React components built on Base UI and the shadcn registry.`}
          />
        </div>
        <nav aria-label="Families" className="mt-8">
          <ul className="flex flex-wrap gap-2">
            {galleryFamilies.map((family) => (
              <li key={family.id}>
                <a
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  href={`#${family.id}`}
                >
                  {family.label}
                  <span className="text-xs tabular-nums">{family.components.length}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <div className="flex flex-col gap-14 px-6 py-12 lg:px-10">
        {galleryFamilies.map((family) => (
          <section aria-labelledby={`${family.id}-heading`} className="scroll-mt-24" id={family.id} key={family.id}>
            <h2 className="text-xl font-semibold" id={`${family.id}-heading`}>
              {family.label}
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {family.components.map((component) => (
                <ComponentCard component={component} key={component.slug} />
              ))}
            </div>
          </section>
        ))}
      </div>
      <JsonLd crumbs={CRUMBS} route={ROUTE} />
    </>
  );
}
