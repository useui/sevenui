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
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 12a4 4 0 0 0 0-8H6v8M15 20a4 4 0 0 0 0-8H6v8Z" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          render={<Toggle />}
          aria-label="Toggle italic"
          value="italic"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 4h-9M14 20H5M15 4 9 20" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          render={<Toggle />}
          aria-label="Toggle underline"
          value="underline"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 4v6a6 6 0 0 0 12 0V4M4 20h16" />
          </svg>
        </ToolbarButton>
      </ToggleGroup>
      <ToolbarSeparator />
      <ToggleGroup defaultValue={["align-left"]} aria-label="Alignment">
        <ToolbarButton
          render={<Toggle />}
          aria-label="Align left"
          value="align-left"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="21" y1="6" x2="3" y2="6" />
            <line x1="15" y1="12" x2="3" y2="12" />
            <line x1="17" y1="18" x2="3" y2="18" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          render={<Toggle />}
          aria-label="Align right"
          value="align-right"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="21" y1="6" x2="3" y2="6" />
            <line x1="21" y1="12" x2="9" y2="12" />
            <line x1="21" y1="18" x2="7" y2="18" />
          </svg>
        </ToolbarButton>
      </ToggleGroup>
      <ToolbarSeparator />
      <ToolbarLink href="#">Edited 2 hours ago</ToolbarLink>
    </Toolbar>
  );
}
