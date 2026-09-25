"use client";

import * as React from "react";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/registry/base/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/base/ui/table";

const events = [
  {
    id: "evt_9f21",
    actor: "Maya Thompson",
    action: "member.role_updated",
    target: "Daniel Reyes → Admin",
    time: "2026-09-25T09:42:00Z",
  },
  {
    id: "evt_9f20",
    actor: "Daniel Reyes",
    action: "api_key.created",
    target: "CI pipeline",
    time: "2026-09-25T09:15:00Z",
  },
  {
    id: "evt_9f1f",
    actor: "System",
    action: "invoice.paid",
    target: "INV-2026-0914",
    time: "2026-09-25T06:00:00Z",
  },
  {
    id: "evt_9f1e",
    actor: "Priya Shah",
    action: "project.archived",
    target: "Spring launch",
    time: "2026-09-24T17:28:00Z",
  },
  {
    id: "evt_9f1d",
    actor: "Maya Thompson",
    action: "sso.enforced",
    target: "northwind.io",
    time: "2026-09-24T15:03:00Z",
  },
  {
    id: "evt_9f1c",
    actor: "Owen Walsh",
    action: "export.downloaded",
    target: "Q3 orders.csv",
    time: "2026-09-24T11:47:00Z",
  },
  {
    id: "evt_9f1b",
    actor: "Daniel Reyes",
    action: "member.invited",
    target: "hana@northwind.io",
    time: "2026-09-23T16:20:00Z",
  },
  {
    id: "evt_9f1a",
    actor: "Priya Shah",
    action: "webhook.disabled",
    target: "https://hooks.northwind.io/orders",
    time: "2026-09-23T10:05:00Z",
  },
  {
    id: "evt_9f19",
    actor: "System",
    action: "login.blocked",
    target: "5 failed attempts",
    time: "2026-09-22T22:31:00Z",
  },
  {
    id: "evt_9f18",
    actor: "Maya Thompson",
    action: "billing.plan_changed",
    target: "Team → Business",
    time: "2026-09-22T14:12:00Z",
  },
  {
    id: "evt_9f17",
    actor: "Owen Walsh",
    action: "project.created",
    target: "Fall campaign",
    time: "2026-09-21T09:58:00Z",
  },
  {
    id: "evt_9f16",
    actor: "Daniel Reyes",
    action: "domain.verified",
    target: "app.northwind.io",
    time: "2026-09-20T13:40:00Z",
  },
  {
    id: "evt_9f15",
    actor: "Priya Shah",
    action: "api_key.revoked",
    target: "Old staging",
    time: "2026-09-19T18:22:00Z",
  },
  {
    id: "evt_9f14",
    actor: "Maya Thompson",
    action: "member.removed",
    target: "leo@northwind.io",
    time: "2026-09-18T12:09:00Z",
  },
  {
    id: "evt_9f13",
    actor: "System",
    action: "backup.completed",
    target: "Nightly snapshot",
    time: "2026-09-18T03:00:00Z",
  },
];

const PAGE_SIZE = 5;
const PAGE_COUNT = Math.ceil(events.length / PAGE_SIZE);

const timeFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
});

export default function Table06() {
  const [page, setPage] = React.useState(1);

  const start = (page - 1) * PAGE_SIZE;
  const rows = events.slice(start, start + PAGE_SIZE);

  function goTo(event: React.MouseEvent<HTMLAnchorElement>, next: number) {
    event.preventDefault();
    if (next >= 1 && next <= PAGE_COUNT) setPage(next);
  }

  return (
    <div className="w-full max-w-2xl space-y-3">
      <div className="rounded-lg border">
        <Table aria-label="Audit log">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-3">Event</TableHead>
              <TableHead className="hidden sm:table-cell">Target</TableHead>
              <TableHead className="pr-3 text-right">Time (UTC)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="py-2.5 pl-3">
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                    {event.action}
                  </code>
                  <p className="mt-1 text-xs text-muted-foreground">
                    by{" "}
                    <span
                      className={
                        event.actor === "System"
                          ? undefined
                          : "font-medium text-foreground"
                      }
                    >
                      {event.actor}
                    </span>
                  </p>
                </TableCell>
                <TableCell className="hidden max-w-56 truncate text-muted-foreground sm:table-cell">
                  {event.target}
                </TableCell>
                <TableCell className="pr-3 text-right whitespace-normal text-muted-foreground tabular-nums sm:whitespace-nowrap">
                  <time dateTime={event.time}>
                    {timeFormat.format(new Date(event.time))}
                  </time>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p aria-live="polite" className="text-sm text-muted-foreground">
          <span className="tabular-nums">
            {start + 1}–{start + rows.length}
          </span>{" "}
          of <span className="tabular-nums">{events.length}</span> events
        </p>
        <Pagination aria-label="Audit log pages" className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                aria-disabled={page === 1}
                tabIndex={page === 1 ? -1 : undefined}
                className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                onClick={(event) => goTo(event, page - 1)}
              />
            </PaginationItem>
            {Array.from({ length: PAGE_COUNT }, (_, index) => index + 1).map(
              (number) => (
                <PaginationItem key={number}>
                  <PaginationLink
                    href="#"
                    isActive={number === page}
                    aria-label={`Page ${number}`}
                    onClick={(event) => goTo(event, number)}
                  >
                    {number}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                aria-disabled={page === PAGE_COUNT}
                tabIndex={page === PAGE_COUNT ? -1 : undefined}
                className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                onClick={(event) => goTo(event, page + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
