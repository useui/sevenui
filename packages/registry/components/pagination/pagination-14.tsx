"use client";

import * as React from "react";
import { ArrowUpToLineIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/registry/base/ui/pagination";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

// Newest first. A real API would hand back `next_cursor` instead of offsets,
// so the UI never shows a total page count.
const requests = [
  { id: "req_9f2a", method: "POST", path: "/v1/charges", status: 201, ms: 182, time: "14:02:51" },
  { id: "req_9f29", method: "GET", path: "/v1/customers/cus_48Q", status: 200, ms: 41, time: "14:02:48" },
  { id: "req_9f28", method: "POST", path: "/v1/refunds", status: 402, ms: 96, time: "14:02:30" },
  { id: "req_9f27", method: "GET", path: "/v1/invoices?limit=20", status: 200, ms: 64, time: "14:02:12" },
  { id: "req_9f26", method: "DELETE", path: "/v1/webhooks/wh_12", status: 204, ms: 58, time: "14:01:57" },
  { id: "req_9f25", method: "POST", path: "/v1/charges", status: 500, ms: 1204, time: "14:01:40" },
  { id: "req_9f24", method: "PATCH", path: "/v1/customers/cus_48Q", status: 200, ms: 77, time: "14:01:22" },
  { id: "req_9f23", method: "GET", path: "/v1/balance", status: 401, ms: 12, time: "14:01:05" },
  { id: "req_9f22", method: "POST", path: "/v1/payment_intents", status: 200, ms: 211, time: "14:00:49" },
  { id: "req_9f21", method: "GET", path: "/v1/charges/ch_3Nx", status: 404, ms: 18, time: "14:00:31" },
  { id: "req_9f20", method: "POST", path: "/v1/subscriptions", status: 201, ms: 305, time: "14:00:14" },
  { id: "req_9f1f", method: "GET", path: "/v1/events?type=charge", status: 200, ms: 88, time: "13:59:58" },
  { id: "req_9f1e", method: "POST", path: "/v1/charges", status: 429, ms: 9, time: "13:59:41" },
  { id: "req_9f1d", method: "GET", path: "/v1/products", status: 200, ms: 52, time: "13:59:20" },
  { id: "req_9f1c", method: "POST", path: "/v1/refunds", status: 200, ms: 140, time: "13:59:02" },
  { id: "req_9f1b", method: "GET", path: "/v1/prices", status: 503, ms: 3001, time: "13:58:44" },
];

const filters = [
  { value: "all", label: "All" },
  { value: "success", label: "2xx" },
  { value: "client", label: "4xx" },
  { value: "server", label: "5xx" },
];

const PAGE_SIZE = 5;

function matches(filter: string, status: number) {
  if (filter === "success") return status < 300;
  if (filter === "client") return status >= 400 && status < 500;
  if (filter === "server") return status >= 500;
  return true;
}

function statusClass(status: number) {
  if (status >= 500) return "bg-destructive/10 text-destructive";
  if (status >= 400) return "bg-warning/20 text-foreground";
  return "bg-success/15 text-foreground";
}

export default function Pagination14() {
  const [filter, setFilter] = React.useState("all");
  // Stack of cursors: the last entry is where the current page starts.
  const [cursors, setCursors] = React.useState<number[]>([0]);

  const results = requests.filter((request) => matches(filter, request.status));
  const cursor = cursors[cursors.length - 1];
  const visible = results.slice(cursor, cursor + PAGE_SIZE);
  const hasNewer = cursors.length > 1;
  const hasOlder = cursor + PAGE_SIZE < results.length;

  function newer(event: React.MouseEvent) {
    event.preventDefault();
    if (hasNewer) setCursors((stack) => stack.slice(0, -1));
  }

  function older(event: React.MouseEvent) {
    event.preventDefault();
    if (hasOlder) setCursors((stack) => [...stack, cursor + PAGE_SIZE]);
  }

  return (
    <section
      aria-labelledby="request-log-title"
      className="w-full max-w-2xl rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <h2 id="request-log-title" className="font-medium">
            API requests
          </h2>
          <p className="text-sm text-muted-foreground">
            Live mode · <span className="font-mono text-xs">sk_live_…4f2c</span>
          </p>
        </div>
        <ToggleGroup
          aria-label="Filter by status"
          variant="outline"
          size="sm"
          spacing={0}
          value={[filter]}
          onValueChange={(next) => {
            if (next.length > 0) {
              setFilter(next[0]);
              setCursors([0]);
            }
          }}
        >
          {filters.map((item) => (
            <ToggleGroupItem
              key={item.value}
              value={item.value}
              className="font-mono text-xs aria-pressed:bg-accent aria-pressed:text-accent-foreground"
            >
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </header>

      {visible.length > 0 ? (
        <ul className="divide-y font-mono text-xs">
          {visible.map((request) => (
            <li
              key={request.id}
              className="grid grid-cols-[3rem_1fr_auto] items-center gap-x-3 px-4 py-2.5 sm:grid-cols-[3rem_4rem_1fr_auto_auto]"
            >
              <span
                className={`rounded px-1.5 py-0.5 text-center font-medium tabular-nums ${statusClass(request.status)}`}
              >
                {request.status}
              </span>
              <span className="hidden text-muted-foreground sm:block">
                {request.method}
              </span>
              <span className="truncate">
                <span className="text-muted-foreground sm:hidden">
                  {request.method}{" "}
                </span>
                {request.path}
              </span>
              <span className="hidden text-right text-muted-foreground tabular-nums sm:block">
                {request.ms} ms
              </span>
              <time className="text-right text-muted-foreground tabular-nums">
                {request.time}
              </time>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          No requests with this status in the last hour.
        </p>
      )}

      <footer className="flex items-center justify-between gap-2 border-t px-2 py-2">
        {hasNewer ? (
          <Button variant="ghost" size="sm" onClick={() => setCursors([0])}>
            <ArrowUpToLineIcon aria-hidden="true" data-icon="inline-start" />
            Latest
          </Button>
        ) : (
          <p className="pl-2 text-xs text-muted-foreground">
            Showing newest requests
          </p>
        )}
        <Pagination aria-label="Request log pages" className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                text="Newer"
                aria-label="Newer requests"
                aria-disabled={!hasNewer}
                tabIndex={hasNewer ? undefined : -1}
                className={hasNewer ? "" : "pointer-events-none opacity-50"}
                onClick={newer}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                text="Older"
                aria-label="Older requests"
                aria-disabled={!hasOlder}
                tabIndex={hasOlder ? undefined : -1}
                className={hasOlder ? "" : "pointer-events-none opacity-50"}
                onClick={older}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </footer>
    </section>
  );
}
