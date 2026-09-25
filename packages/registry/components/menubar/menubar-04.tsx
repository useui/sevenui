"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/registry/base/ui/menubar";

const sections = [
  {
    name: "Workspace",
    items: ["Overview", "Members", "Integrations"],
  },
  {
    name: "Billing",
    items: ["Plan and usage", "Invoices", "Payment methods"],
  },
  {
    name: "Security",
    items: ["Single sign-on", "Audit log", "API tokens"],
  },
  {
    name: "Developer",
    items: ["Webhooks", "Rate limits", "Sandbox keys"],
  },
];

const wideQuery = "(min-width: 640px)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(wideQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

// There is no room beside the rail on phones, so menus drop below instead.
function useWideViewport() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(wideQuery).matches,
    () => true,
  );
}

export default function Menubar04() {
  const wide = useWideViewport();

  return (
    <Menubar
      orientation="vertical"
      aria-label="Settings"
      className="h-auto w-full max-w-48 flex-col items-stretch gap-0.5 p-1"
    >
      {sections.map((section, index) => (
        <MenubarMenu key={section.name}>
          <MenubarTrigger className="justify-between px-2 py-1.5 focus-visible:ring-2 focus-visible:ring-ring/50">
            {section.name}
            <ChevronRight
              aria-hidden="true"
              className="size-3.5 text-muted-foreground"
            />
          </MenubarTrigger>
          <MenubarContent
            side={wide ? "right" : "bottom"}
            align="start"
            sideOffset={wide ? 6 : 4}
          >
            {section.items.map((item) => (
              <MenubarItem key={item}>{item}</MenubarItem>
            ))}
            {index === 0 ? (
              <>
                <MenubarSeparator />
                <MenubarItem variant="destructive">Leave workspace</MenubarItem>
              </>
            ) : null}
          </MenubarContent>
        </MenubarMenu>
      ))}
    </Menubar>
  );
}
