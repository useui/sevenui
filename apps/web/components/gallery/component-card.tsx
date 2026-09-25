import Link from "next/link";
import type { GalleryComponent, GallerySlug } from "../../lib/gallery";
import { PrimitiveIllustration } from "./illustrations";

export function ComponentCard({ component }: { component: GalleryComponent }) {
  return (
    // The link is stretched over the card, so the whole surface is one target with one accessible name.
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-foreground/25 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-ring">
      <div className="bg-muted/30 px-4 py-3">
        <PrimitiveIllustration
          className="mx-auto aspect-5/3 w-full max-w-80 transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.04]"
          slug={component.slug as GallerySlug}
        />
      </div>
      <div className="flex items-baseline justify-between gap-3 border-t border-border px-4 py-3">
        <h3 className="font-sans text-sm font-medium tracking-normal">
          <Link className="after:absolute after:inset-0 focus-visible:outline-none" href={`/components/${component.slug}`}>
            {component.label}
          </Link>
        </h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {`${component.count} ${component.count === 1 ? "component" : "components"}`}
        </span>
      </div>
    </article>
  );
}
