import { BlocksFlavourNote } from "../../../components/flavour/blocks-flavour-note";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProOffer } from "../../../components/blocks/pro-offer";
import { CategoryCard } from "../../../components/blocks/category-card";
import type { Crumb } from "../../../components/breadcrumb";
import { PageIntro } from "../../../components/shell/page-intro";
import { JsonLd } from "../../../components/json-ld";
import { ShareOnX } from "../../../components/page-actions";
import { loadBlocksTree } from "../../../lib/blocks";
import { pageMetadataOrNotFound } from "../../../lib/metadata";

export const dynamicParams = true; 

type Params = { group: string };

export async function generateStaticParams(): Promise<Params[]> {
  const groups = await loadBlocksTree();
  return groups.map((group) => ({ group: group.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { group } = await params;
  return pageMetadataOrNotFound(`/blocks/${group}`);
}

export default async function BlocksGroupPage({ params }: { params: Promise<Params> }) {
  const { group: groupId } = await params; // params is a Promise in Next 16
  const route = `/blocks/${groupId}`;

  const groups = await loadBlocksTree();
  const group = groups.find((entry) => entry.id === groupId);
  if (!group) notFound();

  const crumbs: Crumb[] = [{ label: "Blocks", href: "/blocks" }, { label: group.label }];

  const summary =
    `${group.description} ${group.items.length} ` +
    `${group.items.length === 1 ? "block" : "blocks"} in this group.`;

  return (
    <>
      <PageIntro crumbs={crumbs} description={summary} title={`${group.label} blocks`}>
        <ShareOnX
          route={route}
          text={`${group.label}: ${group.items.length} Pro blocks for React, built on Base UI.`}
        />
      </PageIntro>
      <BlocksFlavourNote />
      <ProOffer />
      <div className="py-12">
        <div className="grid max-w-5xl gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {group.categories.map((category) => (
            <CategoryCard category={category} group={group.id} headingLevel={2} key={category.id} />
          ))}
        </div>
      </div>
      <JsonLd crumbs={crumbs} route={route} />
    </>
  );
}
