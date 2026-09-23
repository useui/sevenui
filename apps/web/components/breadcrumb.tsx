import Link from "next/link";
import type { Crumb } from "../lib/docs/nav";

export type { Crumb };

export function Breadcrumb({ className, crumbs }: { className: string; crumbs: Crumb[] }) {
  if (crumbs.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="m-0 flex list-none flex-wrap items-center p-0">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li
              aria-current={isLast ? "page" : undefined}
              className="flex items-center"
              key={crumb.href ?? crumb.label}
            >
              {index > 0 && (
                <span aria-hidden="true" className="mx-1.5">
                  /
                </span>
              )}
              {isLast || !crumb.href ? (
                <span className={isLast ? "text-foreground" : undefined}>{crumb.label}</span>
              ) : (
                <Link className="hover:text-foreground hover:underline" href={crumb.href}>
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
