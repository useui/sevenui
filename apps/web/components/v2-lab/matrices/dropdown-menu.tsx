"use client";

import * as React from "react";
import { LogOutIcon, SettingsIcon, UserIcon } from "lucide-react";
import { Button } from "@/registry/base/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";
import { LabSection } from "../lab-frame";

/**
 * Popups portal to <body>, outside the lab cell. Reading the cell's theme and
 * density and setting them on the popup keeps each open menu in its cell's look.
 */
function useCell() {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [cell, setCell] = React.useState<{ theme?: string; density?: string } | null>(null);
  React.useLayoutEffect(() => {
    const el = ref.current?.closest<HTMLElement>("[data-lab-cell]");
    setCell({ theme: el?.dataset.theme, density: el?.dataset.density });
  }, []);
  return { ref, cell, attrs: { "data-theme": cell?.theme, "data-density": cell?.density } };
}

function MenuBody({ attrs }: { attrs: Record<string, string | undefined> }) {
  const [bar, setBar] = React.useState(true);
  const [panel, setPanel] = React.useState("bottom");
  return (
    <DropdownMenuContent className="w-56" {...attrs}>
      <DropdownMenuGroup>
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuItem>
          <UserIcon />
          Profile
          <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <SettingsIcon />
          Settings
          <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>API (disabled)</DropdownMenuItem>
        <DropdownMenuItem inset>Inset item</DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuCheckboxItem checked={bar} onCheckedChange={setBar}>
        Status bar
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem checked={false}>Activity bar</DropdownMenuCheckboxItem>
      <DropdownMenuSeparator />
      <DropdownMenuRadioGroup value={panel} onValueChange={(v) => setPanel(v as string)}>
        <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
      <DropdownMenuSeparator />
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>More tools</DropdownMenuSubTrigger>
        <DropdownMenuSubContent {...attrs}>
          <DropdownMenuItem>Save page</DropdownMenuItem>
          <DropdownMenuItem>Developer tools</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuItem variant="destructive">
        <LogOutIcon />
        Log out
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}

export default function DropdownMenuMatrix() {
  const { ref, cell, attrs } = useCell();
  return (
    <div>
      <span ref={ref} hidden />
      <LabSection title="closed trigger (click or Enter / ArrowDown to open)">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>Open menu</DropdownMenuTrigger>
          <MenuBody attrs={attrs} />
        </DropdownMenu>
      </LabSection>
      <LabSection title="open (defaultOpen, non-modal) — popup carries the cell theme/density">
        <div className="h-[26rem] w-full">
          {cell ? (
            <DropdownMenu defaultOpen modal={false}>
              <DropdownMenuTrigger render={<Button variant="outline" />}>Account</DropdownMenuTrigger>
              <MenuBody attrs={attrs} />
            </DropdownMenu>
          ) : null}
        </div>
      </LabSection>
    </div>
  );
}
