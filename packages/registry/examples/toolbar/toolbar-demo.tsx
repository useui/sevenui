import {
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
} from "lucide-react";

import { Toggle } from "@/registry/base/ui/toggle";
import { ToggleGroup } from "@/registry/base/ui/toggle-group";
import {
  Toolbar,
  ToolbarButton,
  ToolbarLink,
  ToolbarSeparator,
} from "@/registry/base/ui/toolbar";

export default function ToolbarDemo() {
  return (
    <Toolbar>
      <ToggleGroup
        multiple
        defaultValue={["bold"]}
        aria-label="Text formatting"
      >
        <ToolbarButton
          render={<Toggle />}
          aria-label="Toggle bold"
          value="bold"
        >
          <BoldIcon />
        </ToolbarButton>
        <ToolbarButton
          render={<Toggle />}
          aria-label="Toggle italic"
          value="italic"
        >
          <ItalicIcon />
        </ToolbarButton>
        <ToolbarButton
          render={<Toggle />}
          aria-label="Toggle underline"
          value="underline"
        >
          <UnderlineIcon />
        </ToolbarButton>
      </ToggleGroup>
      <ToolbarSeparator />
      <ToggleGroup defaultValue={["align-left"]} aria-label="Alignment">
        <ToolbarButton
          render={<Toggle />}
          aria-label="Align left"
          value="align-left"
        >
          <AlignLeftIcon />
        </ToolbarButton>
        <ToolbarButton
          render={<Toggle />}
          aria-label="Align right"
          value="align-right"
        >
          <AlignRightIcon />
        </ToolbarButton>
      </ToggleGroup>
      <ToolbarSeparator />
      <ToolbarLink href="#">Edited 2 hours ago</ToolbarLink>
    </Toolbar>
  );
}
