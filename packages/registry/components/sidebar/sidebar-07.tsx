"use client";

import * as React from "react";
import { cn } from "cn";
import {
  BarChart3Icon,
  BellIcon,
  HouseIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SearchIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/registry/base/ui/sidebar";

const items = [
  { id: "home", title: "Home", icon: HouseIcon },
  { id: "search", title: "Search", icon: SearchIcon },
  { id: "analytics", title: "Analytics", icon: BarChart3Icon },
  { id: "customers", title: "Customers", icon: UsersIcon },
  { id: "payouts", title: "Payouts", icon: WalletIcon },
  { id: "alerts", title: "Alerts", icon: BellIcon, badge: 5 },
];

const activity = [
  { label: "Payout to Chase ••4410, Sep 24", value: "$12,480" },
  { label: "Refund, order 58213", value: "−$64" },
  { label: "Payout to Chase ••4410, Sep 17", value: "$9,215" },
];

export default function Sidebar07() {
  // Controlled: the parent owns the expanded state.
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState("analytics");
  const current = items.find((item) => item.id === active) ?? items[0];

  return (
    <SidebarProvider
      open={open}
      onOpenChange={setOpen}
      className="min-h-0 w-full max-w-md overflow-hidden rounded-xl border border-sidebar-border"
    >
      {/* Mirrors the attributes the primitive's collapsible="icon" mode sets, so
          the icon-only styles apply inside an embedded, non-fixed layout. */}
      <div
        className="group flex shrink-0"
        data-state={open ? "expanded" : "collapsed"}
        data-collapsible={open ? "" : "icon"}
      >
        <Sidebar
          id="sidebar-07-rail"
          collapsible="none"
          role="navigation"
          aria-label="Merchant dashboard"
          className={cn(
            "h-80 border-r border-sidebar-border transition-[width] duration-200 ease-out motion-reduce:transition-none",
            open ? "w-52" : "w-12",
          )}
        >
          <SidebarHeader>
            <div className="flex h-8 items-center gap-2 overflow-hidden px-1">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
                L
              </span>
              <span className="truncate text-sm font-semibold group-data-[collapsible=icon]:hidden">
                Ledgerly
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {items.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={active === item.id}
                        aria-current={active === item.id ? "page" : undefined}
                        aria-label={open ? undefined : item.title}
                        onClick={() => setActive(item.id)}
                      >
                        <item.icon aria-hidden="true" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                      {item.badge ? (
                        <SidebarMenuBadge>
                          {item.badge}
                          <span className="sr-only"> new</span>
                        </SidebarMenuBadge>
                      ) : null}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Expand sidebar"
                  aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
                  aria-expanded={open}
                  aria-controls="sidebar-07-rail"
                  onClick={() => setOpen(!open)}
                  className="text-sidebar-foreground/70"
                >
                  {open ? (
                    <PanelLeftCloseIcon aria-hidden="true" />
                  ) : (
                    <PanelLeftOpenIcon aria-hidden="true" />
                  )}
                  <span>Collapse</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-4 bg-background p-4">
        <div className="flex flex-col gap-0.5">
          <h3 className="truncate text-sm font-semibold">{current.title}</h3>
          <p className="truncate text-xs text-muted-foreground">
            Ledgerly · Last 30 days
          </p>
        </div>
        <ul className="flex flex-col divide-y rounded-lg border text-sm">
          {activity.map((row) => (
            <li key={row.label} className="flex items-center justify-between gap-3 px-3 py-2">
              <span className="min-w-0 text-pretty">{row.label}</span>
              <span className="shrink-0 text-muted-foreground tabular-nums">{row.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </SidebarProvider>
  );
}
