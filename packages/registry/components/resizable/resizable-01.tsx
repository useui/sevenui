"use client";

import * as React from "react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/registry/base/ui/resizable";

const sections: { id: string; title: string; intro: string; detail: React.ReactNode }[] = [
  {
    id: "overview",
    title: "Overview",
    intro:
      "The API is organized around REST. It accepts JSON request bodies, returns JSON responses, and uses standard HTTP status codes.",
    detail:
      "All requests go to a single versioned base URL, so upgrading is an explicit change on your side.",
  },
  {
    id: "authentication",
    title: "Authentication",
    intro:
      "Every request needs a secret key in the Authorization header. Keys are scoped to a workspace and can be rotated from the dashboard at any time without downtime.",
    detail:
      <>
        Use test keys while you build. They never touch live data and start
        with the{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">
          sk_test_
        </code>{" "}
        prefix.
      </>,
  },
  {
    id: "rate-limits",
    title: "Rate limits",
    intro:
      "Each key can make 100 read and 25 write requests per second. Bursts above that return a 429 response.",
    detail:
      "Retry after the number of seconds in the Retry-After header, with exponential backoff.",
  },
  {
    id: "webhooks",
    title: "Webhooks",
    intro:
      "Webhooks notify your server when events happen in your workspace, such as a paid invoice or a failed charge.",
    detail:
      "Verify every delivery with the signing secret before you trust its payload.",
  },
  {
    id: "errors",
    title: "Errors",
    intro:
      "Codes in the 4xx range mean the request was wrong, and the body explains which field to fix.",
    detail:
      "Codes in the 5xx range are rare and safe to retry with the same idempotency key.",
  },
];

export default function Resizable01() {
  const [activeId, setActiveId] = React.useState("authentication");
  const active =
    sections.find((section) => section.id === activeId) ?? sections[0];

  return (
    <div className="h-72 w-full max-w-xl">
      <ResizablePanelGroup className="rounded-lg border bg-background">
        <ResizablePanel id="outline" defaultSize="32%" minSize="24%">
          <nav aria-label="API guide" className="flex h-full flex-col p-3">
            <span className="px-2 pb-2 text-xs font-medium text-muted-foreground">
              API guide
            </span>
            <ul className="flex flex-col gap-0.5">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    aria-current={section.id === activeId ? "page" : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      setActiveId(section.id);
                    }}
                    className="block truncate rounded-md px-2 py-1.5 text-sm text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-muted aria-[current=page]:font-medium aria-[current=page]:text-foreground"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </ResizablePanel>
        <ResizableHandle withHandle aria-label="Resize guide outline" />
        <ResizablePanel id="article" defaultSize="68%" minSize="40%">
          <article className="flex h-full flex-col gap-2 overflow-hidden p-5">
            <h3 className="text-base font-semibold">{active.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {active.intro}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {active.detail}
            </p>
          </article>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
