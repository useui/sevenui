import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Crumb } from "../../lib/docs/nav";
import { Logomark } from "../logomark";

const crumbClass = "-mx-1 inline-flex items-center gap-1.5 rounded-md px-1 py-0.5";

/** The docs trail: small and quiet, sharing its row with the site actions. The first crumb carries the mark. */
export function DocsBreadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="min-w-0 font-medium text-docs-tertiary text-xs tracking-[0.15px]">
      <ol className="m-0 flex list-none flex-wrap items-center gap-1 p-0">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          const mark = index === 0 && <Logomark className="h-3.5 w-auto shrink-0 text-foreground" />;
          return (
            <li aria-current={isLast ? "page" : undefined} className="flex items-center gap-1" key={crumb.href ?? crumb.label}>
              {index > 0 && <ChevronRight aria-hidden="true" className="shrink-0" size={12} />}
              {isLast || !crumb.href ? (
                <span className={`${crumbClass} ${isLast ? "text-muted-foreground" : ""}`}>
                  {mark}
                  {crumb.label}
                </span>
              ) : (
                <Link className={`${crumbClass} transition-colors hover:text-foreground`} href={crumb.href}>
                  {mark}
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
