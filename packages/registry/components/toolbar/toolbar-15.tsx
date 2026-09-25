"use client";

import {
  HandIcon,
  MessageCirclePlusIcon,
  MinusIcon,
  MousePointer2Icon,
  PlusIcon,
  Undo2Icon,
} from "lucide-react";
import { type MouseEvent, useEffect, useRef, useState } from "react";

import { Toggle } from "@/registry/base/ui/toggle";
import { ToggleGroup } from "@/registry/base/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/registry/base/ui/toolbar";

type Tool = "select" | "hand" | "comment";
type Pin = { id: number; x: number; y: number; note: string };

type ToolItem = {
  value: Tool;
  label: string;
  key: string;
  icon: typeof HandIcon;
};

const tools: ToolItem[] = [
  { value: "select", label: "Select", key: "V", icon: MousePointer2Icon },
  { value: "hand", label: "Pan", key: "H", icon: HandIcon },
  { value: "comment", label: "Comment", key: "C", icon: MessageCirclePlusIcon },
];

const notes = [
  "Promo code field feels hidden, move it above the total?",
  "Pay button contrast looks low in dark mode.",
  "Can we show the delivery estimate here?",
  "Card icons need more spacing.",
];

const zoomSteps = [50, 75, 100, 125, 150];

const initialPins: Pin[] = [{ id: 1, x: 72, y: 78, note: notes[1] }];

