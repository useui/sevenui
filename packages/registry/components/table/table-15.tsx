"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  DownloadIcon,
  FileTextIcon,
  FolderIcon,
  ImageIcon,
  SheetIcon,
  Trash2Icon,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/base/ui/table";

type Kind = "folder" | "doc" | "image" | "sheet";

type Entry = {
  id: string;
  name: string;
  kind: Kind;
  size: number;
  modified: string;
};

const initialEntries: Entry[] = [
  {
    id: "f1",
    name: "Brand assets",
    kind: "folder",
    size: 0,
    modified: "2026-09-21",
  },
  {
    id: "f2",
    name: "Contracts",
    kind: "folder",
    size: 0,
    modified: "2026-08-30",
  },
  {
    id: "f3",
    name: "Q3 launch brief.pdf",
    kind: "doc",
    size: 2_480_000,
    modified: "2026-09-24",
  },
  {
    id: "f4",
    name: "Hero banner@2x.png",
    kind: "image",
    size: 5_910_000,
    modified: "2026-09-19",
  },
  {
    id: "f5",
    name: "Campaign budget.xlsx",
    kind: "sheet",
    size: 184_000,
    modified: "2026-09-23",
  },
  {
    id: "f6",
    name: "Interview notes.docx",
    kind: "doc",
    size: 62_000,
    modified: "2026-07-12",
  },
];

const kindIcon = {
  folder: FolderIcon,
  doc: FileTextIcon,
  image: ImageIcon,
  sheet: SheetIcon,
} satisfies Record<Kind, React.ComponentType<{ className?: string }>>;

const kindTone: Record<Kind, string> = {
  folder: "text-chart-4",
  doc: "text-chart-1",
  image: "text-chart-2",
  sheet: "text-chart-3",
};

type SortKey = "name" | "size" | "modified";

const columns: { key: SortKey; label: string; className?: string }[] = [
  { key: "name", label: "Name" },
  { key: "modified", label: "Modified", className: "hidden sm:table-cell" },
  { key: "size", label: "Size", className: "pr-4 text-right" },
];

function formatSize(bytes: number) {
  if (bytes === 0) return "—";
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${Math.round(bytes / 1_000)} KB`;
}

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export default function Table15() {
  const [entries, setEntries] = React.useState(initialEntries);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [downloading, setDownloading] = React.useState(false);

  React.useEffect(() => {
    if (!downloading) return;
    const timeout = window.setTimeout(() => setDownloading(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [downloading]);
  const [sort, setSort] = React.useState<{ key: SortKey; dir: "asc" | "desc" }>(
    {
      key: "modified",
      dir: "desc",
    },
  );

  const sorted = React.useMemo(() => {
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...entries].sort((a, b) => {
      // Folders always stay on top, like a desktop file manager.
      if (a.kind === "folder" && b.kind !== "folder") return -1;
      if (b.kind === "folder" && a.kind !== "folder") return 1;
      if (sort.key === "size") return (a.size - b.size) * factor;
      return a[sort.key].localeCompare(b[sort.key]) * factor;
    });
  }, [entries, sort]);

  const allSelected = entries.length > 0 && selected.size === entries.length;

  const toggleSort = (key: SortKey) =>
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "name" ? "asc" : "desc" },
    );

  const toggleRow = (id: string, checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });

  const selectedSize = entries
    .filter((e) => selected.has(e.id))
    .reduce((sum, e) => sum + e.size, 0);

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border bg-card text-card-foreground">
      <div className="flex min-h-14 items-center gap-2 border-b px-4 py-2">
        {selected.size > 0 ? (
          <>
            <p aria-live="polite" className="mr-auto text-sm font-medium">
              {selected.size} selected
              {selectedSize > 0 ? (
                <span className="font-normal text-muted-foreground">
                  {" "}
                  · {formatSize(selectedSize)}
                </span>
              ) : null}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDownloading(true)}
            >
              {downloading ? (
                <CheckIcon
                  aria-hidden="true"
                  data-icon="inline-start"
                  className="text-success"
                />
              ) : (
                <DownloadIcon aria-hidden="true" data-icon="inline-start" />
              )}
              {downloading ? "Started" : "Download"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setEntries((prev) => prev.filter((e) => !selected.has(e.id)));
                setSelected(new Set());
              }}
            >
              <Trash2Icon aria-hidden="true" data-icon="inline-start" />
              Delete
            </Button>
          </>
        ) : (
          <nav aria-label="Folder path" className="min-w-0 text-sm">
            <ol className="flex items-center gap-1.5 whitespace-nowrap text-muted-foreground">
              <li className="min-w-0 truncate">Shared drive</li>
              <li aria-hidden="true" className="shrink-0">
                /
              </li>
              <li className="shrink-0">Marketing</li>
              <li aria-hidden="true" className="shrink-0">
                /
              </li>
              <li
                aria-current="page"
                className="shrink-0 font-medium text-foreground"
              >
                Fall campaign
              </li>
            </ol>
          </nav>
        )}
      </div>
      <Table aria-label="Files in Fall campaign">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10 pl-4">
              <Checkbox
                aria-label="Select all files"
                checked={allSelected}
                indeterminate={selected.size > 0 && !allSelected}
                onCheckedChange={(checked) =>
                  setSelected(
                    checked ? new Set(entries.map((e) => e.id)) : new Set(),
                  )
                }
              />
            </TableHead>
            {columns.map((column) => {
              const active = sort.key === column.key;
              const SortIcon = !active
                ? ChevronsUpDownIcon
                : sort.dir === "asc"
                  ? ArrowUpIcon
                  : ArrowDownIcon;
              return (
                <TableHead
                  key={column.key}
                  aria-sort={
                    active
                      ? sort.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className={column.className}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className={column.key === "size" ? "-mr-2.5" : "-ml-2.5"}
                    onClick={() => toggleSort(column.key)}
                  >
                    {column.label}
                    <SortIcon
                      aria-hidden="true"
                      data-icon="inline-end"
                      className={active ? "" : "text-muted-foreground"}
                    />
                  </Button>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={4}
                className="h-28 text-center text-muted-foreground"
              >
                This folder is empty.{" "}
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto px-0"
                  onClick={() => setEntries(initialEntries)}
                >
                  Restore files
                </Button>
              </TableCell>
            </TableRow>
          ) : (
            sorted.map((entry) => {
              const Icon = kindIcon[entry.kind];
              const isSelected = selected.has(entry.id);
              return (
                <TableRow
                  key={entry.id}
                  data-state={isSelected ? "selected" : undefined}
                >
                  <TableCell className="pl-4">
                    <Checkbox
                      aria-label={`Select ${entry.name}`}
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        toggleRow(entry.id, checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex max-w-36 items-center gap-2.5 sm:max-w-none">
                      <Icon
                        aria-hidden="true"
                        className={`size-4 shrink-0 ${kindTone[entry.kind]}`}
                      />
                      <span className="truncate font-medium">{entry.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    <time dateTime={entry.modified}>
                      {dateFormat.format(new Date(entry.modified))}
                    </time>
                  </TableCell>
                  <TableCell className="pr-4 text-right text-muted-foreground tabular-nums">
                    {formatSize(entry.size)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
