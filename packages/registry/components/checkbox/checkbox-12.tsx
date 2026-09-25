"use client";

import { useId, useState } from "react";
import { DownloadIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import { Label } from "@/registry/base/ui/label";
import { Separator } from "@/registry/base/ui/separator";

const columns = [
  { id: "name", label: "Name" },
  { id: "email", label: "Email" },
  { id: "plan", label: "Plan" },
  { id: "mrr", label: "MRR" },
  { id: "country", label: "Country" },
  { id: "signedUp", label: "Signed up" },
] as const;

type ColumnId = (typeof columns)[number]["id"];

// The first rows of the export, used for the live preview.
const rows: Record<ColumnId, string>[] = [
  {
    name: "Ada Brooks",
    email: "ada@lumen.io",
    plan: "Team",
    mrr: "240",
    country: "US",
    signedUp: "2026-03-14",
  },
  {
    name: "Kenji Sato",
    email: "kenji@orbital.jp",
    plan: "Pro",
    mrr: "49",
    country: "JP",
    signedUp: "2026-05-02",
  },
  {
    name: "Lena Fischer",
    email: "lena@kraftwerk.de",
    plan: "Team",
    mrr: "180",
    country: "DE",
    signedUp: "2026-07-21",
  },
];

const TOTAL_ROWS = 1284;

export default function Checkbox12() {
  const id = useId();
  const [included, setIncluded] = useState<ColumnId[]>([
    "name",
    "email",
    "plan",
    "mrr",
  ]);
  const [header, setHeader] = useState(true);
  const [downloaded, setDownloaded] = useState(false);

  // Keep the original column order no matter the click order.
  const active = columns.filter((column) => included.includes(column.id));
  const lines = [
    ...(header ? [active.map((column) => column.label).join(",")] : []),
    ...rows.map((row) => active.map((column) => row[column.id]).join(",")),
  ];

  function download() {
    const blob = new Blob([`${lines.join("\n")}\n`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "customers.csv";
    link.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
  }

  return (
    <div className="w-full max-w-xl rounded-xl border border-border bg-card text-card-foreground">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-medium">Export customers</h3>
        <p className="text-xs text-muted-foreground tabular-nums">
          {TOTAL_ROWS.toLocaleString("en-US")} rows match your current filters.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[11rem_1fr]">
        <div className="min-w-0 p-4">
        <fieldset className="flex min-w-0 flex-col gap-2.5">
          <legend className="mb-2 text-xs font-medium text-muted-foreground">
            Columns
          </legend>
          {columns.map((column) => {
            const checkboxId = `${id}-${column.id}`;
            return (
              <div key={column.id} className="flex items-center gap-2.5">
                <Checkbox
                  id={checkboxId}
                  checked={included.includes(column.id)}
                  onCheckedChange={(checked) => {
                    setDownloaded(false);
                    setIncluded((current) =>
                      checked
                        ? [...current, column.id]
                        : current.filter((value) => value !== column.id),
                    );
                  }}
                />
                <Label htmlFor={checkboxId} className="font-normal">
                  {column.label}
                </Label>
              </div>
            );
          })}
          <Separator className="my-1" />
          <div className="flex items-center gap-2.5">
            <Checkbox
              id={`${id}-header`}
              checked={header}
              onCheckedChange={(checked) => {
                setDownloaded(false);
                setHeader(checked);
              }}
            />
            <Label htmlFor={`${id}-header`} className="font-normal">
              Header row
            </Label>
          </div>
        </fieldset>
        </div>

        <div className="flex min-w-0 flex-col gap-2 border-t border-border p-4 sm:border-t-0 sm:border-s">
          <p className="text-xs font-medium text-muted-foreground">Preview</p>
          {active.length > 0 ? (
            <pre className="rounded-md bg-muted p-3 font-mono text-xs leading-relaxed whitespace-pre overflow-x-auto">
              {lines.join("\n")}
            </pre>
          ) : (
            <p className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
              Pick at least one column to export.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
        <p
          aria-live="polite"
          className="text-xs text-muted-foreground tabular-nums"
        >
          {downloaded
            ? "Downloaded customers.csv"
            : `${active.length} of ${columns.length} columns`}
        </p>
        <Button size="sm" disabled={active.length === 0} onClick={download}>
          <DownloadIcon aria-hidden="true" data-icon="inline-start" />
          Download CSV
        </Button>
      </div>
    </div>
  );
}