export default function Toolbar15() {
  const [tool, setTool] = useState<Tool>("comment");
  const [zoomIndex, setZoomIndex] = useState(2);
  const [pins, setPins] = useState(initialPins);
  const sectionRef = useRef<HTMLElement>(null);

  // The V / H / C shortcuts shown in the tooltips. They only fire while the
  // canvas is hovered or focused, so typing elsewhere on the page is untouched.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const section = sectionRef.current;
      if (!section || event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target?.isContentEditable ||
        target?.closest("input, textarea, select")
      ) {
        return;
      }
      if (
        !section.matches(":hover") &&
        !section.contains(document.activeElement)
      ) {
        return;
      }
      const match = tools.find(
        (item) => item.key.toLowerCase() === event.key.toLowerCase(),
      );
      if (!match) return;
      event.preventDefault();
      setTool(match.value);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const zoom = zoomSteps[zoomIndex];
  const activeTool = tools.find((item) => item.value === tool);

  function addPin(event: MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    // Keyboard activation has no pointer position, so drop the pin in the center.
    const fromPointer = event.detail > 0 && rect.width > 0;
    const x = fromPointer
      ? ((event.clientX - rect.left) / rect.width) * 100
      : 50;
    const y = fromPointer
      ? ((event.clientY - rect.top) / rect.height) * 100
      : 50;
    setPins((current) => {
      const id = current.length > 0 ? current[current.length - 1].id + 1 : 1;
      return [
        ...current,
        { id, x, y, note: notes[(id - 1) % notes.length] },
      ];
    });
  }

  return (
    <section
      ref={sectionRef}
      aria-label="Design review: Checkout, mobile"
      className="flex w-full max-w-2xl flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs sm:flex-row"
    >
      <div className="relative flex min-h-80 flex-1 gap-3 bg-muted/50 p-3">
        <Toolbar
          orientation="vertical"
          aria-label="Canvas tools"
          className="z-10 h-fit shadow-sm"
        >
          <ToggleGroup
            aria-label="Tool"
            orientation="vertical"
            spacing={0.5}
            value={[tool]}
            onValueChange={(value) => {
              if (value.length > 0) setTool(value[0] as Tool);
            }}
          >
            {tools.map((item) => (
              <Tooltip key={item.value}>
                <TooltipTrigger
                  render={
                    <ToolbarButton
                      render={<Toggle />}
                      value={item.value}
                      aria-label={item.label}
                      aria-keyshortcuts={item.key}
                    />
                  }
                >
                  <item.icon aria-hidden="true" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  {item.label} · {item.key}
                </TooltipContent>
              </Tooltip>
            ))}
          </ToggleGroup>
          <ToolbarSeparator />
          <ToolbarButton
            aria-label="Undo last comment"
            disabled={pins.length === 0}
            onClick={() => setPins((current) => current.slice(0, -1))}
          >
            <Undo2Icon aria-hidden="true" />
          </ToolbarButton>
        </Toolbar>

        <div className="flex min-w-0 flex-1 items-center justify-center overflow-hidden">
          <div
            className="origin-center transition-transform duration-200 ease-out"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            <div className="relative w-44 rounded-2xl border bg-background p-3 shadow-md">
              <div className="flex flex-col gap-2" aria-hidden="true">
                <div className="h-2.5 w-16 rounded-full bg-foreground/80" />
                <div className="flex items-center gap-2 rounded-md border p-2">
                  <div className="size-7 rounded-sm bg-muted" />
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="h-1.5 w-full rounded-full bg-muted-foreground/40" />
                    <div className="h-1.5 w-2/3 rounded-full bg-muted-foreground/25" />
                  </div>
                </div>
                <div className="h-6 rounded-md border border-dashed" />
                <div className="flex justify-between">
                  <div className="h-1.5 w-8 rounded-full bg-muted-foreground/40" />
                  <div className="h-1.5 w-10 rounded-full bg-foreground/70" />
                </div>
                <div className="h-7 rounded-md bg-primary" />
              </div>

              <button
                type="button"
                disabled={tool !== "comment"}
                onClick={addPin}
                aria-label="Add a comment on the checkout screen"
                className="absolute inset-0 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring/50 enabled:cursor-crosshair disabled:cursor-default"
              />

              {pins.map((pin) => (
                <span
                  key={pin.id}
                  aria-hidden="true"
                  className="pointer-events-none absolute flex size-5 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full rounded-bl-none bg-chart-1 text-[0.65rem] font-semibold text-background shadow-sm tabular-nums"
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                >
                  {pin.id}
                </span>
              ))}
            </div>
          </div>
        </div>

        <Toolbar
          aria-label="Zoom"
          className="absolute right-3 bottom-3 z-10 shadow-sm"
        >
          <ToolbarGroup aria-label="Zoom level">
            <ToolbarButton
              aria-label="Zoom out"
              disabled={zoomIndex === 0}
              onClick={() => setZoomIndex((value) => value - 1)}
            >
              <MinusIcon aria-hidden="true" />
            </ToolbarButton>
            <ToolbarButton
              aria-label={`Reset zoom, currently ${zoom}%`}
              onClick={() => setZoomIndex(2)}
              className="w-12 text-xs tabular-nums"
            >
              {zoom}%
            </ToolbarButton>
            <ToolbarButton
              aria-label="Zoom in"
              disabled={zoomIndex === zoomSteps.length - 1}
              onClick={() => setZoomIndex((value) => value + 1)}
            >
              <PlusIcon aria-hidden="true" />
            </ToolbarButton>
          </ToolbarGroup>
        </Toolbar>

        <p className="pointer-events-none absolute top-3 right-3 max-w-[50%] truncate rounded-md bg-background/80 px-2 py-1 text-xs text-muted-foreground">
          {tool === "comment"
            ? "Click the screen to comment"
            : `${activeTool?.label} tool`}
        </p>
      </div>

      <aside
        aria-label="Comments"
        className="flex flex-col border-t sm:w-56 sm:border-t-0 sm:border-l"
      >
        <h3 className="border-b px-3 py-2 text-sm font-semibold">
          Comments{" "}
          <span className="font-normal text-muted-foreground tabular-nums">
            {pins.length}
          </span>
        </h3>
        {pins.length === 0 ? (
          <p className="p-3 text-xs text-muted-foreground">
            No comments yet. Pick the comment tool and click the design.
          </p>
        ) : (
          <ol
            aria-live="polite"
            className="flex max-h-60 flex-col overflow-y-auto"
          >
            {pins.map((pin) => (
              <li key={pin.id} className="flex gap-2 px-3 py-2.5 text-sm">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-chart-1 text-[0.65rem] font-semibold text-background tabular-nums">
                  {pin.id}
                </span>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-xs font-medium">Maya Chen</span>
                  <span className="text-xs text-muted-foreground">
                    {pin.note}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </aside>
    </section>
  );
}
