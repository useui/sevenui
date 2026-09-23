import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProOffer } from "../../../components/blocks/pro-offer";
import { CategoryCard } from "../../../components/blocks/category-card";
import { Breadcrumb, type Crumb } from "../../../components/breadcrumb";
import { JsonLd } from "../../../components/json-ld";
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
      <header className="border-b border-border px-6 py-12 lg:px-10">
        <div className="max-w-2xl">
          <Breadcrumb className="text-sm text-muted-foreground" crumbs={crumbs} />
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">{group.label}</h1>
          <p className="mt-2 text-muted-foreground">{summary}</p>
        </div>
      </header>
      <ProOffer />
      <div className="px-6 py-12 lg:px-10">
        <div className="grid max-w-5xl gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {group.categories.map((category) => (
            <CategoryCard category={category} group={group.id} key={category.id} />
          ))}
        </div>
      </div>
      <JsonLd crumbs={crumbs} route={route} />
    </>
  );
}
