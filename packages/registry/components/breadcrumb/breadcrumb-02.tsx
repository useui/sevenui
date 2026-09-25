"use client";

import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/base/ui/breadcrumb";

const trail = [
  { label: "Billing", href: "#billing" },
  { label: "Invoices", href: "#invoices" },
];

const sizes = [
  {
    id: "compact",
    label: "Compact",
    list: "gap-1 text-xs",
    separator: "text-muted-foreground/60",
  },
  {
    id: "default",
    label: "Default",
    list: "gap-1.5 text-sm",
    separator: "text-muted-foreground/60",
  },
  {
    id: "large",
    label: "Large",
    list: "gap-2.5 text-base",
    separator: "text-muted-foreground/60 text-lg",
  },
];

export default function Breadcrumb02() {
  return (
    <div className="flex w-full max-w-md flex-col divide-y divide-border">
      {sizes.map((size) => (
        <div
          key={size.id}
          className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:gap-6"
        >
          <span className="w-16 shrink-0 text-xs font-medium text-muted-foreground">
            {size.label}
          </span>
          <Breadcrumb
            aria-label={`Breadcrumb, ${size.label.toLowerCase()} size`}
          >
            <BreadcrumbList className={size.list}>
              {trail.map((crumb) => (
                <Fragment key={crumb.href}>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href={crumb.href}
                      className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {crumb.label}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className={size.separator}>
                    /
                  </BreadcrumbSeparator>
                </Fragment>
              ))}
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium tabular-nums">
                  INV-2048
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      ))}
    </div>
  );
}
