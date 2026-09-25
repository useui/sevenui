"use client";

import * as React from "react";
import {
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  LayoutGrid,
  List,
} from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Kind = "doc" | "image" | "video" | "sheet";

const files: { name: string; kind: Kind; size: string; edited: string }[] = [
  { name: "Q3 board deck.pdf", kind: "doc", size: "4.2 MB", edited: "2h ago" },
  { name: "Launch hero.png", kind: "image", size: "1.8 MB", edited: "Yesterday" },
  { name: "Onboarding walkthrough.mp4", kind: "video", size: "86 MB", edited: "Sep 21" },
  { name: "Hiring plan 2027.xlsx", kind: "sheet", size: "312 KB", edited: "Sep 19" },
  { name: "Brand guidelines.pdf", kind: "doc", size: "9.6 MB", edited: "Sep 12" },
  { name: "Team offsite.jpg", kind: "image", size: "3.1 MB", edited: "Sep 8" },
];

const kinds: { value: Kind; label: string; icon: typeof FileText; tone: string }[] = [
  { value: "doc", label: "Docs", icon: FileText, tone: "text-chart-1" },
  { value: "image", label: "Images", icon: FileImage, tone: "text-chart-2" },
  { value: "video", label: "Video", icon: FileVideo, tone: "text-chart-4" },
  { value: "sheet", label: "Sheets", icon: FileSpreadsheet, tone: "text-chart-3" },
];

const kindMap = Object.fromEntries(kinds.map((kind) => [kind.value, kind]));

export default function ToggleGroup11() {
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [filters, setFilters] = React.useState<string[]>([]);
  const visible = filters.length
    ? files.filter((file) => filters.includes(file.kind))
    : files;

  return (
    <section
      aria-labelledby="toggle-group-11-title"
      className="flex w-full max-w-xl flex-col gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 id="toggle-group-11-title" className="text-sm font-medium">
            Shared with marketing
          </h3>
          <p aria-live="polite" className="text-xs text-muted-foreground">
            {visible.length} of {files.length} files
          </p>
        </div>
        <ToggleGroup
          aria-label="Layout"
          variant="outline"
          size="sm"
          spacing={0}
          value={[view]}
          onValueChange={(next) => {
            if (next[0]) setView(next[0] as "grid" | "list");
          }}
        >
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <LayoutGrid aria-hidden="true" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <List aria-hidden="true" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <ToggleGroup
        multiple
        aria-label="Filter by file type"
        size="sm"
        spacing={1}
        value={filters}
        onValueChange={setFilters}
        className="flex-wrap"
      >
        {kinds.map((kind) => (
          <ToggleGroupItem
            key={kind.value}
            value={kind.value}
            className="rounded-full! border border-border px-3 aria-pressed:border-foreground/30"
          >
            <kind.icon className={kind.tone} aria-hidden="true" />
            {kind.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {view === "grid" ? (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {visible.map((file) => {
            const kind = kindMap[file.kind];
            return (
              <li
                key={file.name}
                className="flex flex-col gap-3 rounded-lg border border-border p-3"
              >
                <div className="flex h-14 items-center justify-center rounded-md bg-muted">
                  <kind.icon className={`size-6 ${kind.tone}`} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {file.size}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {visible.map((file) => {
            const kind = kindMap[file.kind];
            return (
              <li key={file.name} className="flex items-center gap-3 px-3 py-2">
                <kind.icon className={`size-4 shrink-0 ${kind.tone}`} aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {file.edited}
                </span>
                <span className="w-14 text-right text-xs text-muted-foreground tabular-nums">
                  {file.size}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
