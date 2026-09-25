"use client";

import * as React from "react";
import { FilterXIcon, XIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";

type Order = {
  id: string;
  customer: string;
  status: "Paid" | "Refunded" | "Pending";
  region: "EU" | "US";
  total: string;
};

type Filter = { id: string; label: string; test: (order: Order) => boolean };

const orders: Order[] = [
  { id: "4821", customer: "Hannah Weber", status: "Refunded", region: "US", total: "$129.00" },
  { id: "4817", customer: "Luca Moretti", status: "Paid", region: "EU", total: "€84.50" },
  { id: "4809", customer: "Sofia Lindqvist", status: "Refunded", region: "US", total: "$42.00" },
  { id: "4796", customer: "Noah Becker", status: "Pending", region: "EU", total: "€210.00" },
];

const initialFilters: Filter[] = [
  { id: "status", label: "Status: Refunded", test: (order) => order.status === "Refunded" },
  { id: "region", label: "Region: EU", test: (order) => order.region === "EU" },
];

export default function Empty12() {
  const [filters, setFilters] = React.useState(initialFilters);

  const results = orders.filter((order) =>
    filters.every((filter) => filter.test(order)),
  );

  function removeFilter(id: string) {
    setFilters((current) => current.filter((filter) => filter.id !== id));
  }

  return (
    <section
      aria-labelledby="empty-12-title"
      className="w-full max-w-md rounded-xl border bg-card text-card-foreground shadow-sm"
    >
      <header className="flex flex-col gap-2 border-b px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <h2 id="empty-12-title" className="text-sm font-medium">
            Orders
          </h2>
          <span className="text-xs text-muted-foreground tabular-nums">
            {results.length} of {orders.length}
          </span>
        </div>
        {filters.length > 0 ? (
          <ul aria-label="Active filters" className="flex flex-wrap gap-1.5">
            {filters.map((filter) => (
              <li key={filter.id}>
                <Badge variant="secondary" className="h-6 gap-1 pr-0.5">
                  {filter.label}
                  <button
                    type="button"
                    aria-label={`Remove filter ${filter.label}`}
                    onClick={() => removeFilter(filter.id)}
                    className="flex size-5 items-center justify-center rounded-full outline-none hover:bg-background focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <XIcon aria-hidden="true" className="size-3" />
                  </button>
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">No filters applied</p>
        )}
      </header>
      <div aria-live="polite" className="min-h-64">
        {results.length > 0 ? (
          <ul className="divide-y">
            {results.map((order) => (
              <li
                key={order.id}
                className="flex items-center gap-3 px-4 py-2.5 text-sm"
              >
                <span className="w-12 shrink-0 text-muted-foreground tabular-nums">
                  #{order.id}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">
                  {order.customer}
                </span>
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {order.status}
                </span>
                <span className="tabular-nums">{order.total}</span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty className="min-h-64">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FilterXIcon aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>No orders match these filters</EmptyTitle>
              <EmptyDescription>
                There are refunds in the US and orders in the EU, but none that
                are both. Loosen a filter to see them.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex flex-wrap justify-center gap-2">
                {filters.map((filter) => (
                  <Button
                    key={filter.id}
                    size="sm"
                    variant="outline"
                    onClick={() => removeFilter(filter.id)}
                  >
                    Drop &ldquo;{filter.label}&rdquo;
                  </Button>
                ))}
              </div>
              <Button size="sm" variant="link" onClick={() => setFilters([])}>
                Clear all filters
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </div>
      {filters.length < initialFilters.length && (
        <div className="border-t px-4 py-2">
          <Button
            size="xs"
            variant="ghost"
            onClick={() => setFilters(initialFilters)}
          >
            Restore filters
          </Button>
        </div>
      )}
    </section>
  );
}
