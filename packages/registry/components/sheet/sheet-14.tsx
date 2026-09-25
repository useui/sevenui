"use client";

import * as React from "react";
import { cn } from "cn";
import { Check, ChevronDown, ChevronUp, Copy, RotateCw } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/registry/base/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/base/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

type LogEntry = {
  id: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  status: number;
  duration: number;
  time: string;
  ip: string;
  apiKey: string;
  request: object | null;
  response: object;
};

const logs: LogEntry[] = [
  {
    id: "req_8Hq2Lm4x",
    method: "POST",
    path: "/v1/invoices",
    status: 201,
    duration: 142,
    time: "14:02:31",
    ip: "34.201.18.7",
    apiKey: "sk_live_…4f2a",
    request: { customer: "cus_Q81x", currency: "eur", due_days: 14 },
    response: { id: "in_7Tz01", status: "draft", amount_due: 48000 },
  },
  {
    id: "req_2Vn9Pk1c",
    method: "GET",
    path: "/v1/customers/cus_Q81x",
    status: 200,
    duration: 38,
    time: "14:02:30",
    ip: "34.201.18.7",
    apiKey: "sk_live_…4f2a",
    request: null,
    response: { id: "cus_Q81x", email: "billing@oakline.io", balance: 0 },
  },
  {
    id: "req_6Rw3Jd8s",
    method: "PATCH",
    path: "/v1/subscriptions/sub_19Ka",
    status: 422,
    duration: 67,
    time: "14:01:12",
    ip: "52.14.90.221",
    apiKey: "sk_live_…9b0e",
    request: { plan: "team_annual", quantity: 0 },
    response: {
      error: {
        type: "invalid_request",
        param: "quantity",
        message: "Quantity must be at least 1.",
      },
    },
  },
  {
    id: "req_4Km7Qa2t",
    method: "DELETE",
    path: "/v1/webhooks/we_22Lp",
    status: 204,
    duration: 51,
    time: "13:58:47",
    ip: "52.14.90.221",
    apiKey: "sk_live_…9b0e",
    request: null,
    response: {},
  },
  {
    id: "req_9Xc5Ne0b",
    method: "POST",
    path: "/v1/payouts",
    status: 500,
    duration: 1843,
    time: "13:55:09",
    ip: "34.201.18.7",
    apiKey: "sk_live_…4f2a",
    request: { amount: 125000, destination: "ba_91Hs" },
    response: {
      error: { type: "api_error", message: "Upstream bank timeout." },
    },
  },
];

function statusTone(status: number) {
  if (status >= 500) return "bg-destructive";
  if (status >= 400) return "bg-warning";
  return "bg-success";
}

function StatusCode({ status }: { status: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", statusTone(status))}
      />
      {status}
    </span>
  );
}

function JsonBlock({ label, value }: { label: string; value: object | null }) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const text = value ? JSON.stringify(value, null, 2) : null;

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const copy = () => {
    if (!text) return;
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="flex items-center justify-between border-b bg-muted/50 py-1 pr-1 pl-3">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={copy}
          disabled={!text}
          aria-label={copied ? `${label} copied` : `Copy ${label}`}
        >
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        </Button>
      </div>
      {text ? (
        <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed">
          {text}
        </pre>
      ) : (
        <p className="p-3 text-xs text-muted-foreground">No body sent.</p>
      )}
    </div>
  );
}

