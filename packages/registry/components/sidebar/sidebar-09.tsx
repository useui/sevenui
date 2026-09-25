"use client";

import * as React from "react";
import { PanelRightCloseIcon, PanelRightOpenIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
} from "@/registry/base/ui/sidebar";

const outline = [
  {
    id: "summary",
    title: "Summary",
    children: [],
  },
  {
    id: "rollout",
    title: "Rollout plan",
    children: [
      { id: "rollout-beta", title: "Private beta" },
      { id: "rollout-ga", title: "General availability" },
    ],
  },
  {
    id: "risks",
    title: "Risks",
    children: [
      { id: "risks-latency", title: "Latency budget" },
      { id: "risks-migration", title: "Data migration" },
    ],
  },
  {
    id: "open-questions",
    title: "Open questions",
    children: [],
  },
];

export default function Sidebar09() {
  const [open, setOpen] = React.useState(true);
  const [active, setActive] = React.useState("rollout-beta");

  return (
    <SidebarProvider
      open={open}
      onOpenChange={setOpen}
      className="min-h-0 w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-sidebar-border sm:flex-row"
    >
      <article className="flex min-w-0 flex-1 flex-col gap-3 bg-background p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="text-base font-semibold text-balance">
              Usage-based billing, phase two
            </h3>
            <p className="text-xs text-muted-foreground">
              Design doc · Last edited by Priya Raman, 2 hours ago
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-expanded={open}
            aria-controls="sidebar-09-outline"
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <PanelRightCloseIcon aria-hidden="true" />
            ) : (
              <PanelRightOpenIcon aria-hidden="true" />
            )}
            <span className="sr-only">{open ? "Hide outline" : "Show outline"}</span>
          </Button>
        </div>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          Phase two moves metered customers from monthly estimates to real-time
          usage. Invoices close on the billing anchor and include a per-feature
          breakdown. The beta starts with forty accounts on the Growth plan.
        </p>
      </article>
      {open ? (
        <Sidebar
          id="sidebar-09-outline"
          side="right"
          collapsible="none"
          role="navigation"
          aria-label="Document outline"
          className="h-auto w-full border-t border-sidebar-border sm:w-56 sm:border-t-0 sm:border-l"
        >
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>On this page</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {outline.map((section) => (
                    <SidebarMenuItem key={section.id}>
                      <SidebarMenuButton
                        size="sm"
                        isActive={active === section.id}
                        aria-current={active === section.id ? "location" : undefined}
                        onClick={() => setActive(section.id)}
                      >
                        <span>{section.title}</span>
                      </SidebarMenuButton>
                      {section.children.length > 0 ? (
                        <SidebarMenuSub className="mx-2.5">
                          {section.children.map((child) => (
                            <SidebarMenuSubItem key={child.id}>
                              <SidebarMenuSubButton
                                size="sm"
                                render={<button type="button" />}
                                className="w-full"
                                isActive={active === child.id}
                                aria-current={active === child.id ? "location" : undefined}
                                onClick={() => setActive(child.id)}
                              >
                                <span>{child.title}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      ) : null}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      ) : null}
    </SidebarProvider>
  );
}
