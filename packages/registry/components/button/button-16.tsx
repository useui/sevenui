"use client";

import { ArrowLeft, ArrowRight, ExternalLink, Pencil } from "lucide-react";

import { buttonVariants } from "@/registry/base/ui/button";

const previous = { title: "Installation", href: "/docs/installation" };
const next = { title: "Theming", href: "/docs/theming" };

export default function Button16() {
  return (
    <nav aria-label="Page navigation" className="flex w-full max-w-lg flex-col gap-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <a
          href={previous.href}
          className={buttonVariants({
            variant: "outline",
            className: "h-auto justify-start gap-3 px-3 py-3",
          })}
        >
          <ArrowLeft aria-hidden="true" className="text-muted-foreground" />
          <span className="flex min-w-0 flex-col items-start gap-0.5">
            <span className="text-xs font-normal text-muted-foreground">
              Previous
            </span>
            <span className="truncate">{previous.title}</span>
          </span>
        </a>
        <a
          href={next.href}
          className={buttonVariants({
            variant: "outline",
            className: "h-auto justify-end gap-3 px-3 py-3",
          })}
        >
          <span className="flex min-w-0 flex-col items-end gap-0.5">
            <span className="text-xs font-normal text-muted-foreground">Next</span>
            <span className="truncate">{next.title}</span>
          </span>
          <ArrowRight aria-hidden="true" className="text-muted-foreground" />
        </a>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t pt-3">
        <p className="text-xs text-muted-foreground">Last updated on Sep 18, 2026</p>
        <a
          href="https://github.com/northwind/docs/edit/main/components.mdx"
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({
            variant: "link",
            size: "sm",
            className: "h-auto px-0 text-muted-foreground hover:text-foreground",
          })}
        >
          <Pencil data-icon="inline-start" aria-hidden="true" />
          Edit this page
          <ExternalLink data-icon="inline-end" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </nav>
  );
}
