"use client";

import * as React from "react";

import { Badge } from "@/registry/base/ui/badge";
import { Switch } from "@/registry/base/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/base/ui/table";

type Delivery = "ok" | "failing" | "idle";

const endpoints: {
  id: string;
  url: string;
  events: string;
  enabled: boolean;
  delivery: Delivery;
  lastDelivery: string;
}[] = [
  {
    id: "orders",
    url: "api.harborcoffee.com/hooks/orders",
    events: "order.created, order.paid",
    enabled: true,
    delivery: "ok",
    lastDelivery: "200 · 4 min ago",
  },
  {
    id: "crm",
    url: "hooks.pipeline.io/t/9f2c1",
    events: "customer.updated",
    enabled: false,
    delivery: "failing",
    lastDelivery: "Paused after 5 × 503",
  },
  {
    id: "slack",
    url: "hooks.slack.com/services/T04…",
    events: "refund.created",
    enabled: true,
    delivery: "ok",
    lastDelivery: "200 · Yesterday",
  },
];

const deliveryBadge: Record<
  Delivery,
  { label: string; variant: "secondary" | "destructive" | "outline" }
> = {
  ok: { label: "Healthy", variant: "secondary" },
  failing: { label: "Failing", variant: "destructive" },
  idle: { label: "Waiting", variant: "outline" },
};

export default function Switch11() {
  const [rows, setRows] = React.useState(endpoints);

  const activeCount = rows.filter((row) => row.enabled).length;

  function toggle(id: string, enabled: boolean) {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== id) return row;
        // Re-enabling a failing endpoint clears its error until the next delivery.
        if (enabled && row.delivery === "failing") {
          return { ...row, enabled, delivery: "idle", lastDelivery: "Retries on next event" };
        }
        return { ...row, enabled };
      }),
    );
  }

  return (
    <section
      aria-labelledby="switch-11-title"
      className="w-full max-w-xl rounded-xl border border-border bg-card text-card-foreground"
    >
      <div className="flex flex-col gap-0.5 px-4 pt-4 pb-2">
        <h3 id="switch-11-title" className="font-medium">
          Webhook endpoints
        </h3>
        <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
          {activeCount} of {rows.length} endpoints receiving events
        </p>
      </div>
      <Table className="table-fixed">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4 text-xs text-muted-foreground">Endpoint</TableHead>
            <TableHead className="hidden w-40 text-xs text-muted-foreground sm:table-cell">
              Last delivery
            </TableHead>
            <TableHead className="w-20 pr-4 text-right text-xs text-muted-foreground">
              Enabled
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const badge = deliveryBadge[row.delivery];
            return (
              <TableRow key={row.id}>
                <TableCell className="py-3 pl-4 whitespace-normal">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate font-mono text-xs font-medium">{row.url}</span>
                    <span className="truncate text-xs text-muted-foreground">{row.events}</span>
                    <span className="flex flex-wrap items-center gap-1.5 sm:hidden">
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                      <span className="text-xs text-muted-foreground">{row.lastDelivery}</span>
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden py-3 whitespace-normal sm:table-cell">
                  <div className="flex flex-col items-start gap-1">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    <span className="text-xs text-muted-foreground">{row.lastDelivery}</span>
                  </div>
                </TableCell>
                <TableCell className="py-3 pr-4 text-right">
                  <Switch
                    aria-label={`Send events to ${row.url}`}
                    checked={row.enabled}
                    onCheckedChange={(checked) => toggle(row.id, checked)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
}
