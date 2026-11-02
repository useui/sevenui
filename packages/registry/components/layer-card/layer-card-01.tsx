"use client";

import * as React from "react";

import { Badge } from "@/registry/base/ui/badge";
import { Input } from "@/registry/base/ui/input";
import {
  LayerCard,
  LayerCardFooter,
  LayerCardHeader,
  LayerCardPanel,
  LayerCardTitle,
} from "@/registry/base/ui/layer-card";
import { Tabs, TabsList, TabsTrigger } from "@/registry/base/ui/tabs";

type StatusFilter = "all" | "2xx" | "4xx" | "5xx";

const ORIGINS = [
  { origin: "api.example.com", status: 200, requests: 1204, duration: "84 ms" },
  { origin: "cdn.example.com", status: 200, requests: 860, duration: "12 ms" },
  { origin: "auth.example.com", status: 401, requests: 312, duration: "41 ms" },
  { origin: "search.example.com", status: 200, requests: 208, duration: "160 ms" },
  { origin: "billing.example.com", status: 503, requests: 37, duration: "2.1 s" },
  { origin: "images.example.com", status: 404, requests: 19, duration: "9 ms" },
];

function matches(status: number, filter: StatusFilter) {
  if (filter === "all") return true;
  return String(status)[0] === filter[0];
}

export default function LayerCard01() {
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<StatusFilter>("all");

  const rows = ORIGINS.filter(
    (row) => matches(row.status, filter) && row.origin.includes(query.trim()),
  );

  return (
    <LayerCard className="w-full max-w-[540px]">
      <LayerCardHeader className="gap-2">
        <LayerCardTitle>Subrequests</LayerCardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            aria-label="Filter origins"
            placeholder="Filter origins…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-7 max-w-52 text-xs"
          />
          <Tabs value={filter} onValueChange={(value) => setFilter(value as StatusFilter)}>
            <TabsList className="h-7">
              {(["all", "2xx", "4xx", "5xx"] as const).map((value) => (
                <TabsTrigger key={value} value={value} className="px-2 text-xs capitalize">
                  {value}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </LayerCardHeader>
      <LayerCardPanel className="p-0">
        <div className="grid grid-cols-[1fr_auto_auto] text-sm">
          <div className="contents text-xs text-muted-foreground">
            <span className="px-4 pt-3 pb-2">Origin</span>
            <span className="px-3 pt-3 pb-2 text-right">Requests</span>
            <span className="pt-3 pr-4 pb-2 pl-3 text-right">Duration</span>
          </div>
          {rows.map((row) => (
            <div key={row.origin} className="contents">
              <span className="flex items-center gap-2 border-t px-4 py-2">
                <Badge variant={row.status < 400 ? "secondary" : "destructive"}>
                  {row.status}
                </Badge>
                <span className="truncate font-mono text-xs">{row.origin}</span>
              </span>
              <span className="border-t px-3 py-2 text-right tabular-nums">
                {row.requests.toLocaleString("en-US")}
              </span>
              <span className="border-t py-2 pr-4 pl-3 text-right tabular-nums text-muted-foreground">
                {row.duration}
              </span>
            </div>
          ))}
          {rows.length === 0 ? (
            <p className="col-span-3 border-t px-4 py-6 text-center text-muted-foreground">
              No origins match this filter.
            </p>
          ) : null}
        </div>
      </LayerCardPanel>
      <LayerCardFooter>
        Showing {rows.length} of {ORIGINS.length}
      </LayerCardFooter>
    </LayerCard>
  );
}
