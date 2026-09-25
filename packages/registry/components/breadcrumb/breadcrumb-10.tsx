"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import * as React from "react";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/base/ui/breadcrumb";
import { Button } from "@/registry/base/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";

const trail = [
  { label: "Help Center", href: "#help-center" },
  { label: "Billing & plans", href: "#billing-and-plans" },
  { label: "Invoices", href: "#invoices" },
];

export default function Breadcrumb10() {
  const [vote, setVote] = React.useState<"yes" | "no" | null>(null);
  const [first, ...middle] = trail;

  return (
    <article className="@container w-full max-w-xl">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href={first.href}
              className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {first.label}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />

          {/* Narrow containers fold the middle levels into a menu. */}
          <BreadcrumbItem className="@md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Show parent sections"
                className="rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <BreadcrumbEllipsis />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-44">
                {middle.map((item) => (
                  <DropdownMenuItem
                    key={item.label}
                    render={<a href={item.href} />}
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="@md:hidden" />

          {middle.map((item) => (
            <React.Fragment key={item.label}>
              <BreadcrumbItem className="hidden @md:inline-flex">
                <BreadcrumbLink
                  href={item.href}
                  className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.label}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden @md:block" />
            </React.Fragment>
          ))}

          <BreadcrumbItem>
            <BreadcrumbPage>Download past invoices</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className="mt-4 text-xl font-semibold tracking-tight text-balance">
        Download past invoices
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Updated September 12 · 3 min read
      </p>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
        <p>
          Workspace owners and billing admins can download any invoice from the
          last seven years. Open{" "}
          <span className="font-medium text-foreground">
            Settings → Billing
          </span>
          , scroll to Invoice history, and choose PDF or CSV next to the month
          you need.
        </p>
        <p>
          Need a company address or VAT ID on the document? Add it under Billing
          details first; invoices regenerate within a few minutes.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t pt-4">
        {vote ? (
          <p className="text-sm text-muted-foreground" role="status">
            {vote === "yes"
              ? "Thanks for the feedback."
              : "Thanks. We'll use this to improve the article."}
          </p>
        ) : (
          <>
            <span className="text-sm font-medium">
              Was this article helpful?
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVote("yes")}
              >
                <ThumbsUp aria-hidden="true" />
                Yes
              </Button>
              <Button variant="outline" size="sm" onClick={() => setVote("no")}>
                <ThumbsDown aria-hidden="true" />
                No
              </Button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
