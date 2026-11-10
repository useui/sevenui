import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsFeedback } from "../../../components/docs/feedback";
import { DocsPageActions } from "../../../components/docs/page-actions";
import { DocsPagination } from "../../../components/docs/pagination";
import { DocsTocDesktop, DocsTocMobile, DocsTocProvider } from "../../../components/docs/toc";
import { JsonLd } from "../../../components/json-ld";
import { ShellTopline } from "../../../components/shell/page-intro";
import { getDoc, getDocIndex } from "../../../lib/docs";
import { docsTrail, getNavTree } from "../../../lib/docs/nav";
import { pageMetadataOrNotFound } from "../../../lib/metadata";
import { getPageMeta } from "../../../lib/page-meta";

type Params = { slug?: string[] };

function routeFrom({ slug = [] }: Params): string {
  return slug.length ? `/docs/${slug.join("/")}` : "/docs";
}

export async function generateStaticParams() {
  const index = await getDocIndex();
  return index.map((p) => ({
    slug: p.route === "/docs" ? [] : p.route.slice("/docs/".length).split("/"),
  }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const route = routeFrom(await params);
  return pageMetadataOrNotFound(route);
}

export default async function DocPage({ params }: { params: Promise<Params> }) {
  const { slug = [] } = await params;
  const route = routeFrom({ slug });
  const doc = await getDoc(route);
  if (!doc) notFound();

  const { default: MDXContent } = await import(`../../../docs/${slug.length ? slug.join("/") : "index"}.mdx`);

  const [meta, tree] = await Promise.all([getPageMeta(route), getNavTree()]);

  return (
    <DocsTocProvider headings={doc.headings}>
      <main className="min-w-0 px-6 pt-6 pb-12 lg:ps-0 lg:pe-8 lg:pt-10 xl:pe-0" id="content">
        <ShellTopline className="max-w-docs" crumbs={docsTrail(tree, route)} />
        <DocsTocMobile />
        <link href="/agent-readability.json" rel="describedby" type="application/json" />
        <link href="/llms.txt" rel="describedby" type="text/plain" />
        <link href={`${route}.md`} rel="alternate" type="text/markdown" />
        <article className="max-w-docs">
          <h1 className="mt-6 mb-0 font-display font-medium text-2xl text-foreground leading-[34px] tracking-normal break-words">
            {doc.title}
          </h1>
          <p className="mt-3 mb-8 font-medium text-base text-muted-foreground leading-[22px]">{doc.description}</p>
          <MDXContent />
        </article>
        <DocsFeedback title={meta?.title ?? doc.title} />
        <DocsPagination route={route} />
        <JsonLd route={route} />
      </main>
      <aside
        aria-label="On this page"
        className="sticky top-(--header-h) hidden h-[calc(100dvh-var(--header-h))] scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent overflow-y-auto pe-7 pt-10 pb-10 text-sm xl:block"
      >
        <DocsTocDesktop />
        <DocsPageActions route={route} />
      </aside>
    </DocsTocProvider>
  );
}
