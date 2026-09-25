"use client";

import { FileText, Folder, House } from "lucide-react";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/base/ui/breadcrumb";

const folders = [
  { label: "Engineering", href: "#engineering" },
  { label: "Runbooks", href: "#runbooks" },
];

export default function Breadcrumb01() {
  return (
    <Breadcrumb className="w-full max-w-md">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            href="#docs"
            className="inline-flex items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <House aria-hidden="true" className="size-4" />
            <span className="sr-only">Docs home</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {folders.map((folder) => (
          <Fragment key={folder.href}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={folder.href}
                className="inline-flex items-center gap-1.5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Folder aria-hidden="true" className="size-4" />
                {folder.label}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Fragment>
        ))}
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="inline-flex items-center gap-1.5 font-medium">
            <FileText aria-hidden="true" className="size-4" />
            Database failover
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
