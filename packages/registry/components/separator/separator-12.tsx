"use client";

import { Check, Copy, RotateCw } from "lucide-react";
import * as React from "react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Separator } from "@/registry/base/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

type Pane = "headers" | "body";

const panes: Pane[] = ["headers", "body"];

const request = {
  headers: [
    ["Authorization", "Bearer sk_live_•••• 4f2a"],
    ["Content-Type", "application/json"],
    ["Idempotency-Key", "ord_8Kq2-retry-1"],
  ],
  body: `{
  "amount": 12900,
  "currency": "usd",
  "customer": "cus_Nw81xLm"
}`,
};

const response = {
  headers: [
    ["Content-Type", "application/json"],
    ["X-Request-Id", "req_5hT0aQ9vB2"],
    ["RateLimit-Remaining", "98"],
  ],
  body: `{
  "id": "pay_3PzQe7",
  "status": "succeeded",
  "amount": 12900
}`,
};

function PaneContent({
  pane,
  data,
}: {
  pane: Pane;
  data: typeof request;
}) {
  if (pane === "body") {
    return (
      <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs leading-relaxed">
        <code>{data.body}</code>
      </pre>
    );
  }
  return (
    <dl className="text-xs">
      {data.headers.map(([name, value], index) => (
        <div key={name}>
          {index > 0 ? <Separator /> : null}
          <div className="flex flex-col gap-0.5 py-2">
            <dt className="text-muted-foreground">{name}</dt>
            <dd className="truncate font-mono">{value}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

export default function Separator12() {
  const [pane, setPane] = React.useState<Pane>("headers");
  const [copied, setCopied] = React.useState(false);
  const [replay, setReplay] = React.useState({ count: 0, pending: false });

  React.useEffect(() => {
    if (!replay.pending) return;
    const timeout = window.setTimeout(
      () => setReplay((current) => ({ ...current, pending: false })),
      700,
    );
    return () => window.clearTimeout(timeout);
  }, [replay.pending]);

  // Each replay lands with a slightly different timing, as real calls do.
  const elapsed = [184, 162, 205, 171][replay.count % 4];

  React.useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const copyCurl = () => {
    const command = `curl -X POST https://api.acme.dev/v1/payments -d '${request.body.replace(/\s+/g, "")}'`;
    navigator.clipboard?.writeText(command).catch(() => {});
    setCopied(true);
  };

  return (
    <section
      aria-labelledby="separator-12-heading"
      className="@container w-full max-w-2xl rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Badge variant="outline" className="font-mono">
            POST
          </Badge>
          <h3
            id="separator-12-heading"
            className="truncate font-mono text-sm font-medium"
          >
            /v1/payments
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={copyCurl}>
            {copied ? (
              <Check aria-hidden="true" data-icon="inline-start" />
            ) : (
              <Copy aria-hidden="true" data-icon="inline-start" />
            )}
            <span className="sr-only @sm:not-sr-only">
              {copied ? "Copied" : "Copy cURL"}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={replay.pending}
            onClick={() =>
              setReplay((current) => ({
                count: current.count + 1,
                pending: true,
              }))
            }
          >
            <RotateCw
              aria-hidden="true"
              className={
                replay.pending
                  ? "animate-spin motion-reduce:animate-none"
                  : undefined
              }
            />
            <span className="sr-only">Replay request</span>
          </Button>
        </div>
      </header>

      <div className="flex h-9 items-stretch gap-2 overflow-x-auto border-y bg-muted/40 px-3 text-xs whitespace-nowrap">
        <dl className="flex items-center gap-1.5">
          <dt className="sr-only">Status</dt>
          <dd className="flex items-center gap-1.5 font-medium text-success">
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 rounded-full bg-success"
            />
            201 Created
          </dd>
        </dl>
        <Separator orientation="vertical" className="my-2.5" />
        <dl className="flex items-center gap-1">
          <dt className="text-muted-foreground">Time</dt>
          <dd className="tabular-nums" aria-live="polite">
            {replay.pending ? "Sending..." : `${elapsed} ms`}
          </dd>
        </dl>
        <Separator orientation="vertical" className="my-2.5" />
        <dl className="flex items-center gap-1">
          <dt className="text-muted-foreground">Size</dt>
          <dd className="tabular-nums">2.4 KB</dd>
        </dl>
      </div>

      <Tabs
        value={pane}
        onValueChange={(value) => setPane(value as Pane)}
        className="gap-0"
      >
        <div className="px-4 pt-3">
          <TabsList>
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="body">Body</TabsTrigger>
          </TabsList>
        </div>
        {panes.map((value) => (
          <TabsContent
            key={value}
            value={value}
            className="grid grid-cols-1 gap-3 p-4 @xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] @xl:gap-4"
          >
            <div className="min-w-0">
              <h4 className="mb-2 text-xs font-medium">Request</h4>
              <PaneContent pane={value} data={request} />
            </div>
            <Separator className="@xl:hidden" />
            <Separator orientation="vertical" className="hidden @xl:block" />
            <div className="min-w-0">
              <h4 className="mb-2 text-xs font-medium">Response</h4>
              <PaneContent pane={value} data={response} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
