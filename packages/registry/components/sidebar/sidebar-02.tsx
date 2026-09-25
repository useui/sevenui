"use client";

import * as React from "react";

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

const sections = [
  {
    label: "Getting started",
    pages: ["Introduction", "Installation", "Project structure", "Deploying"],
  },
  {
    label: "Core concepts",
    pages: ["Routing", "Data fetching", "Caching", "Middleware", "Environment variables"],
  },
  {
    label: "API reference",
    pages: ["Configuration", "CLI commands", "Error codes"],
  },
];

export default function Sidebar02() {
  const [active, setActive] = React.useState("Data fetching");

  return (
    <SidebarProvider className="min-h-0 w-full max-w-60 overflow-hidden rounded-xl border border-sidebar-border">
      <Sidebar
        collapsible="none"
        role="navigation"
        aria-label="Documentation"
        className="h-[26rem] w-full"
      >
        <SidebarHeader className="flex-row items-baseline justify-between px-4 pt-4 pb-1">
          <span className="text-sm font-semibold">Docs</span>
          <span className="text-xs text-sidebar-foreground/60 tabular-nums">v4.2</span>
        </SidebarHeader>
        <SidebarContent className="pb-2">
          {sections.map((section) => (
            <SidebarGroup key={section.label} className="py-1">
              <SidebarGroupLabel className="h-7 text-[0.7rem] tracking-wide uppercase">
                {section.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="ml-2 border-l border-sidebar-border">
                  {section.pages.map((page) => (
                    <SidebarMenuItem key={page}>
                      <SidebarMenuButton
                        size="sm"
                        isActive={active === page}
                        aria-current={active === page ? "page" : undefined}
                        onClick={() => setActive(page)}
                        className="relative rounded-l-none pl-3 text-sidebar-foreground/75 before:absolute before:inset-y-1 before:-left-px before:w-px before:bg-transparent before:transition-colors data-active:bg-transparent data-active:text-sidebar-foreground data-active:before:bg-sidebar-primary"
                      >
                        <span>{page}</span>
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
