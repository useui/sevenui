import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsFeedback } from "../../../components/docs/feedback";
import { DocsPagination } from "../../../components/docs/pagination";
import { JsonLd } from "../../../components/json-ld";
import { getDoc, getDocIndex } from "../../../lib/docs";
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

  const meta = await getPageMeta(route);

  return (
    <>
      <link href="/agent-readability.json" rel="describedby" type="application/json" />
      <link href="/llms.txt" rel="describedby" type="text/plain" />
      <link href={`${route}.md`} rel="alternate" type="text/markdown" />
      <article className="mx-auto max-w-content">
        <h1 className="mb-4 font-display text-4xl leading-[1.1] font-medium tracking-tighter text-foreground break-words sm:text-5xl">
          {doc.title}
        </h1>
        <p className="my-4 text-lg text-muted-foreground">{doc.description}</p>
        <MDXContent />
      </article>
      <DocsFeedback title={meta?.title ?? doc.title} />
      <DocsPagination route={route} />
      <JsonLd route={route} />
    </>
  );
}
