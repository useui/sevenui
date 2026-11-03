"use client";

import { FileIcon, InboxIcon, PlusIcon, SendIcon, SettingsIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/registry/base/ui/sidebar";
import { LabSection } from "../lab-frame";

function Body() {
  return (
    <>
      <SidebarHeader>
        <SidebarInput placeholder="Search" aria-label="Search" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Mail</SidebarGroupLabel>
          <SidebarGroupAction aria-label="Add">
            <PlusIcon />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive tooltip="Inbox">
                  <InboxIcon />
                  <span>Inbox</span>
                </SidebarMenuButton>
                <SidebarMenuBadge>24</SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Drafts">
                  <FileIcon />
                  <span>Drafts</span>
                </SidebarMenuButton>
                <SidebarMenuAction showOnHover aria-label="More">
                  <PlusIcon />
                </SidebarMenuAction>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton variant="outline" tooltip="Sent">
                  <SendIcon />
                  <span>Sent (outline)</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton size="sm">
                  <span>Small button</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton disabled>
                  <span>Disabled</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <span>Settings</span>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton href="#general" isActive>
                      <span>General</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton href="#team">
                      <span>Team</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuSkeleton showIcon />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <SettingsIcon />
              <span>Account (lg)</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}

const SHELLS = [
  { variant: "sidebar", collapsible: "offcanvas", open: true },
  { variant: "floating", collapsible: "offcanvas", open: true },
  { variant: "inset", collapsible: "offcanvas", open: true },
  { variant: "sidebar", collapsible: "icon", open: false },
] as const;

export default function SidebarMatrix() {
  return (
    <div>
      <LabSection title="collapsible=none (static)">
        <div className="h-[30rem] overflow-hidden rounded-md border border-hairline">
          <SidebarProvider className="min-h-0">
            <Sidebar collapsible="none">
              <Body />
            </Sidebar>
          </SidebarProvider>
        </div>
      </LabSection>
      {SHELLS.map(({ variant, collapsible, open }) => (
        <LabSection
          key={`${variant}-${collapsible}`}
          title={`variant=${variant} collapsible=${collapsible} ${open ? "expanded" : "collapsed"} (md+ only)`}
        >
          {/* transform makes the fixed sidebar container position against this box */}
          <div className="h-[30rem] w-full overflow-hidden rounded-md border border-hairline [transform:translateZ(0)]">
            <SidebarProvider defaultOpen={open} className="h-full min-h-0">
              <Sidebar variant={variant} collapsible={collapsible} className="h-full">
                <Body />
              </Sidebar>
              <SidebarInset>
                <div className="flex items-center gap-2 p-2">
                  <SidebarTrigger />
                  <span className="text-sm text-muted-foreground">Main content</span>
                </div>
              </SidebarInset>
            </SidebarProvider>
          </div>
        </LabSection>
      ))}
    </div>
  );
}
