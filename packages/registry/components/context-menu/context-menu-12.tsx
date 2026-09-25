"use client";

import {
  Download,
  EyeOff,
  FileImage,
  FileSpreadsheet,
  LayoutDashboard,
  RotateCcw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
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
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/registry/base/ui/context-menu";

// macOS browsers never turn Shift+F10 into a contextmenu event (Windows and
// Linux do), so the shortcut the hint advertises is forwarded by hand there.
function openMenuWithShiftF10(event: React.KeyboardEvent<HTMLElement>) {
  if (event.key !== "F10" || !event.shiftKey) return;
  if (!/Mac|iPhone|iPad/.test(navigator.userAgent)) return;
  event.preventDefault();
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.dispatchEvent(
    new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: rect.left + 8,
      clientY: rect.top + 8,
    }),
  );
}

type Range = "7d" | "30d" | "90d";

const series: Record<
  Range,
  {
    label: string;
    total: string;
    delta: string;
    bars: { label: string; value: number; previous: number }[];
  }
> = {
  "7d": {
    label: "Last 7 days",
    total: "3,482",
    delta: "+12.4%",
    bars: [
      { label: "Mon", value: 420, previous: 380 },
      { label: "Tue", value: 512, previous: 441 },
      { label: "Wed", value: 488, previous: 470 },
      { label: "Thu", value: 604, previous: 512 },
      { label: "Fri", value: 571, previous: 498 },
      { label: "Sat", value: 402, previous: 377 },
      { label: "Sun", value: 485, previous: 420 },
    ],
  },
  "30d": {
    label: "Last 30 days",
    total: "14,906",
    delta: "+6.1%",
    bars: [
      { label: "W1", value: 3310, previous: 3190 },
      { label: "W2", value: 3642, previous: 3401 },
      { label: "W3", value: 3920, previous: 3588 },
      { label: "W4", value: 4034, previous: 3870 },
    ],
  },
  "90d": {
    label: "Last 90 days",
    total: "41,275",
    delta: "−2.3%",
    bars: [
      { label: "Jul", value: 14620, previous: 14100 },
      { label: "Aug", value: 12749, previous: 14230 },
      { label: "Sep", value: 13906, previous: 13920 },
    ],
  },
};

export default function ContextMenu12() {
  const [range, setRange] = React.useState<Range>("7d");
  const [compare, setCompare] = React.useState(true);
  const [showValues, setShowValues] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const [status, setStatus] = React.useState("");

  const data = series[range];
  const max = Math.max(
    ...data.bars.flatMap((bar) => [bar.value, bar.previous]),
  );
  const negative = data.delta.startsWith("−");

  if (hidden) {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
        <LayoutDashboard
          aria-hidden="true"
          className="size-5 text-muted-foreground"
        />
        <p className="text-sm text-muted-foreground">
          Signups widget removed from Growth overview.
        </p>
        <Button variant="outline" size="sm" onClick={() => setHidden(false)}>
          <RotateCcw aria-hidden="true" />
          Undo
        </Button>
      </div>
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger
        onKeyDown={openMenuWithShiftF10}
        tabIndex={0}
        aria-label={`New signups widget, ${data.label}: ${data.total}. Open the context menu for widget options.`}
        className="block w-full max-w-md rounded-xl border bg-card p-4 text-card-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:border-ring"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">New signups</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {data.total}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{data.label}</p>
            <p className="inline-flex items-center gap-1 text-xs font-medium tabular-nums">
              {negative ? (
                <TrendingDown
                  aria-hidden="true"
                  className="size-3.5 text-destructive"
                />
              ) : (
                <TrendingUp
                  aria-hidden="true"
                  className="size-3.5 text-success"
                />
              )}
              {data.delta} vs previous
            </p>
          </div>
        </div>
        <div
          role="img"
          aria-label={data.bars
            .map((bar) => `${bar.label}: ${bar.value.toLocaleString("en-US")}`)
            .join(", ")}
          className="mt-5 flex h-36 items-end gap-2"
        >
          {data.bars.map((bar) => (
            <div
              key={bar.label}
              className="flex h-full flex-1 flex-col items-center gap-1.5"
            >
              <div className="flex w-full flex-1 items-end justify-center gap-0.5">
                {compare ? (
                  <div
                    className="w-full max-w-5 rounded-t-sm bg-muted-foreground/20"
                    style={{ height: `${(bar.previous / max) * 100}%` }}
                  />
                ) : null}
                <div
                  className="relative w-full max-w-5 rounded-t-sm bg-chart-2 transition-[height] duration-300 ease-out"
                  style={{ height: `${(bar.value / max) * 100}%` }}
                >
                  {showValues ? (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground tabular-nums">
                      {bar.value >= 1000
                        ? `${(bar.value / 1000).toFixed(1)}k`
                        : bar.value}
                    </span>
                  ) : null}
                </div>
              </div>
              <span className="text-[11px] text-muted-foreground">
                {bar.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-xs bg-chart-2"
              />
              Current
            </span>
            {compare ? (
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-xs bg-muted-foreground/20"
                />
                Previous
              </span>
            ) : null}
          </span>
          <span aria-live="polite">{status || "Right-click for options"}</span>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuGroup>
          <ContextMenuLabel>Date range</ContextMenuLabel>
          <ContextMenuRadioGroup
            value={range}
            onValueChange={(value) => setRange(value as Range)}
          >
            <ContextMenuRadioItem value="7d">Last 7 days</ContextMenuRadioItem>
            <ContextMenuRadioItem value="30d">
              Last 30 days
            </ContextMenuRadioItem>
            <ContextMenuRadioItem value="90d">
              Last 90 days
            </ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuLabel>Display</ContextMenuLabel>
          <ContextMenuCheckboxItem
            checked={compare}
            onCheckedChange={setCompare}
          >
            Compare to previous period
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem
            checked={showValues}
            onCheckedChange={setShowValues}
          >
            Show data labels
          </ContextMenuCheckboxItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Download aria-hidden="true" />
            Export
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-44">
            <ContextMenuItem
              onClick={() => setStatus(`signups-${range}.csv exported`)}
            >
              <FileSpreadsheet aria-hidden="true" />
              Data as CSV
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => setStatus(`signups-${range}.png exported`)}
            >
              <FileImage aria-hidden="true" />
              Chart as PNG
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuItem
          variant="destructive"
          onClick={() => {
            setStatus("");
            setHidden(true);
          }}
        >
          <EyeOff aria-hidden="true" />
          Remove from dashboard
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
