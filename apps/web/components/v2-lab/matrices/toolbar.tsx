"use client";

import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react";
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarInput,
  ToolbarLink,
  ToolbarSeparator,
} from "@/registry/base/ui/toolbar";
import { Toggle } from "@/registry/base/ui/toggle";
import { LabSection } from "../lab-frame";

export default function ToolbarMatrix() {
  return (
    <div>
      <LabSection title="horizontal: buttons, pressed toggle, separator, input, link, disabled">
        <Toolbar aria-label="Formatting">
          <ToolbarGroup>
            <ToolbarButton aria-label="Bold">
              <BoldIcon />
            </ToolbarButton>
            <ToolbarButton
              aria-label="Italic"
              render={<Toggle defaultPressed aria-label="Italic" />}
            >
              <ItalicIcon />
            </ToolbarButton>
            <ToolbarButton aria-label="Underline" disabled>
              <UnderlineIcon />
            </ToolbarButton>
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarInput placeholder="Font size" aria-label="Font size" className="w-24" />
          <ToolbarSeparator />
          <ToolbarButton>Share</ToolbarButton>
          <ToolbarLink href="#">Edited 2m ago</ToolbarLink>
        </Toolbar>
      </LabSection>
      <LabSection title="vertical">
        <Toolbar orientation="vertical" aria-label="Vertical formatting">
          <ToolbarButton aria-label="Bold">
            <BoldIcon />
          </ToolbarButton>
          <ToolbarButton aria-label="Italic">
            <ItalicIcon />
          </ToolbarButton>
          <ToolbarSeparator />
          <ToolbarButton aria-label="Underline">
            <UnderlineIcon />
          </ToolbarButton>
        </Toolbar>
      </LabSection>
    </div>
  );
}
