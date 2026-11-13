import { BlocksFlavourNote } from "../../../../components/flavour/blocks-flavour-note";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlockCard } from "../../../../components/blocks/block-card";
import { PackageManagerIcons } from "../../../../components/blocks/package-manager-icons";
import { ProOffer } from "../../../../components/blocks/pro-offer";
import type { Crumb } from "../../../../components/breadcrumb";
import { PageIntro } from "../../../../components/shell/page-intro";
import { JsonLd } from "../../../../components/json-ld";
import { ShareOnX } from "../../../../components/page-actions";
import { loadBlocksTree } from "../../../../lib/blocks";
import { pageMetadataOrNotFound } from "../../../../lib/metadata";

export const dynamicParams = true; 

type Params = { group: string; category: string };

export async function generateStaticParams(): Promise<Params[]> {
  const groups = await loadBlocksTree();
  return groups.flatMap((group) =>
    group.categories.map((category) => ({ group: group.id, category: category.id })),
  );
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { group, category } = await params;
  return pageMetadataOrNotFound(`/blocks/${group}/${category}`);
}

export default async function BlocksCategoryPage({ params }: { params: Promise<Params> }) {
  const { group: groupId, category: categoryId } = await params; // params is a Promise in Next 16
  const route = `/blocks/${groupId}/${categoryId}`;

  const groups = await loadBlocksTree();
  const group = groups.find((entry) => entry.id === groupId);
  if (!group) notFound();
  const category = group.categories.find((entry) => entry.id === categoryId);
  if (!category) notFound();

  const crumbs: Crumb[] = [
    { label: "Blocks", href: "/blocks" },
    { label: group.label, href: `/blocks/${group.id}` },
    { label: category.label },
  ];

  const summary =
    `${category.description} ${category.items.length} ` +
    `${category.items.length === 1 ? "block" : "blocks"} in this category.`;

  return (
    <>
      <PackageManagerIcons />
      <PageIntro crumbs={crumbs} description={summary} title={`${category.label} blocks`}>
        <ShareOnX
          route={route}
          text={`${category.label}: ${category.items.length} Pro blocks for React, built on Base UI.`}
        />
      </PageIntro>
      <BlocksFlavourNote />
      <ProOffer />
      <div className="py-12">
        <div className="divide-y divide-border">
          {category.items.map((item) => (
            <BlockCard
              badge="Pro"
              description={item.description}
              height={item.previewHeight}
              installItem={`pro/${item.name}`}
              key={item.name}
              name={item.name}
              previewUrl={`/previews/${item.name}`}
              title={item.title}
            />
          ))}
        </div>
      </div>
      <JsonLd crumbs={crumbs} route={route} />
    </>
  );
}
