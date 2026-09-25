"use client";

import * as React from "react";
import {
  AlertCircle,
  Check,
  Download,
  FileSpreadsheet,
  FileText,
  Lock,
  RotateCw,
  Sheet,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";
import { Spinner } from "@/registry/base/ui/spinner";

type ExportState = "idle" | "loading" | "done" | "error";

const FORMATS = [
  { key: "pdf", label: "PDF report", meta: "2.4 MB", icon: FileText },
  { key: "csv", label: "CSV rows", meta: "18,204 rows", icon: FileSpreadsheet },
  // This destination fails on purpose to show the error and retry state.
  { key: "sheets", label: "Google Sheets", meta: "Sync", icon: Sheet },
] as const;

type FormatKey = (typeof FORMATS)[number]["key"];

const IDLE: Record<FormatKey, ExportState> = {
  pdf: "idle",
  csv: "idle",
  sheets: "idle",
};

export default function DropdownMenu06() {
  const [states, setStates] = React.useState(IDLE);
  const timers = React.useRef<number[]>([]);

  React.useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const id of pending) window.clearTimeout(id);
    };
  }, []);

  function runExport(key: FormatKey) {
    if (states[key] === "loading") return;
    setStates((prev) => ({ ...prev, [key]: "loading" }));
    const id = window.setTimeout(() => {
      setStates((prev) => ({
        ...prev,
        [key]: key === "sheets" ? "error" : "done",
      }));
    }, 1200);
    timers.current.push(id);
  }

  return (
    <DropdownMenu
      onOpenChangeComplete={(open) => {
        // Reset finished rows once the menu has fully closed.
        if (!open) {
          setStates((prev) => {
            const next = { ...prev };
            for (const key of Object.keys(next) as FormatKey[]) {
              if (next[key] !== "loading") next[key] = "idle";
            }
            return next;
          });
        }
      }}
    >
      <DropdownMenuTrigger
        render={
          <Button variant="secondary">
            <Download aria-hidden="true" data-icon="inline-start" />
            Export
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-64 max-w-[calc(100vw-2rem)]">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Q3 revenue report</DropdownMenuLabel>
          {FORMATS.map(({ key, label, meta, icon: Icon }) => {
            const state = states[key];
            return (
              <DropdownMenuItem
                key={key}
                label={label}
                closeOnClick={false}
                aria-busy={state === "loading" || undefined}
                onClick={() => runExport(key)}
                className={
                  state === "error"
                    ? "text-destructive focus:bg-destructive/10 focus:text-destructive dark:focus:bg-destructive/20"
                    : undefined
                }
              >
                {state === "loading" ? (
                  <Spinner aria-hidden="true" role="presentation" />
                ) : state === "done" ? (
                  <Check aria-hidden="true" className="text-success" />
                ) : state === "error" ? (
                  <AlertCircle aria-hidden="true" className="text-destructive" />
                ) : (
                  <Icon aria-hidden="true" />
                )}
                <span className="flex-1 truncate">
                  {state === "loading"
                    ? `Preparing ${label}…`
                    : state === "done"
                      ? `${label} downloaded`
                      : state === "error"
                        ? "Sheets token expired"
                        : label}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  {state === "error" ? (
                    <>
                      <RotateCw aria-hidden="true" className="size-3" />
                      Retry
                    </>
                  ) : (
                    meta
                  )}
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="items-start">
          <Lock aria-hidden="true" className="mt-0.5" />
          <span className="flex flex-col">
            <span>Scheduled export</span>
            <span className="text-xs text-muted-foreground">
              Available on the Business plan
            </span>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
