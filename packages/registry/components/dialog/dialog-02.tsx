"use client";

import * as React from "react";
import { Braces, Download, FileSpreadsheet, FileText } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/base/ui/dialog";
import { Label } from "@/registry/base/ui/label";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/registry/base/ui/progress";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Format = "csv" | "xlsx" | "json";
type Phase = "setup" | "exporting" | "ready";

const formats: { value: Format; label: string; icon: typeof FileText }[] = [
  { value: "csv", label: "CSV", icon: FileText },
  { value: "xlsx", label: "Excel", icon: FileSpreadsheet },
  { value: "json", label: "JSON", icon: Braces },
];

const extras = [
  { id: "archived", label: "Archived projects", rows: 1_120 },
  { id: "comments", label: "Comments and mentions", rows: 3_870 },
];

const baseRows = 8_412;

export default function Dialog02() {
  const [phase, setPhase] = React.useState<Phase>("setup");
  const [format, setFormat] = React.useState<Format>("csv");
  const [included, setIncluded] = React.useState<string[]>(["archived"]);
  const [progress, setProgress] = React.useState(0);
  const timer = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = React.useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  React.useEffect(() => stop, [stop]);

  const rows =
    baseRows +
    extras
      .filter((extra) => included.includes(extra.id))
      .reduce((total, extra) => total + extra.rows, 0);

  const start = () => {
    setPhase("exporting");
    setProgress(0);
    timer.current = setInterval(() => {
      setProgress((current) => Math.min(100, current + 9));
    }, 180);
  };

  React.useEffect(() => {
    if (phase === "exporting" && progress === 100) {
      stop();
      setPhase("ready");
    }
  }, [phase, progress, stop]);

  const fileName = `acme-tasks-2026-09.${format}`;
  const FormatIcon =
    formats.find((entry) => entry.value === format)?.icon ?? FileText;

  return (
    <Dialog
      onOpenChangeComplete={(open) => {
        // A finished or cancelled export starts fresh next time.
        if (!open) {
          stop();
          setPhase("setup");
          setProgress(0);
        }
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline">
            <Download aria-hidden="true" data-icon="inline-start" />
            Export tasks
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export tasks</DialogTitle>
          <DialogDescription>
            Every task in Acme Web, including assignees, due dates, and custom
            fields.
          </DialogDescription>
        </DialogHeader>

        {phase === "setup" ? (
          <div className="grid gap-5">
            <div className="grid gap-2">
              <Label id="dialog-02-format">File format</Label>
              <ToggleGroup
                aria-labelledby="dialog-02-format"
                variant="outline"
                spacing={2}
                value={[format]}
                onValueChange={(value) => value[0] && setFormat(value[0] as Format)}
                className="grid w-full grid-cols-3"
              >
                {formats.map((entry) => (
                  <ToggleGroupItem
                    key={entry.value}
                    value={entry.value}
                    className="h-auto flex-col gap-1.5 py-3 data-pressed:border-primary data-pressed:bg-primary/5"
                  >
                    <entry.icon aria-hidden="true" className="size-5" />
                    {entry.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <fieldset className="grid gap-3">
              <legend className="mb-3 text-sm font-medium">Also include</legend>
              {extras.map((extra) => (
                <Label
                  key={extra.id}
                  className="cursor-pointer gap-2.5 font-normal"
                >
                  <Checkbox
                    checked={included.includes(extra.id)}
                    onCheckedChange={(checked) =>
                      setIncluded((current) =>
                        checked
                          ? [...current, extra.id]
                          : current.filter((id) => id !== extra.id),
                      )
                    }
                  />
                  <span className="flex-1">{extra.label}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {extra.rows.toLocaleString("en-US")} rows
                  </span>
                </Label>
              ))}
            </fieldset>
          </div>
        ) : (
          <div className="grid gap-3 rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <FormatIcon
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
              </div>
              <div className="grid min-w-0">
                <span className="truncate text-sm font-medium">{fileName}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {rows.toLocaleString("en-US")} rows
                  {phase === "ready" ? " · 2.4 MB" : ""}
                </span>
              </div>
            </div>
            <Progress value={progress}>
              <ProgressLabel className="text-xs font-normal text-muted-foreground">
                {phase === "ready" ? "Export complete" : "Preparing file…"}
              </ProgressLabel>
              <ProgressValue className="text-xs" />
            </Progress>
          </div>
        )}

        <DialogFooter>
          <DialogClose
            render={
              <Button variant="outline">
                {phase === "ready" ? "Close" : "Cancel"}
              </Button>
            }
          />
          {phase === "ready" ? (
            <DialogClose
              render={
                <Button>
                  <Download aria-hidden="true" data-icon="inline-start" />
                  Download
                </Button>
              }
            />
          ) : (
            <Button disabled={phase === "exporting"} onClick={start}>
              Export {rows.toLocaleString("en-US")} rows
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
