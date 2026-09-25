"use client";

import * as React from "react";
import {
  CreditCardIcon,
  DatabaseIcon,
  HeadsetIcon,
  MegaphoneIcon,
  SheetIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/registry/base/ui/sidebar";

type Health = "synced" | "syncing" | "failed";

const sources: {
  id: string;
  title: string;
  status: string;
  health: Health;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}[] = [
  {
    id: "postgres",
    title: "Production Postgres",
    status: "Synced 4 min ago · 1.2M rows",
    health: "synced",
    icon: DatabaseIcon,
  },
  {
    id: "stripe",
    title: "Stripe",
    status: "Syncing invoices, 62%",
    health: "syncing",
    icon: CreditCardIcon,
  },
  {
    id: "hubspot",
    title: "HubSpot",
    status: "Token expired, reconnect",
    health: "failed",
    icon: MegaphoneIcon,
  },
  {
    id: "zendesk",
    title: "Zendesk",
    status: "Synced 1 hr ago · 48k tickets",
    health: "synced",
    icon: HeadsetIcon,
  },
  {
    id: "sheets",
    title: "Google Sheets",
    status: "Synced yesterday · 3 sheets",
    health: "synced",
    icon: SheetIcon,
  },
];

const healthDot: Record<Health, string> = {
  synced: "bg-success",
  syncing: "bg-warning animate-pulse motion-reduce:animate-none",
  failed: "bg-destructive",
};

const healthLabel: Record<Health, string> = {
  synced: "Healthy",
  syncing: "Sync in progress",
  failed: "Needs attention",
};

export default function Sidebar03() {
  const [active, setActive] = React.useState("stripe");

  return (
    <SidebarProvider className="min-h-0 w-full max-w-72 overflow-hidden rounded-xl border border-sidebar-border">
      <Sidebar
        collapsible="none"
        role="navigation"
        aria-label="Data sources"
        className="w-full"
      >
        <SidebarContent>
          <SidebarGroup className="p-3">
            <SidebarGroupLabel className="mb-1">Data sources</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {sources.map((source) => (
                  <SidebarMenuItem key={source.id}>
                    <SidebarMenuButton
                      variant="outline"
                      size="lg"
                      isActive={active === source.id}
                      aria-current={active === source.id ? "page" : undefined}
                      onClick={() => setActive(source.id)}
                      className="h-14 gap-3 px-2.5 data-active:bg-background data-active:shadow-[0_0_0_1px_var(--sidebar-ring)]"
                    >
                      <span className="relative flex size-9 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-sidebar-accent-foreground group-data-active/menu-button:bg-sidebar-primary group-data-active/menu-button:text-sidebar-primary-foreground">
                        <source.icon aria-hidden="true" />
                        <span
                          aria-hidden="true"
                          className={`absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-background ${healthDot[source.health]}`}
                        />
                      </span>
                      <span className="flex min-w-0 flex-col gap-0.5 leading-tight">
                        <span className="truncate font-medium">{source.title}</span>
                        <span
                          className={
                            source.health === "failed"
                              ? "truncate text-xs text-destructive"
                              : "truncate text-xs text-sidebar-foreground/65"
                          }
                        >
                          <span className="sr-only">{healthLabel[source.health]}. </span>
                          {source.status}
                        </span>
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
