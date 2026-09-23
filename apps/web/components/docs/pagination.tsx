import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getPrevNext } from "../../lib/docs/nav";

export async function DocsPagination({ route }: { route: string }) {
  const { prev, next } = await getPrevNext(route);

  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Pagination"
      className="mx-auto mt-12 flex max-w-content justify-between gap-4 border-border border-t pt-6 max-md:flex-col"
    >
      {prev ? (
        <Link
          className="flex max-w-[48%] flex-1 items-center gap-2 rounded-lg border border-border px-4 py-3 text-foreground transition-colors hover:border-foreground max-md:max-w-full"
          href={prev.href}
        >
          <ArrowLeft aria-hidden="true" size={16} />
          <span className="min-w-0">
            <span className="block text-muted-foreground text-xs max-md:hidden">Previous</span>
            <span className="block truncate font-medium">{prev.label}</span>
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          className="ms-auto flex max-w-[48%] flex-1 items-center justify-end gap-2 rounded-lg border border-border px-4 py-3 text-end text-foreground transition-colors hover:border-foreground max-md:max-w-full"
          href={next.href}
        >
          <span className="min-w-0">
            <span className="block text-muted-foreground text-xs max-md:hidden">Next</span>
            <span className="block truncate font-medium">{next.label}</span>
          </span>
          <ArrowRight aria-hidden="true" size={16} />
        </Link>
      )}
    </nav>
  );
}
