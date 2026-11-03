"use client";

import * as React from "react";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/registry/base/ui/context-menu";
import { LabSection } from "../lab-frame";

/** Popups portal to <body>; carry the cell's theme and density onto them. */
function useCellAttrs() {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [attrs, setAttrs] = React.useState<Record<string, string | undefined>>({});
  React.useLayoutEffect(() => {
    const el = ref.current?.closest<HTMLElement>("[data-lab-cell]");
    setAttrs({ "data-theme": el?.dataset.theme, "data-density": el?.dataset.density });
  }, []);
  return { ref, attrs };
}

export default function ContextMenuMatrix() {
  const { ref, attrs } = useCellAttrs();
  const [bookmarks, setBookmarks] = React.useState(true);
  const [person, setPerson] = React.useState("pedro");
  return (
    <div>
      <span ref={ref} hidden />
      <LabSection title="right-click (or Shift+F10) inside the area to open">
        <ContextMenu>
          <ContextMenuTrigger className="flex h-36 w-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            Right click here
          </ContextMenuTrigger>
          <ContextMenuContent className="w-56" {...attrs}>
            <ContextMenuGroup>
              <ContextMenuLabel>Navigation</ContextMenuLabel>
              <ContextMenuItem>
                Back
                <ContextMenuShortcut>⌘[</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem disabled>
                Forward (disabled)
                <ContextMenuShortcut>⌘]</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem inset>Reload</ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSub>
              <ContextMenuSubTrigger>More tools</ContextMenuSubTrigger>
              <ContextMenuSubContent {...attrs}>
                <ContextMenuItem>Save page</ContextMenuItem>
                <ContextMenuItem>Developer tools</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuCheckboxItem checked={bookmarks} onCheckedChange={setBookmarks}>
              Show bookmarks
            </ContextMenuCheckboxItem>
            <ContextMenuCheckboxItem checked={false}>Show full URLs</ContextMenuCheckboxItem>
            <ContextMenuSeparator />
            <ContextMenuRadioGroup value={person} onValueChange={(v) => setPerson(v as string)}>
              <ContextMenuRadioItem value="pedro">Pedro Duarte</ContextMenuRadioItem>
              <ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </LabSection>
    </div>
  );
}
