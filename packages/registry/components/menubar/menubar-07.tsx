"use client";

import * as React from "react";
import { LogOut, Settings, UserRound } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarTrigger,
} from "@/registry/base/ui/menubar";

const workspaces = [
  { id: "northwind", name: "Northwind Studio", initials: "NS" },
  { id: "acme", name: "Acme Logistics", initials: "AL" },
  { id: "fieldnotes", name: "Fieldnotes", initials: "FN" },
];

const pillTrigger =
  "rounded-full px-3 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 aria-expanded:bg-primary aria-expanded:text-primary-foreground";

export default function Menubar07() {
  const [workspace, setWorkspace] = React.useState("northwind");
  const current = workspaces.find((item) => item.id === workspace);

  return (
    <Menubar
      aria-label="Workspace"
      className="h-10 w-full max-w-md gap-1 rounded-full bg-card p-1 shadow-sm"
    >
      <MenubarMenu>
        <MenubarTrigger className={pillTrigger}>Projects</MenubarTrigger>
        <MenubarContent className="rounded-xl" sideOffset={10}>
          <MenubarItem>Spring campaign</MenubarItem>
          <MenubarItem>Website refresh</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>All projects</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger className={pillTrigger}>Reports</MenubarTrigger>
        <MenubarContent className="rounded-xl" sideOffset={10}>
          <MenubarItem>Weekly summary</MenubarItem>
          <MenubarItem>Time tracking</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger
          aria-label={`Account menu, ${current?.name}`}
          className="ml-auto rounded-full p-0 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring/50 aria-expanded:bg-transparent aria-expanded:ring-2 aria-expanded:ring-primary/40"
        >
          <Avatar size="sm">
            <AvatarFallback>MR</AvatarFallback>
          </Avatar>
        </MenubarTrigger>
        <MenubarContent
          align="end"
          alignOffset={0}
          sideOffset={10}
          className="min-w-56 rounded-xl"
        >
          <MenubarGroup>
            <MenubarLabel className="flex flex-col py-1.5">
              <span>Maya Rodriguez</span>
              <span className="text-xs font-normal text-muted-foreground">
                maya@northwind.studio
              </span>
            </MenubarLabel>
          </MenubarGroup>
          <MenubarSeparator />
          <MenubarGroup>
            <MenubarLabel className="text-xs font-normal text-muted-foreground">
              Workspace
            </MenubarLabel>
            <MenubarRadioGroup value={workspace} onValueChange={setWorkspace}>
              {workspaces.map((item) => (
                <MenubarRadioItem key={item.id} value={item.id}>
                  <span
                    aria-hidden="true"
                    className="flex size-5 items-center justify-center rounded-md bg-muted text-[10px] font-medium"
                  >
                    {item.initials}
                  </span>
                  {item.name}
                </MenubarRadioItem>
              ))}
            </MenubarRadioGroup>
          </MenubarGroup>
          <MenubarSeparator />
          <MenubarItem>
            <UserRound aria-hidden="true" />
            Profile
          </MenubarItem>
          <MenubarItem>
            <Settings aria-hidden="true" />
            Preferences
          </MenubarItem>
          <MenubarItem variant="destructive">
            <LogOut aria-hidden="true" />
            Sign out
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
