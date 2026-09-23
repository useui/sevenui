import type { Crumb } from "../../lib/docs/nav";
import { Breadcrumb } from "../breadcrumb";

export function DocsBreadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return <Breadcrumb className="mx-auto mb-2 max-w-content text-muted-foreground text-sm" crumbs={crumbs} />;
}
