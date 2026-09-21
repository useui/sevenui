"use client";

import { usePathname } from "next/navigation";
import type { Crumb } from "../../lib/docs/nav";
import { Breadcrumb } from "../breadcrumb";

export function DocsBreadcrumb({ crumbsByRoute }: { crumbsByRoute: Record<string, Crumb[]> }) {
  const pathname = usePathname();

  return (
    <Breadcrumb
      className="mx-auto mb-2 max-w-content text-muted-foreground text-sm"
      crumbs={crumbsByRoute[pathname] ?? []}
    />
  );
}
