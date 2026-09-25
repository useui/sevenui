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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";

const trail = [
  { label: "Northwind Handbook", href: "#handbook" },
  {
    label: "Engineering practices and standards",
    href: "#engineering-practices",
  },
  {
    label: "Incident response and on-call rotations",
    href: "#incident-response",
  },
];

const page = "Postmortem template for customer-facing outages";

export default function Breadcrumb06() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Breadcrumb>
        <BreadcrumbList className="flex-nowrap">
          {trail.map((crumb, index) => (
            <Fragment key={crumb.href}>
              <BreadcrumbItem
                className={
                  index < trail.length - 1
                    ? "hidden min-w-0 sm:inline-flex"
                    : "min-w-0"
                }
              >
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <BreadcrumbLink
                        href={crumb.href}
                        className="block max-w-20 truncate rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-32"
                      />
                    }
                  >
                    {crumb.label}
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{crumb.label}</TooltipContent>
                </Tooltip>
              </BreadcrumbItem>
              <BreadcrumbSeparator
                className={
                  index < trail.length - 1 ? "hidden shrink-0 sm:block" : "shrink-0"
                }
              />
            </Fragment>
          ))}
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="truncate font-medium">
              {page}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-col gap-1 border-t border-border pt-3">
        <h2 className="text-lg font-semibold tracking-tight text-balance">
          {page}
        </h2>
        <p className="text-sm text-muted-foreground">
          Owned by Site Reliability · Last reviewed September 4
        </p>
      </div>
    </div>
  );
}
