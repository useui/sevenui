import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getDocIndex } from "../../lib/docs";
import { getPrevNext } from "../../lib/docs/nav";

export async function DocsPagination({ route }: { route: string }) {
  const [{ prev, next }, index] = await Promise.all([getPrevNext(route), getDocIndex()]);

  if (!prev && !next) return null;

  const nextDescription = next && index.find((page) => page.route === next.href)?.description;

  // A compact way back, and a card that says what the next page is about.
  return (
    <nav aria-label="Pagination" className="mt-16 flex max-w-docs items-end justify-between gap-4 max-md:flex-col max-md:items-stretch">
      {prev ? (
        <Link
          className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-[10px] border border-border px-3.5 font-medium text-foreground text-sm transition-colors hover:bg-muted"
          href={prev.href}
        >
          <ArrowLeft aria-hidden="true" size={16} />
          <span className="sr-only">Previous: </span>
          {prev.label}
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          className="ms-auto flex max-w-[22rem] flex-col items-end gap-0.5 rounded-[10px] border border-border bg-muted/60 px-3.5 py-2.5 text-end transition-colors hover:bg-muted max-md:ms-0 max-md:max-w-full"
          href={next.href}
        >
          <span className="inline-flex items-center gap-2 font-medium text-foreground text-sm">
            <span className="sr-only">Next: </span>
            {next.label}
            <ArrowRight aria-hidden="true" size={16} />
          </span>
          {nextDescription && <span className="line-clamp-1 text-docs-tertiary text-xs">{nextDescription}</span>}
        </Link>
      )}
    </nav>
  );
}
