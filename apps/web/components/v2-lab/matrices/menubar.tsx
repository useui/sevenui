"use client";

import * as React from "react";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/registry/base/ui/menubar";
import { LabSection } from "../lab-frame";

/** Popups portal to <body>; carry the cell's theme and density onto them. */
function useCell() {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [cell, setCell] = React.useState<Record<string, string | undefined> | null>(null);
  React.useLayoutEffect(() => {
    const el = ref.current?.closest<HTMLElement>("[data-lab-cell]");
    setCell({ "data-theme": el?.dataset.theme, "data-density": el?.dataset.density });
  }, []);
  return { ref, cell };
}

function Bar({
  attrs,
  openFile = false,
}: {
  attrs: Record<string, string | undefined>;
  openFile?: boolean;
}) {
  const [bookmarks, setBookmarks] = React.useState(true);
  const [profile, setProfile] = React.useState("benoit");
  return (
    <Menubar className="w-fit">
      <MenubarMenu defaultOpen={openFile} modal={false}>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent {...attrs}>
          <MenubarItem>
            New tab
            <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            New window
            <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>New incognito window</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Share</MenubarSubTrigger>
            <MenubarSubContent {...attrs}>
              <MenubarItem>Email link</MenubarItem>
              <MenubarItem>Messages</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem variant="destructive">Close window</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent {...attrs}>
          <MenubarCheckboxItem checked={bookmarks} onCheckedChange={setBookmarks}>
            Always show bookmarks
          </MenubarCheckboxItem>
          <MenubarCheckboxItem checked={false}>Always show full URLs</MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarItem inset>Reload</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Profiles</MenubarTrigger>
        <MenubarContent {...attrs}>
          <MenubarGroup>
            <MenubarLabel>Switch profile</MenubarLabel>
            <MenubarRadioGroup value={profile} onValueChange={(v) => setProfile(v as string)}>
              <MenubarRadioItem value="andy">Andy</MenubarRadioItem>
              <MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarGroup>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu disabled>
        <MenubarTrigger disabled>Disabled</MenubarTrigger>
        <MenubarContent {...attrs}>
          <MenubarItem>Unreachable</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

export default function MenubarMatrix() {
  const { ref, cell } = useCell();
  return (
    <div>
      <span ref={ref} hidden />
      <LabSection title="closed (Tab to the bar, arrows between menus)">
        <Bar attrs={cell ?? {}} />
      </LabSection>
      <LabSection title="File open (defaultOpen, non-modal)">
        <div className="h-72 w-full">{cell ? <Bar attrs={cell} openFile /> : null}</div>
      </LabSection>
    </div>
  );
}