export default function Sheet14() {
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const [replayed, setReplayed] = React.useState<string[]>([]);

  const entry = logs[index];

  const openEntry = (next: number) => {
    setIndex(next);
    setOpen(true);
  };

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div>
          <h3 className="text-sm font-medium">API requests</h3>
          <p className="text-xs text-muted-foreground">
            Live mode · last 15 minutes
          </p>
        </div>
        <Badge variant="outline" className="tabular-nums">
          {logs.length} requests
        </Badge>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 pl-4">Status</TableHead>
            <TableHead>Endpoint</TableHead>
            <TableHead className="hidden text-right sm:table-cell">
              Duration
            </TableHead>
            <TableHead className="pr-4 text-right">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log, rowIndex) => (
            <TableRow
              key={log.id}
              data-state={open && rowIndex === index ? "selected" : undefined}
            >
              <TableCell className="pl-4">
                <StatusCode status={log.status} />
              </TableCell>
              <TableCell className="max-w-0 w-full">
                <button
                  type="button"
                  onClick={() => openEntry(rowIndex)}
                  className="flex w-full min-w-0 flex-col items-start gap-0.5 rounded-sm text-left outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 sm:flex-row sm:items-center sm:gap-2"
                >
                  <span className="w-12 shrink-0 font-mono text-xs text-muted-foreground">
                    {log.method}
                  </span>
                  <span className="w-full truncate font-mono text-xs sm:w-auto">
                    {log.path}
                  </span>
                </button>
              </TableCell>
              <TableCell className="hidden text-right text-muted-foreground tabular-nums sm:table-cell">
                {log.duration} ms
              </TableCell>
              <TableCell className="pr-4 text-right text-muted-foreground tabular-nums">
                {log.time}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
          <SheetHeader className="gap-2 border-b pr-12">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono">
                {entry.method}
              </Badge>
              <span className="text-sm font-medium">
                <StatusCode status={entry.status} />
              </span>
            </div>
            <SheetTitle className="font-mono text-sm break-all">
              {entry.path}
            </SheetTitle>
            <SheetDescription className="text-xs">
              {entry.id} · {entry.duration} ms at {entry.time} UTC
            </SheetDescription>
          </SheetHeader>
          <Tabs
            key={entry.id}
            defaultValue="response"
            className="flex-1 gap-0 overflow-hidden"
          >
            <div className="border-b px-4 py-2">
              <TabsList variant="line">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="request">Request</TabsTrigger>
                <TabsTrigger value="response">Response</TabsTrigger>
              </TabsList>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <TabsContent value="overview">
                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
                  <dt className="text-muted-foreground">Request ID</dt>
                  <dd className="font-mono text-xs break-all">{entry.id}</dd>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <StatusCode status={entry.status} />
                  </dd>
                  <dt className="text-muted-foreground">Duration</dt>
                  <dd className="tabular-nums">{entry.duration} ms</dd>
                  <dt className="text-muted-foreground">Source IP</dt>
                  <dd className="font-mono text-xs">{entry.ip}</dd>
                  <dt className="text-muted-foreground">API key</dt>
                  <dd className="font-mono text-xs">{entry.apiKey}</dd>
                  <dt className="text-muted-foreground">Version</dt>
                  <dd className="font-mono text-xs">2026-08-01</dd>
                </dl>
              </TabsContent>
              <TabsContent value="request">
                <JsonBlock label="Request body" value={entry.request} />
              </TabsContent>
              <TabsContent value="response">
                <JsonBlock label="Response body" value={entry.response} />
              </TabsContent>
            </div>
          </Tabs>
          <SheetFooter className="flex-row items-center border-t">
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setIndex((current) => current - 1)}
                disabled={index === 0}
                aria-label="Previous request"
              >
                <ChevronUp aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setIndex((current) => current + 1)}
                disabled={index === logs.length - 1}
                aria-label="Next request"
              >
                <ChevronDown aria-hidden="true" />
              </Button>
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">
              {index + 1} of {logs.length}
            </span>
            <Button
              size="sm"
              variant={replayed.includes(entry.id) ? "secondary" : "default"}
              className="ml-auto"
              disabled={entry.method === "GET"}
              onClick={() =>
                setReplayed((list) =>
                  list.includes(entry.id) ? list : [...list, entry.id],
                )
              }
            >
              <RotateCw aria-hidden="true" data-icon="inline-start" />
              {replayed.includes(entry.id) ? "Replay queued" : "Replay request"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
