"use client";

import { Lock } from "lucide-react";
import { useState } from "react";

import { Button } from "@/registry/base/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

const recentExports = [
  { name: "Q3 revenue by plan.csv", meta: "Exported Sep 22 · 184 KB" },
  { name: "Churned accounts.csv", meta: "Exported Sep 18 · 42 KB" },
];

const planComparison = [
  { plan: "Team", includes: "Overview and exports", price: "$12 / seat" },
  { plan: "Business", includes: "Adds audit log and SSO", price: "$20 / seat" },
];

export default function Tabs06() {
  const [comparing, setComparing] = useState(false);

  return (
    <Tabs defaultValue="overview" className="w-full max-w-md gap-3">
      <TabsList className="w-full">
        <TabsTrigger value="overview" className="flex-1">
          Overview
        </TabsTrigger>
        <TabsTrigger value="exports" className="flex-1">
          Exports
        </TabsTrigger>
        <TabsTrigger
          value="audit-log"
          disabled
          aria-describedby="tabs-06-audit-hint"
          className="flex-1"
        >
          <Lock className="size-3.5" aria-hidden="true" />
          Audit log
        </TabsTrigger>
      </TabsList>
      <p
        id="tabs-06-audit-hint"
        className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground"
      >
        Audit log is included on the Business plan.
        <Button
          variant="link"
          size="xs"
          className="h-auto px-0"
          aria-expanded={comparing}
          aria-controls="tabs-06-compare"
          onClick={() => setComparing((open) => !open)}
        >
          {comparing ? "Hide plans" : "Compare plans"}
        </Button>
      </p>
      <dl
          id="tabs-06-compare"
          hidden={!comparing}
          className="grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-1 rounded-lg bg-muted/60 p-3 text-xs"
        >
          {planComparison.map((row) => (
            <div key={row.plan} className="contents">
              <dt className="font-medium">{row.plan}</dt>
              <dd className="text-muted-foreground">{row.includes}</dd>
              <dd className="tabular-nums">{row.price}</dd>
            </div>
          ))}
        </dl>
      <TabsContent value="overview">
        <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border p-3">
          <div>
            <dt className="text-xs text-muted-foreground">Active seats</dt>
            <dd className="text-lg font-semibold tabular-nums">24 of 30</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Renews on</dt>
            <dd className="text-lg font-semibold tabular-nums">Oct 14</dd>
          </div>
        </dl>
      </TabsContent>
      <TabsContent value="exports">
        <ul className="divide-y divide-border rounded-lg border border-border">
          {recentExports.map((file) => (
            <li key={file.name} className="px-3 py-2">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{file.meta}</p>
            </li>
          ))}
        </ul>
      </TabsContent>
    </Tabs>
  );
}
