import type { ReactNode } from "react";
import type { Crumb } from "../../lib/docs/nav";
import { DocsBreadcrumb } from "../docs/breadcrumb";

/** The breadcrumb row every shell page opens with. */
export function ShellTopline({ crumbs, className = "" }: { crumbs: Crumb[]; className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <DocsBreadcrumb crumbs={crumbs} />
    </div>
  );
}

/** A shell page's opening: breadcrumb row, a 24px title, a 16px description, then any page controls. */
export function PageIntro({
  children,
  crumbs,
  description,
  title,
}: {
  children?: ReactNode;
  crumbs: Crumb[];
  description: ReactNode;
  title: ReactNode;
}) {
  return (
    <header>
      <ShellTopline crumbs={crumbs} />
      <h1 className="mt-6 mb-0 font-display font-medium text-2xl text-foreground leading-[34px] tracking-normal text-balance">
        {title}
      </h1>
      <p className="mt-3 mb-0 max-w-docs font-medium text-base text-muted-foreground leading-[22px] text-pretty">
        {description}
      </p>
      {children && <div className="mt-6 flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}
