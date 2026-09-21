import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "../../components/json-ld";
import { galleryComponents } from "../../lib/gallery";
import { pageMetadata } from "../../lib/metadata";
import { requirePageMeta } from "../../lib/page-meta";

const ROUTE = "/components";

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
      <header className="border-b border-border px-6 py-12 lg:px-10">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight">{meta.title}</h1>
          <p className="mt-2 text-muted-foreground">{summary}</p>
        </div>
      </header>
      <div className="grid gap-4 px-6 py-12 sm:grid-cols-2 xl:grid-cols-3 lg:px-10">
        {galleryComponents.map((component) => (
          <Link
            className="rounded-xl border border-border p-5 transition-colors hover:bg-muted/50"
            href={`/components/${component.slug}`}
            key={component.slug}
          >
            <h2 className="text-sm font-medium">{component.label}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {`${component.count} ${component.count === 1 ? "component" : "components"}`}
            </p>
          </Link>
        ))}
      </div>
      <JsonLd route={ROUTE} />
    </>
  );
}
