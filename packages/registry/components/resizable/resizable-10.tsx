"use client";

import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import * as React from "react";
import { usePanelRef } from "react-resizable-panels";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/registry/base/ui/resizable";

const clauses = [
  {
    id: "term",
    title: "4. Term and renewal",
    body: "This agreement starts on the effective date and renews for successive one-year terms unless either party gives written notice at least 60 days before the end of the current term.",
  },
  {
    id: "fees",
    title: "5. Fees and payment",
    body: "Customer pays the annual subscription fee in advance. Invoices are due within 30 days, and late balances accrue interest at 1% per month.",
  },
  {
    id: "liability",
    title: "9. Limitation of liability",
    body: "Neither party is liable for indirect or consequential damages. Each party's total liability is capped at the fees paid in the twelve months before the claim.",
  },
];

const initialComments = [
  {
    id: "c1",
    author: "Dana Brooks",
    initials: "DB",
    clause: "4. Term and renewal",
    text: "Can we shorten the notice window to 30 days? Procurement flagged 60 as too long.",
  },
  {
    id: "c2",
    author: "Luis Ortega",
    initials: "LO",
    clause: "5. Fees and payment",
    text: "Legal wants net 45 instead of net 30 for enterprise accounts.",
  },
  {
    id: "c3",
    author: "Dana Brooks",
    initials: "DB",
    clause: "9. Limitation of liability",
    text: "Cap looks fine. Confirm it excludes data breach claims.",
  },
];

export default function Resizable10() {
  const dockRef = usePanelRef();
  const [collapsed, setCollapsed] = React.useState(false);
  const [comments, setComments] = React.useState(initialComments);

  function toggleDock() {
    const panel = dockRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) panel.expand();
    else panel.collapse();
  }

  function resolve(id: string) {
    setComments((current) => current.filter((comment) => comment.id !== id));
  }

  return (
    <div className="h-[420px] w-full max-w-xl">
      <ResizablePanelGroup
        orientation="vertical"
        className="rounded-xl border bg-card text-card-foreground"
      >
        <ResizablePanel id="document" defaultSize="58%" minSize="30%">
          <article
            aria-labelledby="resizable-10-title"
            className="flex h-full flex-col gap-3 overflow-y-auto p-5"
          >
            <h3 id="resizable-10-title" className="text-sm font-semibold">
              Master services agreement, Northwind Studio
            </h3>
            {clauses.map((clause) => (
              <section key={clause.id} className="flex flex-col gap-1">
                <h4 className="text-sm font-medium">{clause.title}</h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {clause.body}
                </p>
              </section>
            ))}
          </article>
        </ResizablePanel>
        <ResizableHandle aria-label="Resize comments dock" />
        <ResizablePanel
          id="comments"
          panelRef={dockRef}
          defaultSize="42%"
          minSize="28%"
          maxSize="60%"
          collapsible
          collapsedSize="40px"
          onResize={() => setCollapsed(dockRef.current?.isCollapsed() ?? false)}
        >
          <section
            aria-labelledby="resizable-10-comments"
            className="flex h-full flex-col bg-muted/40"
          >
            <div className="flex h-10 shrink-0 items-center gap-2 pr-1.5 pl-3">
              <MessageSquare
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
              <h4
                id="resizable-10-comments"
                className="text-sm font-medium"
              >
                Comments
              </h4>
              <span
                aria-live="polite"
                className="text-xs text-muted-foreground tabular-nums"
              >
                {comments.length} open
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="ml-auto"
                aria-label={collapsed ? "Expand comments" : "Collapse comments"}
                aria-controls="resizable-10-thread"
                aria-expanded={!collapsed}
                onClick={toggleDock}
              >
                {collapsed ? (
                  <ChevronUp aria-hidden="true" />
                ) : (
                  <ChevronDown aria-hidden="true" />
                )}
              </Button>
            </div>
            <div
              id="resizable-10-thread"
              inert={collapsed}
              className="min-h-0 flex-1 overflow-y-auto border-t"
            >
              {comments.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  All comments resolved. The draft is ready for signature.
                </p>
              ) : (
                <ul className="flex flex-col divide-y">
                  {comments.map((comment) => (
                    <li key={comment.id} className="flex gap-3 px-3 py-2.5">
                      <Avatar className="size-7">
                        <AvatarFallback className="text-[11px]">
                          {comment.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="text-sm font-medium">
                            {comment.author}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            on {comment.clause}
                          </span>
                        </div>
                        <p className="text-sm leading-snug">{comment.text}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 self-start"
                        aria-label={`Resolve comment from ${comment.author}`}
                        onClick={() => resolve(comment.id)}
                      >
                        Resolve
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
