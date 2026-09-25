"use client";

import * as React from "react";
import { Columns2, Eye, PenLine } from "lucide-react";
import type { GroupImperativeHandle } from "react-resizable-panels";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/registry/base/ui/resizable";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

const presets = [
  { value: "write", label: "Write", icon: PenLine, layout: { source: 75, preview: 25 } },
  { value: "split", label: "Split", icon: Columns2, layout: { source: 50, preview: 50 } },
  { value: "read", label: "Read", icon: Eye, layout: { source: 25, preview: 75 } },
];

const source = [
  "## Release 4.2",
  "",
  "- Faster search on large",
  "  workspaces",
  "- Export boards as CSV",
  "- Fixed a sync issue on",
  "  shared calendars",
];

export default function Resizable05() {
  const groupRef = React.useRef<GroupImperativeHandle | null>(null);
  const [preset, setPreset] = React.useState("split");
  const [animating, setAnimating] = React.useState(false);

  React.useEffect(() => {
    if (!animating) return;
    const timeout = window.setTimeout(() => setAnimating(false), 320);
    return () => window.clearTimeout(timeout);
  }, [animating]);

  function applyPreset(value: string) {
    const next = presets.find((item) => item.value === value);
    if (!next) return;
    setPreset(value);
    setAnimating(true);
    groupRef.current?.setLayout(next.layout);
  }

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span id="resizable-05-label" className="text-sm font-medium">
          Release notes
        </span>
        <ToggleGroup
          aria-labelledby="resizable-05-label"
          variant="outline"
          size="sm"
          spacing={0}
          value={preset ? [preset] : []}
          onValueChange={(next) => {
            if (next.length > 0) applyPreset(next[0]);
          }}
        >
          {presets.map((item) => (
            <ToggleGroupItem
              key={item.value}
              value={item.value}
              aria-label={`${item.label} layout`}
            >
              <item.icon aria-hidden="true" />
              <span className="max-sm:sr-only">{item.label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="h-64 w-full">
        <ResizablePanelGroup
          groupRef={groupRef}
          data-animating={animating || undefined}
          className="rounded-lg border bg-background motion-safe:[&[data-animating]>[data-panel]]:transition-[flex-grow] motion-safe:[&[data-animating]>[data-panel]]:duration-300 motion-safe:[&[data-animating]>[data-panel]]:ease-out"
          onLayoutChanged={(_layout, meta) => {
            // A manual drag or key press leaves every preset behind.
            if (meta.isUserInteraction) setPreset("");
          }}
        >
          <ResizablePanel id="source" defaultSize="50%" minSize="20%">
            <div className="flex h-full flex-col overflow-hidden bg-muted/40">
              <span className="border-b px-3 py-2 text-xs text-muted-foreground">
                release-4-2.md
              </span>
              <pre className="overflow-hidden p-3 font-mono text-xs leading-5 whitespace-pre text-foreground">
                {source.join("\n")}
              </pre>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle aria-label="Resize source and preview" />
          <ResizablePanel id="preview" defaultSize="50%" minSize="20%">
            <div className="flex h-full flex-col overflow-hidden">
              <span className="border-b px-3 py-2 text-xs text-muted-foreground">
                Preview
              </span>
              <div className="flex flex-col gap-2 p-4">
                <h3 className="text-base font-semibold">Release 4.2</h3>
                <ul className="flex list-disc flex-col gap-1 pl-4 text-sm text-muted-foreground">
                  <li>Faster search on large workspaces</li>
                  <li>Export boards as CSV</li>
                  <li>Fixed a sync issue on shared calendars</li>
                </ul>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
