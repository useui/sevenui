"use client";

import * as React from "react";
import {
  CalendarDaysIcon,
  ChartColumnIcon,
  CreditCardIcon,
  FolderKanbanIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/registry/base/ui/sidebar";

const groups = [
  {
    label: "Workspace",
    items: [
      { id: "overview", title: "Overview", icon: LayoutDashboardIcon },
      { id: "projects", title: "Projects", icon: FolderKanbanIcon },
      { id: "calendar", title: "Calendar", icon: CalendarDaysIcon },
      { id: "reports", title: "Reports", icon: ChartColumnIcon },
    ],
  },
  {
    label: "Organization",
    items: [
      { id: "members", title: "Members", icon: UsersIcon },
      { id: "billing", title: "Billing", icon: CreditCardIcon },
      { id: "settings", title: "Settings", icon: SettingsIcon },
    ],
  },
];

export default function Sidebar01() {
  const [active, setActive] = React.useState("overview");

  return (
    <SidebarProvider className="min-h-0 w-full max-w-64 overflow-hidden rounded-xl border border-sidebar-border">
      <Sidebar
        collapsible="none"
        role="navigation"
        aria-label="Workspace"
        className="h-[26rem] w-full"
      >
        <SidebarHeader className="px-4 pt-4 pb-2">
          <span className="text-sm font-semibold">Northwind Studio</span>
        </SidebarHeader>
        <SidebarContent>
          {groups.map((group) => (
            <SidebarGroup key={group.label}>
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
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
