"use client";

import { CircleAlert } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/registry/base/ui/button";
import { Skeleton } from "@/registry/base/ui/skeleton";
import { Spinner } from "@/registry/base/ui/spinner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

type Status = "idle" | "loading" | "error" | "ready";
type TabValue = "activity" | "invoices" | "usage";

const tabs: { value: TabValue; label: string }[] = [
  { value: "activity", label: "Activity" },
  { value: "invoices", label: "Invoices" },
  { value: "usage", label: "Usage" },
];

const activity = [
  { event: "Upgraded to the Team plan", time: "2h ago" },
  { event: "Added 3 seats", time: "Yesterday" },
  { event: "Updated billing email", time: "Sep 19" },
];

const invoices = [
  { id: "INV-2041", amount: "$144.00", status: "Paid" },
  { id: "INV-1987", amount: "$96.00", status: "Paid" },
];

const usage = [
  { label: "API requests", value: "84,210 / 100,000" },
  { label: "Storage", value: "12.4 GB / 50 GB" },
];

const LOAD_DELAY = 900;

export default function Tabs08() {
  const [active, setActive] = useState<TabValue>("activity");
  const [status, setStatus] = useState<Record<TabValue, Status>>({
    activity: "loading",
    invoices: "idle",
    usage: "idle",
  });
  const timers = useRef(new Map<TabValue, ReturnType<typeof setTimeout>>());
  const invoiceAttempts = useRef(0);

  const load = useCallback((tab: TabValue) => {
    setStatus((current) => ({ ...current, [tab]: "loading" }));
    clearTimeout(timers.current.get(tab));
    timers.current.set(
      tab,
      setTimeout(() => {
        // The first invoices request fails so the error state is visible.
        const failed = tab === "invoices" && invoiceAttempts.current++ === 0;
        setStatus((current) => ({
          ...current,
          [tab]: failed ? "error" : "ready",
        }));
      }, LOAD_DELAY),
    );
  }, []);

  useEffect(() => {
    const pending = timers.current;
    load("activity");
    return () => {
      for (const timer of pending.values()) clearTimeout(timer);
    };
  }, [load]);

  function handleChange(value: unknown) {
    const tab = value as TabValue;
    setActive(tab);
    if (status[tab] === "idle") load(tab);
  }

  return (
    <Tabs
      value={active}
      onValueChange={handleChange}
      className="w-full max-w-md gap-3"
    >
      <TabsList className="w-full">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="flex-1">
            {tab.label}
            {status[tab.value] === "loading" && (
              <Spinner
                aria-hidden="true"
                className="size-3.5 text-muted-foreground"
              />
            )}
            {status[tab.value] === "error" && (
              <CircleAlert
                role="img"
                aria-label="Failed to load"
                className="size-3.5 text-destructive"
              />
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          aria-busy={status[tab.value] === "loading"}
          className="min-h-36 rounded-lg border border-border p-3"
        >
          {status[tab.value] === "loading" || status[tab.value] === "idle" ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : status[tab.value] === "error" ? (
            <div
              role="alert"
              className="flex min-h-30 flex-col items-center justify-center gap-2 text-center"
            >
              <p className="text-sm font-medium">Couldn't load invoices</p>
              <p className="text-xs text-muted-foreground">
                The billing service timed out. Your data is safe.
              </p>
              <Button size="sm" variant="outline" onClick={() => load(tab.value)}>
                Try again
              </Button>
            </div>
          ) : (
            <PanelContent tab={tab.value} />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}

function PanelContent({ tab }: { tab: TabValue }) {
  if (tab === "activity") {
    return (
      <ul className="space-y-2">
        {activity.map((item) => (
          <li key={item.event} className="flex justify-between gap-3 text-sm">
            <span>{item.event}</span>
            <span className="shrink-0 text-muted-foreground">{item.time}</span>
          </li>
        ))}
      </ul>
    );
  }
  if (tab === "invoices") {
    return (
      <ul className="space-y-2">
        {invoices.map((invoice) => (
          <li key={invoice.id} className="flex justify-between gap-3 text-sm">
            <span className="font-medium">{invoice.id}</span>
            <span className="text-muted-foreground tabular-nums">
              {invoice.amount} · {invoice.status}
            </span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <dl className="space-y-2">
      {usage.map((item) => (
        <div key={item.label} className="flex justify-between gap-3 text-sm">
          <dt>{item.label}</dt>
          <dd className="text-muted-foreground tabular-nums">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
