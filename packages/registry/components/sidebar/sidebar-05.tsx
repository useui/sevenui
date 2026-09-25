"use client";

import * as React from "react";
import {
  BookOpenIcon,
  BotIcon,
  ChevronRightIcon,
  Settings2Icon,
  SquareTerminalIcon,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";
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

const sections = [
  {
    id: "playground",
    title: "Playground",
    icon: SquareTerminalIcon,
    pages: ["Prompt history", "Saved runs", "Compare outputs"],
  },
  {
    id: "models",
    title: "Models",
    icon: BotIcon,
    pages: ["Catalog", "Fine-tuned", "Usage limits"],
  },
  {
    id: "guides",
    title: "Guides",
    icon: BookOpenIcon,
    pages: ["Quickstart", "Tool calling", "Evaluations", "Changelog"],
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings2Icon,
    pages: ["API keys", "Team", "Billing"],
  },
];

export default function Sidebar05() {
  // Single mode: opening one section closes the others.
  const [openSection, setOpenSection] = React.useState<string | null>("models");
  const [activePage, setActivePage] = React.useState("models/Fine-tuned");

  return (
    <SidebarProvider className="min-h-0 w-full max-w-64 overflow-hidden rounded-xl border border-sidebar-border">
      <Sidebar
        collapsible="none"
        role="navigation"
        aria-label="Developer console"
        className="h-[26rem] w-full"
      >
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Developer console</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {sections.map((section) => {
                  const hasActivePage = activePage.startsWith(`${section.id}/`);
                  return (
                    <Collapsible
                      key={section.id}
                      open={openSection === section.id}
                      onOpenChange={(open) => setOpenSection(open ? section.id : null)}
                      render={<SidebarMenuItem />}
                    >
                      <CollapsibleTrigger
                        render={
                          <SidebarMenuButton
                            className={hasActivePage ? "font-medium" : undefined}
                          />
                        }
                      >
                        <section.icon aria-hidden="true" />
                        <span>{section.title}</span>
                        <ChevronRightIcon
                          aria-hidden="true"
                          className="ml-auto transition-transform duration-200 ease-out group-data-panel-open/menu-button:rotate-90 motion-reduce:transition-none"
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub className="mt-0.5 mb-1">
                          {section.pages.map((page) => {
                            const key = `${section.id}/${page}`;
                            return (
                              <SidebarMenuSubItem key={key}>
                                <SidebarMenuSubButton
                                  render={<button type="button" />}
                                  className="w-full"
                                  isActive={activePage === key}
                                  aria-current={activePage === key ? "page" : undefined}
                                  onClick={() => setActivePage(key)}
                                >
                                  <span>{page}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
