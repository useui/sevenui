"use client";

import * as React from "react";
import { CheckIcon, CopyIcon, SearchIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/registry/base/ui/sidebar";

type Method = "GET" | "POST" | "PATCH" | "DELETE";

type Endpoint = {
  id: string;
  resource: string;
  method: Method;
  path: string;
  title: string;
  description: string;
  params: { name: string; type: string; required?: boolean; note: string }[];
};

const endpoints: Endpoint[] = [
  {
    id: "list-customers",
    resource: "Customers",
    method: "GET",
    path: "/v1/customers",
    title: "List customers",
    description: "Returns customers sorted by creation date, newest first.",
    params: [
      { name: "limit", type: "integer", note: "Between 1 and 100. Defaults to 20." },
      { name: "email", type: "string", note: "Only return customers with this exact email." },
    ],
  },
  {
    id: "create-customer",
    resource: "Customers",
    method: "POST",
    path: "/v1/customers",
    title: "Create a customer",
    description: "Creates a customer you can attach payment methods and subscriptions to.",
    params: [
      { name: "email", type: "string", required: true, note: "Used for receipts and dunning emails." },
      { name: "name", type: "string", note: "Full name or business name." },
    ],
  },
  {
    id: "update-customer",
    resource: "Customers",
    method: "PATCH",
    path: "/v1/customers/:id",
    title: "Update a customer",
    description: "Updates only the fields you pass. Omitted fields keep their value.",
    params: [
      { name: "id", type: "string", required: true, note: "The customer ID, e.g. cus_8Fq2." },
      { name: "metadata", type: "object", note: "Up to 50 string key–value pairs." },
    ],
  },
  {
    id: "create-refund",
    resource: "Payments",
    method: "POST",
    path: "/v1/refunds",
    title: "Refund a payment",
    description: "Refunds all or part of a captured payment back to the original card.",
    params: [
      { name: "payment", type: "string", required: true, note: "The payment ID to refund." },
      { name: "amount", type: "integer", note: "In cents. Defaults to the full amount." },
    ],
  },
  {
    id: "list-events",
    resource: "Webhooks",
    method: "GET",
    path: "/v1/events",
    title: "List events",
    description: "Events from the last 30 days, the same payloads your webhooks receive.",
    params: [{ name: "type", type: "string", note: "Filter by event type, e.g. invoice.paid." }],
  },
  {
    id: "delete-endpoint",
    resource: "Webhooks",
    method: "DELETE",
    path: "/v1/webhook_endpoints/:id",
    title: "Delete a webhook endpoint",
    description: "Stops deliveries immediately. Pending retries are dropped.",
    params: [{ name: "id", type: "string", required: true, note: "The endpoint ID, e.g. we_41Zk." }],
  },
];

const methodClass: Record<Method, string> = {
  GET: "text-chart-2",
  POST: "text-chart-1",
  PATCH: "text-chart-4",
  DELETE: "text-destructive",
};

function MethodTag({ method }: { method: Method }) {
  return (
    <span
      className={`w-11 shrink-0 font-mono text-[0.65rem] font-semibold tracking-wide ${methodClass[method]}`}
    >
      {method === "DELETE" ? "DEL" : method}
    </span>
  );
}

export default function Sidebar13() {
  const [query, setQuery] = React.useState("");
  const [activeId, setActiveId] = React.useState("create-customer");
  const [copied, setCopied] = React.useState(false);

  const q = query.trim().toLowerCase();
  const results = endpoints.filter((endpoint) =>
    `${endpoint.title} ${endpoint.path} ${endpoint.method}`.toLowerCase().includes(q),
  );
  const resources = Array.from(new Set(results.map((endpoint) => endpoint.resource)));
  const active = endpoints.find((endpoint) => endpoint.id === activeId) ?? endpoints[0];
  const example = `curl -X ${active.method} https://api.ledgerly.dev${active.path} \\\n  -H "Authorization: Bearer $LEDGERLY_KEY"`;

  React.useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(example);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="@container w-full max-w-3xl overflow-hidden rounded-xl border bg-background">
      <SidebarProvider className="min-h-0 flex-col @xl:h-[480px] @xl:flex-row">
        <Sidebar
          collapsible="none"
          role="navigation"
          aria-label="API reference"
          className="max-h-72 w-full border-b @xl:max-h-none @xl:w-64 @xl:border-r @xl:border-b-0"
        >
          <SidebarHeader className="p-3">
            <div className="relative">
              <SearchIcon
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              />
              <SidebarInput
                type="search"
                aria-label="Search endpoints"
                placeholder="Search endpoints"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pl-8"
              />
            </div>
          </SidebarHeader>
          <SidebarContent>
            {resources.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-sidebar-foreground/70" role="status">
                No endpoints match “{query.trim()}”.
              </p>
            ) : (
              resources.map((resource) => (
                <SidebarGroup key={resource} className="py-1">
                  <SidebarGroupLabel>{resource}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu aria-label={`${resource} endpoints`}>
                      {results
                        .filter((endpoint) => endpoint.resource === resource)
                        .map((endpoint) => (
                          <SidebarMenuItem key={endpoint.id}>
                            <SidebarMenuButton
                              size="sm"
                              isActive={endpoint.id === activeId}
                              aria-current={endpoint.id === activeId ? "page" : undefined}
                              onClick={() => setActiveId(endpoint.id)}
                            >
                              <MethodTag method={endpoint.method} />
                              <span>{endpoint.title}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))
            )}
          </SidebarContent>
        </Sidebar>
        <article
          aria-labelledby="sidebar-13-title"
          className="flex min-w-0 flex-1 flex-col gap-5 overflow-y-auto p-4 @xl:p-6"
        >
          <header className="flex flex-col gap-2">
            <h2 id="sidebar-13-title" className="text-base font-semibold">
              {active.title}
            </h2>
            <p className="flex min-w-0 items-center gap-2 rounded-md bg-muted px-2.5 py-1.5 font-mono text-xs">
              <MethodTag method={active.method} />
              <span className="truncate">{active.path}</span>
            </p>
            <p className="text-sm text-muted-foreground">{active.description}</p>
          </header>
          <section aria-labelledby="sidebar-13-params" className="flex flex-col gap-2">
            <h3 id="sidebar-13-params" className="text-sm font-medium">
              Parameters
            </h3>
            <dl className="divide-y rounded-lg border">
              {active.params.map((param) => (
                <div key={param.name} className="flex flex-col gap-1 p-3">
                  <dt className="flex flex-wrap items-center gap-2">
                    <code className="font-mono text-xs font-semibold">{param.name}</code>
                    <span className="text-xs text-muted-foreground">{param.type}</span>
                    {param.required && (
                      <span className="text-xs font-medium text-destructive">required</span>
                    )}
                  </dt>
                  <dd className="text-xs text-muted-foreground">{param.note}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section aria-labelledby="sidebar-13-example" className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 id="sidebar-13-example" className="text-sm font-medium">
                Example request
              </h3>
              <Button variant="ghost" size="xs" onClick={copy}>
                {copied ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-3 font-mono text-xs leading-relaxed">
              <code>{example}</code>
            </pre>
          </section>
        </article>
      </SidebarProvider>
    </div>
  );
}
