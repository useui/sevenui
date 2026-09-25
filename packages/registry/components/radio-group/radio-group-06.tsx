"use client";

import { Label } from "@/registry/base/ui/label";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

type Layout = "sidebar" | "topbar" | "split";

const layouts: { value: Layout; label: string; hint: string }[] = [
  { value: "sidebar", label: "Sidebar", hint: "Navigation on the left" },
  { value: "topbar", label: "Top bar", hint: "Navigation across the top" },
  { value: "split", label: "Split view", hint: "List and detail side by side" },
];

// A miniature wireframe of each layout, drawn with theme tokens only so it
// follows light and dark mode.
function Wireframe({ layout }: { layout: Layout }) {
  const block =
    "rounded-[3px] bg-muted-foreground/20 transition-colors group-has-data-checked/tile:bg-primary/25";

  return (
    <span
      aria-hidden="true"
      className="flex aspect-[4/3] w-full gap-1 overflow-hidden rounded-md border border-border bg-background p-1.5"
    >
      {layout === "sidebar" ? (
        <>
          <span className={`w-1/4 ${block}`} />
          <span className="flex flex-1 flex-col gap-1">
            <span className={`h-2 w-2/3 ${block}`} />
            <span className="flex-1 rounded-[3px] bg-muted" />
          </span>
        </>
      ) : null}
      {layout === "topbar" ? (
        <span className="flex flex-1 flex-col gap-1">
          <span className={`h-2.5 ${block}`} />
          <span className="flex flex-1 gap-1">
            <span className="flex-1 rounded-[3px] bg-muted" />
            <span className="flex-1 rounded-[3px] bg-muted" />
          </span>
        </span>
      ) : null}
      {layout === "split" ? (
        <>
          <span className="flex w-2/5 flex-col gap-1">
            <span className={`h-2 ${block}`} />
            <span className={`h-2 ${block}`} />
            <span className={`h-2 ${block}`} />
          </span>
          <span className="flex-1 rounded-[3px] bg-muted" />
        </>
      ) : null}
    </span>
  );
}

export default function RadioGroup06() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p id="radio-group-06-label" className="text-sm font-medium">
          Workspace layout
        </p>
        <p id="radio-group-06-hint" className="text-sm text-muted-foreground">
          Applies to everyone in Northwind after a page refresh.
        </p>
      </div>
      <RadioGroup
        defaultValue="sidebar"
        aria-labelledby="radio-group-06-label"
        aria-describedby="radio-group-06-hint"
        className="grid-cols-3 gap-2 sm:gap-3"
      >
        {layouts.map((layout) => (
          <Label
            key={layout.value}
            className="group/tile min-w-0 cursor-pointer flex-col items-stretch gap-2 rounded-lg p-1.5 font-normal transition-colors hover:bg-muted/50 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
          >
            <span className="rounded-md ring-2 ring-transparent transition-shadow group-has-data-checked/tile:ring-primary">
              <Wireframe layout={layout.value} />
            </span>
            <span className="flex flex-col items-center gap-1.5 text-center sm:flex-row sm:items-start sm:gap-2 sm:text-left">
              <RadioGroupItem
                value={layout.value}
                className="mt-px focus-visible:ring-0"
              />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="font-medium">{layout.label}</span>
                <span className="hidden text-xs leading-snug text-muted-foreground sm:block">
                  {layout.hint}
                </span>
              </span>
            </span>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
}
