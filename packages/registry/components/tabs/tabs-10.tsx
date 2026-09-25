"use client";

import { FileCode, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/registry/base/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

type Query = { id: string; name: string; sql: string };

const initialQueries: Query[] = [
  {
    id: "revenue",
    name: "revenue-by-region.sql",
    sql: "select region, sum(amount) as revenue\nfrom invoices\nwhere paid_at >= date '2026-07-01'\ngroup by region\norder by revenue desc;",
  },
  {
    id: "active-users",
    name: "weekly-active-users.sql",
    sql: "select date_trunc('week', seen_at) as week,\n       count(distinct user_id) as wau\nfrom sessions\ngroup by 1\norder by 1;",
  },
  {
    id: "churn",
    name: "churn-cohorts.sql",
    sql: "select signup_month, churned, total\nfrom churn_cohorts\nwhere signup_month >= '2026-01';",
  },
];

export default function Tabs10() {
  const [queries, setQueries] = useState(initialQueries);
  const [active, setActive] = useState<string | null>(initialQueries[0].id);
  const nextId = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);
  const [restoreFocus, setRestoreFocus] = useState(false);
  const [revealActive, setRevealActive] = useState(false);

  // A new tab is appended past the right edge of the scrolling tab strip, so
  // scroll the strip (not the page) until the new tab is fully visible.
  useEffect(() => {
    if (!revealActive) return;
    setRevealActive(false);
    const list = listRef.current;
    const tab = list?.querySelector<HTMLElement>(
      '[role="tab"][aria-selected="true"]',
    );
    if (!list || !tab) return;
    const listBox = list.getBoundingClientRect();
    const tabBox = tab.getBoundingClientRect();
    if (tabBox.right > listBox.right) {
      list.scrollLeft += tabBox.right - listBox.right;
    } else if (tabBox.left < listBox.left) {
      list.scrollLeft -= listBox.left - tabBox.left;
    }
  }, [revealActive]);

  // A tab closed from the keyboard leaves focus on a removed node, so hand it
  // to the tab that became active, or to the new-query button when none is left.
  useEffect(() => {
    if (!restoreFocus) return;
    setRestoreFocus(false);
    const next =
      listRef.current?.querySelector<HTMLElement>(
        '[role="tab"][aria-selected="true"]',
      ) ?? document.getElementById("tabs-10-new");
    next?.focus();
  }, [restoreFocus]);

  function closeQuery(id: string) {
    const index = queries.findIndex((query) => query.id === id);
    const remaining = queries.filter((query) => query.id !== id);
    setQueries(remaining);
    if (active === id) {
      const neighbor = remaining[Math.min(index, remaining.length - 1)];
      setActive(neighbor?.id ?? null);
    }
  }

  function addQuery() {
    const number = nextId.current++;
    const query = {
      id: `untitled-${number}`,
      name: `untitled-${number}.sql`,
      sql: "-- Write a query against the analytics warehouse\nselect 1;",
    };
    setQueries((current) => [...current, query]);
    setActive(query.id);
    setRevealActive(true);
  }

  return (
    <div className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card text-card-foreground">
      <Tabs
        value={active}
        onValueChange={(value) => setActive(String(value))}
        className="gap-0"
      >
        <div className="flex items-stretch border-b border-border bg-muted/50">
          <TabsList
            ref={listRef}
            aria-label="Open queries"
            className="relative min-w-0 flex-1 justify-start gap-0 overflow-x-auto rounded-none bg-transparent p-0 group-data-[orientation=horizontal]/tabs:h-10"
          >
            {queries.map((query) => (
              <div
                key={query.id}
                role="presentation"
                className="group/tab relative flex h-full shrink-0 items-center border-r border-border has-data-active:bg-card"
              >
                <TabsTrigger
                  value={query.id}
                  aria-keyshortcuts="Delete"
                  onKeyDown={(event) => {
                    if (event.key === "Delete") {
                      closeQuery(query.id);
                      setRestoreFocus(true);
                    }
                  }}
                  className="h-full rounded-none border-0 pr-8 pl-3 font-mono text-xs data-active:bg-transparent data-active:shadow-none dark:data-active:bg-transparent"
                >
                  <FileCode className="size-3.5" aria-hidden="true" />
                  {query.name}
                </TabsTrigger>
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={`Close ${query.name}`}
                  onClick={() => closeQuery(query.id)}
                  className="absolute right-1.5 flex size-5 items-center justify-center rounded-sm text-muted-foreground opacity-0 transition-opacity group-hover/tab:opacity-100 group-has-data-active/tab:opacity-100 hover:bg-accent hover:text-foreground focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </div>
            ))}
          </TabsList>
          <Button
            variant="ghost"
            size="icon-sm"
            id="tabs-10-new"
            aria-label="New query"
            onClick={addQuery}
            className="m-1.5 shrink-0"
          >
            <Plus aria-hidden="true" />
          </Button>
        </div>
        {queries.map((query) => (
          <TabsContent key={query.id} value={query.id} className="p-4">
            <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs leading-relaxed text-foreground">
              <code>{query.sql}</code>
            </pre>
            <p className="mt-2 text-xs text-muted-foreground">
              Press Delete on a focused tab to close it.
            </p>
          </TabsContent>
        ))}
        {queries.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
            <p className="text-sm font-medium">No open queries</p>
            <p className="text-xs text-muted-foreground">
              Open a new tab to start writing SQL.
            </p>
            <Button size="sm" onClick={addQuery}>
              <Plus aria-hidden="true" />
              New query
            </Button>
          </div>
        )}
      </Tabs>
    </div>
  );
}
