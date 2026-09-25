import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { galleryNeighbors } from "../../lib/gallery";

const CARD =
  "flex max-w-[48%] flex-1 items-center gap-3 rounded-lg border border-border px-4 py-3 text-foreground transition-colors hover:border-foreground max-md:max-w-full";

/** Previous and next primitive in sidebar order, so a page ends on a way forward instead of a dead end. */
export function GalleryPager({ slug }: { slug: string }) {
  const { prev, next } = galleryNeighbors(slug);
  if (!(prev || next)) return null;

  return (
    <nav aria-label="More components" className="flex justify-between gap-4 border-t border-border pt-6 max-md:flex-col">
      {prev ? (
        <Link className={CARD} href={`/components/${prev.slug}`}>
          <ArrowLeft aria-hidden="true" className="shrink-0" size={16} />
          <span className="min-w-0">
            <span className="block text-xs text-muted-foreground">Previous</span>
            <span className="block truncate font-medium">{prev.label}</span>
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link className={`${CARD} ms-auto justify-end text-end`} href={`/components/${next.slug}`}>
          <span className="min-w-0">
            <span className="block text-xs text-muted-foreground">Next</span>
            <span className="block truncate font-medium">{next.label}</span>
          </span>
          <ArrowRight aria-hidden="true" className="shrink-0" size={16} />
        </Link>
      )}
    </nav>
  );
}
