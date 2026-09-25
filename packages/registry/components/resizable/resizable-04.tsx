"use client";

import * as React from "react";
import {
  CalendarDays,
  ChartNoAxesColumn,
  FolderKanban,
  Inbox,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from "lucide-react";
import type { PanelImperativeHandle } from "react-resizable-panels";

import { Button } from "@/registry/base/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/registry/base/ui/resizable";

const links = [
  { label: "Inbox", icon: Inbox, count: 12 },
  { label: "Projects", icon: FolderKanban },
  { label: "Calendar", icon: CalendarDays },
  { label: "Reports", icon: ChartNoAxesColumn },
  { label: "Settings", icon: Settings },
];

const projects = [
  { name: "Checkout redesign", due: "Due Oct 4", progress: "8 of 11 tasks" },
  { name: "Mobile onboarding", due: "Due Oct 18", progress: "3 of 9 tasks" },
  { name: "Billing migration", due: "Due Nov 2", progress: "1 of 14 tasks" },
];

export default function Resizable04() {
  const sidebarRef = React.useRef<PanelImperativeHandle | null>(null);
  const [collapsed, setCollapsed] = React.useState(false);
  const [activeLink, setActiveLink] = React.useState("Projects");

  function toggleSidebar() {
    const panel = sidebarRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) panel.expand();
    else panel.collapse();
  }

  return (
    <div className="h-80 w-full max-w-2xl">
      <ResizablePanelGroup className="rounded-lg border bg-background">
        <ResizablePanel
          id="sidebar"
          panelRef={sidebarRef}
          collapsible
          collapsedSize="52px"
          defaultSize="30%"
          minSize="22%"
          maxSize="40%"
          onResize={() => {
            setCollapsed(sidebarRef.current?.isCollapsed() ?? false);
          }}
          className="bg-muted/40"
        >
          <nav
            id="resizable-04-sidebar"
            aria-label="Workspace"
            className="@container flex h-full flex-col gap-0.5 overflow-hidden p-2"
          >
            {links.map((link) => (
              <a
                key={link.label}
                href={`#${link.label.toLowerCase()}`}
                aria-current={link.label === activeLink ? "page" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  setActiveLink(link.label);
                }}
                aria-label={collapsed ? link.label : undefined}
                title={collapsed ? link.label : undefined}
                className="flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-background aria-[current=page]:font-medium aria-[current=page]:text-foreground aria-[current=page]:shadow-xs"
              >
                <link.icon aria-hidden="true" className="size-4 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="sr-only @[8rem]:not-sr-only @[8rem]:truncate">
                      {link.label}
                    </span>
                    {link.count ? (
                      <span className="ml-auto hidden text-xs tabular-nums @[8rem]:inline">
                        {link.count}
                      </span>
                    ) : null}
                  </>
                )}
              </a>
            ))}
          </nav>
        </ResizablePanel>
        <ResizableHandle withHandle aria-label="Resize sidebar" />
        <ResizablePanel id="main" defaultSize="70%" minSize="50%">
          <div className="flex h-full flex-col overflow-hidden">
            <header className="flex items-center gap-2 border-b px-3 py-2">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-controls="resizable-04-sidebar"
                aria-expanded={!collapsed}
                onClick={toggleSidebar}
              >
                {collapsed ? (
                  <PanelLeftOpen aria-hidden="true" />
                ) : (
                  <PanelLeftClose aria-hidden="true" />
                )}
              </Button>
              <h3 className="text-sm font-medium">Projects</h3>
            </header>
            <ul className="flex flex-col divide-y">
              {projects.map((project) => (
                <li
                  key={project.name}
                  className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 px-4 py-3"
                >
                  <span className="truncate text-sm font-medium">
                    {project.name}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {project.progress} · {project.due}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
