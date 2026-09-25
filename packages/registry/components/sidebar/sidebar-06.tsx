"use client";

import * as React from "react";
import {
  CircleAlertIcon,
  FolderIcon,
  FolderPlusIcon,
  RotateCwIcon,
} from "lucide-react";

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
  SidebarMenuSkeleton,
  SidebarProvider,
} from "@/registry/base/ui/sidebar";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Status = "ready" | "loading" | "empty" | "error";

const statuses: { value: Status; label: string }[] = [
  { value: "ready", label: "Ready" },
  { value: "loading", label: "Loading" },
  { value: "empty", label: "Empty" },
  { value: "error", label: "Error" },
];

const initialProjects = [
  "Checkout redesign",
  "Q4 pricing test",
  "Partner portal",
  "Onboarding emails",
  "Mobile release 3.8",
];

export default function Sidebar06() {
  const [status, setStatus] = React.useState<Status>("ready");
  const [projects, setProjects] = React.useState(initialProjects);
  const [active, setActive] = React.useState(initialProjects[0]);
  const [retrying, setRetrying] = React.useState(false);

  // A retry shows the loading state briefly, then resolves.
  React.useEffect(() => {
    if (!retrying) return;
    const timer = window.setTimeout(() => {
      setRetrying(false);
      setStatus("ready");
    }, 1600);
    return () => window.clearTimeout(timer);
  }, [retrying]);

  return (
    <div className="flex w-full max-w-64 flex-col gap-3">
      <ToggleGroup
        aria-label="Preview state"
        variant="outline"
        size="sm"
        spacing={0}
        value={[status]}
        onValueChange={(next) => {
          if (next.length === 0) return;
          setRetrying(false);
          setStatus(next[0] as Status);
        }}
        className="w-full"
      >
        {statuses.map((item) => (
          <ToggleGroupItem
            key={item.value}
            value={item.value}
            className="flex-1 px-1 aria-pressed:bg-accent aria-pressed:text-accent-foreground"
          >
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <SidebarProvider className="min-h-0 w-full overflow-hidden rounded-xl border border-sidebar-border">
        <Sidebar
          collapsible="none"
          role="navigation"
          aria-label="Projects"
          className="h-72 w-full"
        >
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Recent projects</SidebarGroupLabel>
              <SidebarGroupContent aria-live="polite" aria-busy={status === "loading"}>
                {status === "ready" ? (
                  <SidebarMenu>
                    {projects.map((project) => (
                      <SidebarMenuItem key={project}>
                        <SidebarMenuButton
                          isActive={active === project}
                          aria-current={active === project ? "page" : undefined}
                          onClick={() => setActive(project)}
                        >
                          <FolderIcon aria-hidden="true" />
                          <span>{project}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                ) : null}

                {status === "loading" ? (
                  <SidebarMenu aria-label="Loading projects">
                    {projects.map((project) => (
                      <SidebarMenuItem key={project}>
                        <SidebarMenuSkeleton showIcon />
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                ) : null}

                {status === "empty" ? (
                  <div className="mx-2 mt-1 flex flex-col items-start gap-3 rounded-lg border border-dashed border-sidebar-border p-3">
                    <p className="text-xs text-sidebar-foreground/70">
                      No projects yet. Projects you create or join show up here.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const count = projects.length - initialProjects.length + 1;
                        const name = `Untitled project ${count}`;
                        setProjects((current) => [name, ...current]);
                        setActive(name);
                        setStatus("ready");
                      }}
                    >
                      <FolderPlusIcon aria-hidden="true" />
                      New project
                    </Button>
                  </div>
                ) : null}

                {status === "error" ? (
                  <div
                    role="alert"
                    className="mx-2 mt-1 flex flex-col items-start gap-3 rounded-lg bg-destructive/10 p-3"
                  >
                    <p className="flex gap-2 text-xs text-destructive">
                      <CircleAlertIcon aria-hidden="true" className="mt-px size-3.5 shrink-0" />
                      Couldn’t load projects. Check your connection and try again.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setStatus("loading");
                        setRetrying(true);
                      }}
                    >
                      <RotateCwIcon aria-hidden="true" />
                      Retry
                    </Button>
                  </div>
                ) : null}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </div>
  );
}
