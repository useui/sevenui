"use client";

import { PanelLeftClose, PanelLeftOpen, Send } from "lucide-react";
import * as React from "react";
import { usePanelRef } from "react-resizable-panels";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/registry/base/ui/resizable";

type Endpoint = {
  id: string;
  method: "GET" | "POST" | "DELETE";
  name: string;
  url: string;
  status: number;
  time: number;
  body: string;
};

const endpoints: Endpoint[] = [
  {
    id: "list-orders",
    method: "GET",
    name: "List orders",
    url: "https://api.shopline.dev/v2/orders?limit=2",
    status: 200,
    time: 142,
    body: JSON.stringify(
      {
        data: [
          { id: "ord_8QmK", total: 12900, status: "paid" },
          { id: "ord_8QmJ", total: 4500, status: "refunded" },
        ],
        has_more: true,
      },
      null,
      2,
    ),
  },
  {
    id: "create-refund",
    method: "POST",
    name: "Create refund",
    url: "https://api.shopline.dev/v2/refunds",
    status: 201,
    time: 318,
    body: JSON.stringify(
      { id: "re_3Lp9", order: "ord_8QmJ", amount: 4500, status: "pending" },
      null,
      2,
    ),
  },
  {
    id: "delete-webhook",
    method: "DELETE",
    name: "Delete webhook",
    url: "https://api.shopline.dev/v2/webhooks/wh_missing",
    status: 404,
    time: 87,
    body: JSON.stringify(
      {
        error: {
          type: "not_found",
          message: "No webhook with id wh_missing exists in this workspace.",
        },
      },
      null,
      2,
    ),
  },
];

const methodClass: Record<Endpoint["method"], string> = {
  GET: "text-chart-2",
  POST: "text-chart-4",
  DELETE: "text-destructive",
};

export default function Resizable14() {
  const sidebarRef = usePanelRef();
  const [collapsed, setCollapsed] = React.useState(false);
  const [endpointId, setEndpointId] = React.useState(endpoints[0].id);
  const [url, setUrl] = React.useState(endpoints[0].url);
  const [responseFor, setResponseFor] = React.useState<string | null>(null);
  const endpoint = endpoints.find((item) => item.id === endpointId) ?? endpoints[0];
  const response = responseFor === endpointId ? endpoint : null;

  function selectEndpoint(item: Endpoint) {
    setEndpointId(item.id);
    setUrl(item.url);
  }

  function toggleSidebar() {
    const panel = sidebarRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) panel.expand();
    else panel.collapse();
  }

  return (
    <div className="h-[460px] w-full max-w-3xl">
      <ResizablePanelGroup className="rounded-xl border bg-card text-card-foreground">
        <ResizablePanel
          id="collections"
          panelRef={sidebarRef}
          defaultSize="28%"
          minSize="20%"
          maxSize="40%"
          collapsible
          collapsedSize="0%"
          onResize={() =>
            setCollapsed(sidebarRef.current?.isCollapsed() ?? false)
          }
        >
          <nav
            aria-label="Saved requests"
            inert={collapsed}
            className="flex h-full flex-col bg-muted/40"
          >
            <div className="flex h-11 items-center border-b px-3 text-xs font-medium text-muted-foreground">
              <span className="truncate">Payments API</span>
            </div>
            <ul className="@container flex flex-col gap-0.5 overflow-y-auto p-1.5">
              {endpoints.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-current={item.id === endpointId ? "true" : undefined}
                    onClick={() => selectEndpoint(item)}
                    className="flex w-full flex-col items-start gap-0.5 rounded-md px-2 py-1.5 text-left text-sm @[9rem]:flex-row @[9rem]:items-center @[9rem]:gap-2 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 aria-[current=true]:bg-background aria-[current=true]:shadow-xs"
                  >
                    <span
                      className={`w-9 shrink-0 font-mono text-[10px] font-semibold ${methodClass[item.method]}`}
                    >
                      {item.method === "DELETE" ? "DEL" : item.method}
                    </span>
                    <span className="w-full min-w-0 truncate @[9rem]:w-auto">{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </ResizablePanel>
        <ResizableHandle aria-label="Resize saved requests" />
        <ResizablePanel id="workspace" defaultSize="72%" minSize="55%">
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel defaultSize="40%" minSize="28%">
              <form
                aria-label="Request"
                onSubmit={(event) => {
                  event.preventDefault();
                  setResponseFor(endpointId);
                }}
                className="flex h-full flex-col gap-3 overflow-y-auto p-3"
              >
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={toggleSidebar}
                    aria-label={
                      collapsed ? "Show saved requests" : "Hide saved requests"
                    }
                    aria-expanded={!collapsed}
                  >
                    {collapsed ? (
                      <PanelLeftOpen aria-hidden="true" />
                    ) : (
                      <PanelLeftClose aria-hidden="true" />
                    )}
                  </Button>
                  <h3 className="truncate text-sm font-semibold">
                    {endpoint.name}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <label htmlFor="resizable-14-url" className="sr-only">
                    Request URL
                  </label>
                  <div className="flex min-w-0 flex-1 items-center rounded-lg border bg-background focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
                    <span
                      className={`pl-2.5 font-mono text-xs font-semibold ${methodClass[endpoint.method]}`}
                    >
                      {endpoint.method}
                    </span>
                    <Input
                      id="resizable-14-url"
                      value={url}
                      onChange={(event) => setUrl(event.target.value)}
                      spellCheck={false}
                      className="min-w-0 border-0 bg-transparent font-mono text-xs focus-visible:ring-0 dark:bg-transparent"
                    />
                  </div>
                  <Button type="submit" aria-label="Send request">
                    <Send aria-hidden="true" />
                    <span className="hidden sm:inline">Send</span>
                  </Button>
                </div>
              </form>
            </ResizablePanel>
            <ResizableHandle withHandle aria-label="Resize response viewer" />
            <ResizablePanel defaultSize="60%" minSize="25%">
              <section
                aria-label="Response"
                className="flex h-full flex-col"
              >
                <div
                  aria-live="polite"
                  className="flex h-9 shrink-0 items-center gap-2 border-b px-3 text-xs"
                >
                  <span className="font-medium">Response</span>
                  {response && (
                    <>
                      <Badge
                        variant={
                          response.status >= 400 ? "destructive" : "secondary"
                        }
                        className="tabular-nums"
                      >
                        {response.status}
                      </Badge>
                      <span className="ml-auto text-muted-foreground tabular-nums">
                        {response.time} ms
                      </span>
                    </>
                  )}
                </div>
                {response ? (
                  <pre className="flex-1 overflow-auto bg-muted/40 p-3 font-mono text-xs leading-relaxed">
                    <code>{response.body}</code>
                  </pre>
                ) : (
                  <div className="flex flex-1 items-center justify-center p-4 text-center text-sm text-muted-foreground">
                    Send the request to inspect its response.
                  </div>
                )}
              </section>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
