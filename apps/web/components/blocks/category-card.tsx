import Link from "next/link";
import { LayerCard, LayerCardFooter, LayerCardPanel } from "@/registry/base/ui/layer-card";
import type { Category } from "../../lib/blocks";

const COVER = "h-full w-full object-cover transition-transform duration-200 motion-safe:group-hover:scale-[1.02]";

export function CategoryCard({
  group,
  category,
  headingLevel = 3,
}: {
  group: string;
  category: Category;
  /** 3 under the /blocks hub's group headings; 2 on a group page, where the cards sit right under the h1. */
  headingLevel?: 2 | 3;
}) {
  const cover = category.cover;
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    // The cover is the raised panel; the label, count and description sit on the tray as footer chrome.
    <LayerCard
      className="group transition-[border-color] hover:[--layer-card-border-color:var(--hairline-strong)] focus-visible:focus-ring"
      render={<Link href={`/blocks/${group}/${category.id}`} />}
    >
      <LayerCardPanel className="aspect-video overflow-hidden p-0">
        {cover ? (
          <>
            <img alt="" className={`${COVER} ${cover.darkSrc ? "dark:hidden" : ""}`} loading="lazy" src={cover.src} />
            {cover.darkSrc && <img alt="" className={`${COVER} hidden dark:block`} loading="lazy" src={cover.darkSrc} />}
          </>
        ) : (
          <img alt="" className="h-full w-full object-cover" loading="lazy" src="/placeholder.svg" />
        )}
      </LayerCardPanel>
      <LayerCardFooter className="flex-col items-stretch gap-1 pt-2.5 pb-2">
        <span className="flex items-baseline justify-between gap-4">
          <Heading className="text-sm font-medium tracking-tighter text-foreground">{category.label}</Heading>
          <span className="text-xs">{`${category.items.length} ${category.items.length === 1 ? "block" : "blocks"}`}</span>
        </span>
        <p className="text-sm text-muted-foreground">{category.description}</p>
      </LayerCardFooter>
    </LayerCard>
  );
}
