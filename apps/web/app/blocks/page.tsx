import { BlocksFlavourNote } from "../../components/flavour/blocks-flavour-note";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import { CategoryCard } from "../../components/blocks/category-card";
import { ProOffer } from "../../components/blocks/pro-offer";
import { JsonLd } from "../../components/json-ld";
import type { Crumb } from "../../components/breadcrumb";
import { PageIntro } from "../../components/shell/page-intro";
import { ShareOnX } from "../../components/page-actions";
import { loadBlocksTree } from "../../lib/blocks";
import { pageMetadataOrNotFound } from "../../lib/metadata";
import { getPageMeta } from "../../lib/page-meta";
import { lucideIcon } from "../../lib/pro-manifest";

const ROUTE = "/blocks";

/** Shown on the page only; the page's structured data stays as it was, without a breadcrumb list. */
const CRUMBS: Crumb[] = [{ label: "Home", href: "/" }, { label: "Blocks" }];

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadataOrNotFound(ROUTE);
}

export default async function BlocksPage() {
  const meta = await getPageMeta(ROUTE);
  if (!meta) notFound();

  const groups = await loadBlocksTree();

  const totalBlocks = groups.reduce((sum, group) => sum + group.items.length, 0);
  const totalCategories = groups.reduce((sum, group) => sum + group.categories.length, 0);

  const summary =
    `${meta.description} ${totalBlocks} ${totalBlocks === 1 ? "block" : "blocks"} ` +
    `in ${totalCategories} ${totalCategories === 1 ? "category" : "categories"}.`;

  return (
    <>
      <PageIntro crumbs={CRUMBS} description={summary} title={meta.title}>
        <ShareOnX
          route={ROUTE}
          text={`${totalBlocks} Pro blocks for React, built on Base UI: full sections and pages, ready to ship.`}
        />
      </PageIntro>
      <BlocksFlavourNote />
      <ProOffer />
      <div className="py-12">
        <div className="flex max-w-5xl flex-col gap-12">
          {groups.map((group) => {
            const GroupIcon = group.icon
              ? (lucideIcon(group.icon) as ComponentType<SVGProps<SVGSVGElement>>)
              : null;
            return (
              <section key={group.id}>
                <div className="flex items-center gap-2">
                  {GroupIcon && <GroupIcon aria-hidden="true" className="size-4 text-muted-foreground" />}
                  <h2 className="text-lg font-semibold tracking-tight">
                    <Link className="hover:underline" href={`/blocks/${group.id}`}>
                      {group.label}
                    </Link>
                  </h2>
                  <span className="text-sm text-muted-foreground">{group.items.length}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>
                <div className="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {group.categories.map((category) => (
                    <CategoryCard category={category} group={group.id} key={category.id} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
      <JsonLd route={ROUTE} />
    </>
  );
}
