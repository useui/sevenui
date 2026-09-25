"use client";

import * as React from "react";
import {
  DatabaseIcon,
  GlobeIcon,
  KeyRoundIcon,
  LayersIcon,
  LockIcon,
  ScrollTextIcon,
  SearchIcon,
  ServerIcon,
  WebhookIcon,
  XIcon,
} from "lucide-react";

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

const groups = [
  {
    label: "Compute",
    items: [
      { id: "services", title: "Services", icon: ServerIcon },
      { id: "databases", title: "Databases", icon: DatabaseIcon },
      { id: "queues", title: "Queues", icon: LayersIcon },
    ],
  },
  {
    label: "Networking",
    items: [
      { id: "domains", title: "Domains", icon: GlobeIcon },
      { id: "webhooks", title: "Webhooks", icon: WebhookIcon },
    ],
  },
  {
    label: "Security",
    items: [
      { id: "secrets", title: "Secrets", icon: KeyRoundIcon },
      { id: "access", title: "Access policies", icon: LockIcon },
      { id: "audit", title: "Audit log", icon: ScrollTextIcon },
    ],
  },
];

export default function Sidebar08() {
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState("databases");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const needle = query.trim().toLowerCase();
  const filtered = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.title.toLowerCase().includes(needle)),
    }))
    .filter((group) => group.items.length > 0);
  const matches = filtered.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div className="w-full max-w-72 rounded-2xl bg-muted/60 p-3">
      <SidebarProvider className="min-h-0 w-full">
        <Sidebar
          collapsible="none"
          role="navigation"
          aria-label="Infrastructure"
          className="h-[26rem] w-full rounded-xl shadow-md ring-1 ring-sidebar-border"
        >
          <SidebarHeader className="p-3">
            <div className="relative">
              <SearchIcon
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <SidebarInput
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter resources"
                aria-label="Filter resources"
                className="pr-8 pl-8 [&::-webkit-search-cancel-button]:hidden"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="absolute top-1/2 right-1.5 flex size-5 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground outline-hidden hover:text-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                >
                  <XIcon aria-hidden="true" className="size-3.5" />
                  <span className="sr-only">Clear filter</span>
                </button>
              ) : null}
            </div>
          </SidebarHeader>
          <SidebarContent>
            <p className="sr-only" aria-live="polite">
              {needle ? `${matches} ${matches === 1 ? "resource" : "resources"} found` : ""}
            </p>
            {filtered.map((group) => (
              <SidebarGroup key={group.label} className="py-1">
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          isActive={active === item.id}
                          aria-current={active === item.id ? "page" : undefined}
                          onClick={() => setActive(item.id)}
                        >
                          <item.icon aria-hidden="true" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-1 px-4 py-8 text-center">
                <p className="text-sm font-medium">No resources match “{query.trim()}”</p>
                <p className="text-xs text-sidebar-foreground/65">
                  Try a shorter term, like “data” or “log”.
                </p>
              </div>
            ) : null}
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </div>
  );
}
