"use client";

import { cn } from "cn";
import { BookOpen, Braces, Terminal } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/registry/base/ui/navigation-menu";

const endpoints = [
  { method: "GET", path: "/v2/invoices", label: "List invoices" },
  { method: "POST", path: "/v2/invoices", label: "Create an invoice" },
  { method: "PATCH", path: "/v2/customers/:id", label: "Update a customer" },
  { method: "DELETE", path: "/v2/webhooks/:id", label: "Remove a webhook" },
];

const sdks = [
  { name: "Node.js", install: "npm i @ledgerly/node", version: "v5.3.0" },
  { name: "Python", install: "pip install ledgerly", version: "v4.8.1" },
  { name: "Go", install: "go get ledgerly.dev/go", version: "v2.1.0" },
];

const anchor = (value: string) =>
  `#${value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;

const methodStyles: Record<string, string> = {
  GET: "bg-chart-2/15 text-chart-2",
  POST: "bg-chart-1/15 text-chart-1",
  PATCH: "bg-chart-4/15 text-chart-4",
  DELETE: "bg-destructive/10 text-destructive",
};

export default function NavigationMenu09() {
  return (
    <header className="flex w-full max-w-2xl flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border bg-card px-3 py-2 text-card-foreground">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">Ledgerly Docs</span>
        <Badge variant="outline" className="font-mono">
          API 2026-09
        </Badge>
      </div>
      <NavigationMenu
        aria-label="Developer documentation"
        align="end"
        className="flex-none"
      >
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              <Braces className="mr-1.5 size-4" aria-hidden="true" />
              API
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="w-72 p-1 sm:w-80">
                <ul className="grid gap-0.5">
                  {endpoints.map((endpoint) => (
                    <li key={`${endpoint.method} ${endpoint.path}`}>
                      <NavigationMenuLink
                        closeOnClick
                        href={anchor(`${endpoint.method} ${endpoint.path}`)}
                        className="items-start gap-3"
                      >
                        <span
                          className={cn(
                            "mt-0.5 w-14 shrink-0 rounded px-1.5 py-0.5 text-center font-mono text-[0.65rem] font-semibold",
                            methodStyles[endpoint.method],
                          )}
                        >
                          {endpoint.method}
                        </span>
                        <span className="flex min-w-0 flex-col">
                          <span className="font-medium">{endpoint.label}</span>
                          <code className="truncate font-mono text-xs text-muted-foreground">
                            {endpoint.path}
                          </code>
                        </span>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
                <div className="mt-1 border-t pt-1">
                  <NavigationMenuLink
                    closeOnClick
                    href="#reference"
                    className="justify-center text-xs text-muted-foreground"
                  >
                    View all 64 endpoints
                  </NavigationMenuLink>
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              <Terminal className="mr-1.5 size-4" aria-hidden="true" />
              SDKs
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-72 gap-0.5 p-1">
                {sdks.map((sdk) => (
                  <li key={sdk.name}>
                    <NavigationMenuLink
                      closeOnClick
                      href={`#sdk-${sdk.name.toLowerCase()}`}
                      className="flex-col items-stretch gap-1"
                    >
                      <span className="flex items-center justify-between">
                        <span className="font-medium">{sdk.name}</span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {sdk.version}
                        </span>
                      </span>
                      <code className="truncate rounded bg-muted px-1.5 py-1 font-mono text-xs">
                        {sdk.install}
                      </code>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem className="hidden sm:block">
            <NavigationMenuTrigger>
              <BookOpen className="mr-1.5 size-4" aria-hidden="true" />
              Guides
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-64 gap-0.5 p-1">
                <li>
                  <NavigationMenuLink closeOnClick href="#quickstart" className="flex-col items-start gap-0.5">
                    <span className="font-medium">Quickstart</span>
                    <span className="text-xs text-muted-foreground">
                      Send your first invoice in five minutes.
                    </span>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink closeOnClick href="#webhooks" className="flex-col items-start gap-0.5">
                    <span className="font-medium">Verifying webhooks</span>
                    <span className="text-xs text-muted-foreground">
                      Check signatures before trusting an event.
                    </span>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink closeOnClick href="#idempotency" className="flex-col items-start gap-0.5">
                    <span className="font-medium">Idempotent retries</span>
                    <span className="text-xs text-muted-foreground">
                      Retry safely with an Idempotency-Key header.
                    </span>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
}
