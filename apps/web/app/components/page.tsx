import type { Metadata } from "next";
import type { Crumb } from "../../components/breadcrumb";
import { PageIntro } from "../../components/shell/page-intro";
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
      <PageIntro crumbs={CRUMBS} description={summary} title={meta.title}>
        <ShareOnX
          route={ROUTE}
          text={`${totalExamples} free, copy-and-go React components built on Base UI or UI SDK and the shadcn registry.`}
        />
      </PageIntro>
      <nav aria-label="Families" className="mt-6">
        <ul className="flex flex-wrap gap-2">
          {galleryFamilies.map((family) => (
            <li key={family.id}>
              <a
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 font-medium text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground"
                href={`#${family.id}`}
              >
                {family.label}
                <span className="text-docs-tertiary text-xs tabular-nums">{family.components.length}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex flex-col gap-14 py-12">
        {galleryFamilies.map((family) => (
          <section aria-labelledby={`${family.id}-heading`} className="scroll-mt-24" id={family.id} key={family.id}>
            <h2 className="font-medium text-foreground text-xl leading-[26px] tracking-normal" id={`${family.id}-heading`}>
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
