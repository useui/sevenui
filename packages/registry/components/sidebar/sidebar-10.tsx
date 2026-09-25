"use client";

import * as React from "react";
import {
  CheckIcon,
  ChevronsUpDownIcon,
  CircleHelpIcon,
  FileBarChartIcon,
  InboxIcon,
  LayoutGridIcon,
  LogInIcon,
  LogOutIcon,
  PlusIcon,
  SettingsIcon,
  UserRoundIcon,
  UsersIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "@/registry/base/ui/sidebar";

const initialWorkspaces = [
  { id: "acme", name: "Acme Support", plan: "Business", initials: "AS" },
  { id: "helios", name: "Helios Labs", plan: "Starter", initials: "HL" },
];

const primary = [
  { id: "inbox", title: "Inbox", icon: InboxIcon, badge: 12 },
  { id: "views", title: "Views", icon: LayoutGridIcon },
  { id: "reports", title: "Reports", icon: FileBarChartIcon },
  { id: "customers", title: "Customers", icon: UsersIcon },
];

const secondary = [
  { id: "settings", title: "Settings", icon: SettingsIcon },
  { id: "help", title: "Help center", icon: CircleHelpIcon },
];

// Reached from the account menu, not listed in the navigation.
const account = [{ id: "profile", title: "Profile", icon: UserRoundIcon }];

const summaries: Record<string, string> = {
  inbox: "12 open conversations. The oldest has waited 2 hours for a first reply.",
  views: "Saved filters for VIP customers, SLA breaches and unassigned tickets.",
  reports: "Median first reply time this week is 18 minutes, down from 26.",
  customers: "4,812 customers, 37 of them with an open conversation.",
  settings: "Business hours, routing rules and canned replies.",
  help: "Guides for setting up channels, macros and automations.",
  profile: "Maya Okafor, support lead. Signed in as maya@acmesupport.com.",
};

export default function Sidebar10() {
  const [workspaces, setWorkspaces] = React.useState(initialWorkspaces);
  const [workspaceId, setWorkspaceId] = React.useState("acme");
  const [active, setActive] = React.useState("inbox");
  const [signedIn, setSignedIn] = React.useState(true);
  const workspace = workspaces.find((item) => item.id === workspaceId) ?? workspaces[0];
  const current =
    [...primary, ...secondary, ...account].find((item) => item.id === active) ?? primary[0];

  function createWorkspace() {
    const count = workspaces.length - initialWorkspaces.length + 1;
    const id = `workspace-${count}`;
    setWorkspaces((items) => [
      ...items,
      { id, name: `New workspace ${count}`, plan: "Trial", initials: `N${count}` },
    ]);
    setWorkspaceId(id);
  }

  return (
    <SidebarProvider className="min-h-0 w-full max-w-3xl overflow-hidden rounded-xl border border-sidebar-border">
      <Sidebar
        collapsible="none"
        role="navigation"
        aria-label={workspace.name}
        className="h-[28rem] w-full border-sidebar-border sm:w-60 sm:border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuButton
                      size="lg"
                      className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
                    />
                  }
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
                    {workspace.initials}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="truncate font-medium">{workspace.name}</span>
                    <span className="truncate text-xs text-sidebar-foreground/65">
                      {workspace.plan} plan
                    </span>
                  </span>
                  <ChevronsUpDownIcon aria-hidden="true" className="ml-auto opacity-60" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
                    {workspaces.map((item) => (
                      <DropdownMenuItem key={item.id} onClick={() => setWorkspaceId(item.id)}>
                        <span className="flex size-6 items-center justify-center rounded-md border border-border text-[0.65rem] font-semibold">
                          {item.initials}
                        </span>
                        {item.name}
                        {item.id === workspaceId ? (
                          <CheckIcon aria-hidden="true" className="ml-auto" />
                        ) : null}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={createWorkspace}>
                    <PlusIcon aria-hidden="true" />
                    Create workspace
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Support</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {primary.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={active === item.id}
                      aria-current={active === item.id ? "page" : undefined}
                      onClick={() => setActive(item.id)}
                    >
                      <item.icon aria-hidden="true" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {item.badge ? (
                      <SidebarMenuBadge>
                        {item.badge}
                        <span className="sr-only"> open conversations</span>
                      </SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                {secondary.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      size="sm"
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
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              {signedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <SidebarMenuButton
                        size="lg"
                        className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
                      />
                    }
                  >
                    <Avatar className="rounded-lg after:rounded-lg">
                      <AvatarImage src="/placeholder.svg" alt="" className="rounded-lg" />
                      <AvatarFallback className="rounded-lg">MO</AvatarFallback>
                    </Avatar>
                    <span className="flex min-w-0 flex-1 flex-col leading-tight">
                      <span className="truncate font-medium">Maya Okafor</span>
                      <span className="truncate text-xs text-sidebar-foreground/65">
                        maya@acmesupport.com
                      </span>
                    </span>
                    <ChevronsUpDownIcon aria-hidden="true" className="ml-auto opacity-60" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" className="w-56">
                    <DropdownMenuItem onClick={() => setActive("profile")}>
                      <UserRoundIcon aria-hidden="true" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActive("settings")}>
                      <SettingsIcon aria-hidden="true" />
                      Preferences
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSignedIn(false)}>
                      <LogOutIcon aria-hidden="true" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <SidebarMenuButton size="lg" onClick={() => setSignedIn(true)}>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-sidebar-border">
                    <LogInIcon aria-hidden="true" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="truncate font-medium">Sign in</span>
                    <span className="truncate text-xs text-sidebar-foreground/65">
                      You are signed out
                    </span>
                  </span>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="hidden min-w-0 sm:flex">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4 text-sm">
          <span className="truncate text-muted-foreground">{workspace.name}</span>
          <span aria-hidden="true" className="text-muted-foreground">
            /
          </span>
          <span className="truncate font-medium">{current.title}</span>
        </header>
        <div className="flex flex-1 flex-col gap-1 p-4">
          <h2 className="text-sm font-medium">{current.title}</h2>
          <p className="max-w-prose text-sm text-muted-foreground">
            {summaries[current.id]}
          </p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
