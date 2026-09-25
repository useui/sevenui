"use client";

import * as React from "react";
import { cn } from "cn";
import { ChartLine, FileChartColumn, Star } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/registry/base/ui/navigation-menu";

const pages = [
  { id: "overview", label: "Overview" },
  { id: "funnels", label: "Funnels" },
];

const reports = [
  {
    id: "weekly-revenue",
    label: "Weekly revenue",
    meta: "Updated 2 hours ago",
    starred: true,
  },
  {
    id: "trial-conversion",
    label: "Trial to paid conversion",
    meta: "Updated yesterday",
    starred: true,
  },
  {
    id: "churn-by-plan",
    label: "Churn by plan",
    meta: "Updated Sep 18",
    starred: false,
  },
];

const summaries: Record<string, string> = {
  overview: "Sessions, signups, and revenue for the last 30 days.",
  funnels: "Step-by-step drop-off from landing page to first payment.",
  "weekly-revenue": "Net revenue grouped by week, compared with last quarter.",
  "trial-conversion": "Share of trials that upgraded within 14 days.",
  "churn-by-plan": "Monthly cancellations split by Starter, Team, and Scale.",
};

export default function NavigationMenu08() {
  const [current, setCurrent] = React.useState("overview");
  const report = reports.find((item) => item.id === current);
  const title = report?.label ?? pages.find((p) => p.id === current)?.label;

  function go(id: string) {
    return (event: React.MouseEvent) => {
      event.preventDefault();
      setCurrent(id);
    };
  }

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-xl border bg-card text-card-foreground">
      <header className="flex items-center gap-2 border-b px-3 py-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <ChartLine className="size-4" aria-hidden="true" />
        </span>
        <NavigationMenu aria-label="Analytics">
          <NavigationMenuList className="gap-0.5">
            {pages.map((page) => (
              <NavigationMenuItem key={page.id}>
                <NavigationMenuLink
                  href={`#${page.id}`}
                  active={current === page.id}
                  aria-current={current === page.id ? "page" : undefined}
                  onClick={go(page.id)}
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "data-active:bg-muted data-active:text-foreground",
                  )}
                >
                  {page.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={cn(report && "bg-muted text-foreground")}
              >
                Reports
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-64 p-1">
                  <p className="px-2 pt-1 pb-2 text-xs font-medium text-muted-foreground">
                    Saved reports
                  </p>
                  <ul className="grid gap-0.5">
                    {reports.map((item) => (
                      <li key={item.id}>
                        <NavigationMenuLink
                          href={`#${item.id}`}
                          active={current === item.id}
                          aria-current={current === item.id ? "page" : undefined}
                          closeOnClick
                          onClick={go(item.id)}
                          className="items-start"
                        >
                          <FileChartColumn
                            className="mt-0.5 text-muted-foreground"
                            aria-hidden="true"
                          />
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate font-medium">
                              {item.label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {item.meta}
                            </span>
                          </span>
                          {item.starred ? (
                            <>
                              <Star
                                className="mt-0.5 size-3.5 fill-current text-warning"
                                aria-hidden="true"
                              />
                              <span className="sr-only">Starred</span>
                            </>
                          ) : null}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </header>
      <div className="flex flex-col gap-1 p-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{summaries[current]}</p>
      </div>
    </div>
  );
}
