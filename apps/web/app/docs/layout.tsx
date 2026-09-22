import { DocsBreadcrumb } from "../../components/docs/breadcrumb";
import { DocsPageActions } from "../../components/docs/page-actions";
import { DocsSidebar } from "../../components/docs/sidebar";
import { DocsTocDesktop, DocsTocMobile, DocsTocProvider } from "../../components/docs/toc";
import { getDocIndex } from "../../lib/docs";
import type { Heading } from "../../lib/docs/headings";
import { type Crumb, docsTrail, getNavTree, resolvePrimitivesHref } from "../../lib/docs/nav";

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const tree = await getNavTree();
  const primitivesHref = resolvePrimitivesHref(tree);
  if (!primitivesHref) {
    throw new Error("app/docs/layout.tsx: nav tree has no Primitives group with a resolvable href");
  }

  const headingsByRoute: Record<string, Heading[]> = {};
  const crumbsByRoute: Record<string, Crumb[]> = {};
  for (const page of await getDocIndex()) {
    headingsByRoute[page.route] = page.headings;
    crumbsByRoute[page.route] = docsTrail(tree, page.route);
  }

  return (
    <DocsTocProvider headingsByRoute={headingsByRoute}>
      <div className="mx-auto grid grid-cols-1 items-start lg:grid-cols-[17.5rem_minmax(0,1fr)] xl:grid-cols-[17.5rem_minmax(0,1fr)_17.5rem]">
        <DocsSidebar primitivesHref={primitivesHref} tree={tree} />
        <main className="px-6 pt-6 pb-10 lg:px-8 xl:px-10" id="content">
          <DocsBreadcrumb crumbsByRoute={crumbsByRoute} />
          <DocsTocMobile />
          {children}
        </main>
        <aside
          aria-label="On this page"
          className="sticky top-16 hidden h-[calc(100dvh-4rem)] scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent overflow-y-auto px-4 pt-6 pb-10 text-sm xl:block"
        >
          <DocsTocDesktop />
          <DocsPageActions docRoutes={Object.keys(headingsByRoute)} />
        </aside>
      </div>
    </DocsTocProvider>
  );
}
