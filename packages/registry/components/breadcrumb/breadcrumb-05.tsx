"use client";

import { Folder } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/base/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";

const hidden = [
  { label: "Design", href: "#design" },
  { label: "Brand refresh 2026", href: "#brand-refresh" },
  { label: "Exports", href: "#exports" },
];

const linkClassName =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function Breadcrumb05() {
  return (
    <Breadcrumb className="w-full max-w-md">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#acme-files" className={linkClassName}>
            Acme Files
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`Show ${hidden.length} hidden folders`}
              className="flex items-center rounded-md outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-muted data-popup-open:text-foreground"
            >
              <BreadcrumbEllipsis className="size-6" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52">
              {hidden.map((folder, index) => (
                <DropdownMenuItem
                  key={folder.href}
                  render={<a href={folder.href} />}
                  style={{ paddingInlineStart: `${0.375 + index * 0.75}rem` }}
                >
                  <Folder
                    aria-hidden="true"
                    className="text-muted-foreground"
                  />
                  <span className="truncate">{folder.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink
            href="#social"
            className={linkClassName}
          >
            Social
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="font-medium">
            launch-banner-1200x630.png
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
