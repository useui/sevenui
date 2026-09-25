"use client";

import * as React from "react";
import { cn } from "cn";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/registry/base/ui/pagination";

const tips = [
  {
    title: "Invite your team",
    body: "Add teammates from Settings → Members. Everyone you invite joins the workspace as an editor until you change their role.",
  },
  {
    title: "Connect a data source",
    body: "Link Postgres, BigQuery, or a CSV upload. Schemas sync every 15 minutes, and you can trigger a manual refresh any time.",
  },
  {
    title: "Pin your first dashboard",
    body: "Pinned dashboards open on launch for the whole team, so the numbers everyone checks each morning are one click away.",
  },
  {
    title: "Set up alerts",
    body: "Get a Slack or email message when a metric crosses a threshold. Alerts evaluate on every sync, not once a day.",
  },
];

export default function Pagination05() {
  const [index, setIndex] = React.useState(0);
  const tip = tips[index];
  const isFirst = index === 0;
  const isLast = index === tips.length - 1;

  function go(event: React.MouseEvent<HTMLAnchorElement>, next: number) {
    event.preventDefault();
    setIndex(Math.min(tips.length - 1, Math.max(0, next)));
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardDescription className="tabular-nums">
          Tip {index + 1} of {tips.length}
        </CardDescription>
        <CardTitle aria-live="polite">{tip.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="min-h-15 text-sm text-pretty text-muted-foreground">
          {tip.body}
        </p>
      </CardContent>
      <CardFooter>
        <Pagination aria-label="Getting started tips">
          <PaginationContent className="w-full justify-between">
            <PaginationItem>
              <PaginationLink
                href={`#tip-${index}`}
                aria-label="Previous tip"
                aria-disabled={isFirst || undefined}
                tabIndex={isFirst ? -1 : undefined}
                className={cn(isFirst && "pointer-events-none opacity-40")}
                onClick={(event) => go(event, index - 1)}
              >
                <ArrowLeftIcon aria-hidden="true" className="cn-rtl-flip" />
              </PaginationLink>
            </PaginationItem>
            <li className="flex items-center">
              <ul className="flex items-center">
                {tips.map((item, dot) => (
                  <PaginationItem key={item.title}>
                    {/* A 24px hit area wraps the small visual dot, which
                        stretches into a pill for the current tip. */}
                    <PaginationLink
                      href={`#tip-${dot + 1}`}
                      size="xs"
                      aria-label={`Tip ${dot + 1}: ${item.title}`}
                      isActive={dot === index}
                      className="group/dot min-w-6 border-transparent bg-transparent px-1 hover:bg-transparent dark:border-transparent dark:bg-transparent dark:hover:bg-transparent"
                      onClick={(event) => go(event, dot)}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "block h-1.5 rounded-full transition-[width,background-color] duration-300 ease-out motion-reduce:transition-none",
                          dot === index
                            ? "w-5 bg-primary"
                            : "w-1.5 bg-muted-foreground/30 group-hover/dot:bg-muted-foreground/60",
                        )}
                      />
                    </PaginationLink>
                  </PaginationItem>
                ))}
              </ul>
            </li>
            <PaginationItem>
              <PaginationLink
                href={`#tip-${index + 2}`}
                aria-label="Next tip"
                aria-disabled={isLast || undefined}
                tabIndex={isLast ? -1 : undefined}
                className={cn(isLast && "pointer-events-none opacity-40")}
                onClick={(event) => go(event, index + 1)}
              >
                <ArrowRightIcon aria-hidden="true" className="cn-rtl-flip" />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  );
}
