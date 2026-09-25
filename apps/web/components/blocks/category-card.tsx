import Link from "next/link";
import type { Category } from "../../lib/blocks";

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
    <Link className="group block" href={`/blocks/${group}/${category.id}`}>
      <div className="aspect-video overflow-hidden rounded-xl border border-border bg-muted/30">
        {cover ? (
          <>
            <img
              alt=""
              className={`h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02] ${cover.darkSrc ? "dark:hidden" : ""}`}
              loading="lazy"
              src={cover.src}
            />
            {cover.darkSrc && (
              <img
                alt=""
                className="hidden h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02] dark:block"
                loading="lazy"
                src={cover.darkSrc}
              />
            )}
          </>
        ) : (
          <img alt="" className="h-full w-full object-cover" loading="lazy" src="/placeholder.svg" />
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-4">
        <Heading className="text-sm font-medium tracking-tighter">{category.label}</Heading>
        <span className="text-xs text-muted-foreground">
          {`${category.items.length} ${category.items.length === 1 ? "block" : "blocks"}`}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
    </Link>
  );
}
