"use client";

import { ChevronRight } from "lucide-react";
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
  { label: "Store", href: "#store" },
  { label: "Audio", href: "#audio" },
  { label: "Headphones", href: "#headphones" },
];

export default function Breadcrumb03() {
  return (
    <Breadcrumb className="w-full max-w-md">
      <BreadcrumbList className="gap-1">
        {trail.map((crumb) => (
          <Fragment key={crumb.href}>
            <BreadcrumbItem>
              <BreadcrumbLink
                href={crumb.href}
                className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                {crumb.label}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-muted-foreground/50 [&>svg]:size-3">
              <ChevronRight className="cn-rtl-flip" />
            </BreadcrumbSeparator>
          </Fragment>
        ))}
        <BreadcrumbItem>
          <BreadcrumbPage className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
            Studio Wireless Pro
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
