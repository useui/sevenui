"use client";

import { ArrowLeft } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/base/ui/breadcrumb";
import { Button } from "@/registry/base/ui/button";
import { Separator } from "@/registry/base/ui/separator";

export default function Breadcrumb04() {
  return (
    <div className="flex w-full max-w-lg items-center gap-2 rounded-lg border border-border bg-card p-1.5 pr-3 text-card-foreground shadow-xs">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Back to Campaigns"
        nativeButton={false}
        render={<a href="#campaigns" />}
        className="shrink-0"
      >
        <ArrowLeft aria-hidden="true" className="cn-rtl-flip" />
      </Button>
      <Separator orientation="vertical" className="my-1" />
      <Breadcrumb className="min-w-0 flex-1 pl-1">
        <BreadcrumbList className="flex-nowrap">
          <BreadcrumbItem className="hidden sm:inline-flex">
            <BreadcrumbLink
              href="#marketing"
              className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Marketing
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden shrink-0 sm:block" />
          <BreadcrumbItem className="shrink-0 whitespace-nowrap">
            <BreadcrumbLink
              href="#campaigns"
              className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Campaigns
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="shrink-0" />
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="truncate font-medium">
              Autumn launch newsletter
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Badge variant="secondary" className="shrink-0">
        Draft
      </Badge>
    </div>
  );
}
