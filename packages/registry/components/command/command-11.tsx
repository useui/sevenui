"use client";

import * as React from "react";
import {
  FileCodeIcon,
  FileImageIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FolderIcon,
} from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/registry/base/ui/command";

type Kind = "doc" | "sheet" | "image" | "code";

type FileEntry = {
  value: string;
  label: string;
  folder: string;
  kind: Kind;
  size: string;
  modified: string;
  owner: string;
};

const files: FileEntry[] = [
  {
    value: "q3-board-update",
    label: "Q3 board update.docx",
    folder: "Finance / Reports",
    kind: "doc",
    size: "284 KB",
    modified: "Today, 09:12",
    owner: "Priya Nair",
  },
  {
    value: "runway-model",
    label: "Runway model 2026.xlsx",
    folder: "Finance / Planning",
    kind: "sheet",
    size: "1.2 MB",
    modified: "Yesterday",
    owner: "Daniel Okafor",
  },
  {
    value: "brand-hero",
    label: "Spring launch hero.png",
    folder: "Marketing / Campaigns",
    kind: "image",
    size: "3.8 MB",
    modified: "Sep 18",
    owner: "Lena Fischer",
  },
  {
    value: "pricing-page-copy",
    label: "Pricing page copy.docx",
    folder: "Marketing / Website",
    kind: "doc",
    size: "96 KB",
    modified: "Sep 16",
    owner: "Tomás Rivera",
  },
  {
    value: "export-script",
    label: "export-invoices.ts",
    folder: "Engineering / Scripts",
    kind: "code",
    size: "12 KB",
    modified: "Sep 12",
    owner: "Maya Chen",
  },
  {
    value: "hiring-plan",
    label: "Hiring plan H2.xlsx",
    folder: "People / Planning",
    kind: "sheet",
    size: "418 KB",
    modified: "Sep 3",
    owner: "Priya Nair",
  },
];

const kindIcon: Record<Kind, typeof FileTextIcon> = {
  doc: FileTextIcon,
  sheet: FileSpreadsheetIcon,
  image: FileImageIcon,
  code: FileCodeIcon,
};

const kindName: Record<Kind, string> = {
  doc: "Document",
  sheet: "Spreadsheet",
  image: "Image",
  code: "Source file",
};

function matchesFile(file: FileEntry, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return `${file.folder} ${file.label}`.toLowerCase().includes(needle);
}

// Emphasize the part of the name that matched the query.
function Highlight({ text, query }: { text: string; query: string }) {
  const needle = query.trim();
  const index = needle ? text.toLowerCase().indexOf(needle.toLowerCase()) : -1;
  if (index === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-[2px] bg-transparent font-semibold text-foreground underline decoration-primary/60 underline-offset-2">
        {text.slice(index, index + needle.length)}
      </mark>
      {text.slice(index + needle.length)}
    </>
  );
}

export default function Command11() {
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState<FileEntry>(files[0]);
  const [opened, setOpened] = React.useState<string | null>(null);

  const ActiveIcon = kindIcon[active.kind];

  return (
    <div className="grid w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-card text-card-foreground sm:grid-cols-[minmax(0,1fr)_14rem]">
      <Command
        items={files}
        value={query}
        onValueChange={(next, details) => {
          if (details.reason === "item-press") return;
          setQuery(next);
        }}
        filter={(file, value) => matchesFile(file as FileEntry, value)}
        onItemHighlighted={(file) => {
          if (file) setActive(file as FileEntry);
        }}
        className="rounded-none! bg-card"
      >
        <CommandInput
          placeholder="Go to file or folder…"
          aria-label="Go to file"
        />
        <CommandList className="max-h-64 sm:max-h-72">
          {(file: FileEntry) => {
            const Icon = kindIcon[file.kind];
            return (
              <CommandItem
                key={file.value}
                value={file}
                onClick={() => setOpened(file.value)}
              >
                <Icon className="text-muted-foreground" aria-hidden="true" />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate">
                    <Highlight text={file.label} query={query} />
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {file.folder}
                  </span>
                </span>
                {opened === file.value && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    Open
                  </span>
                )}
              </CommandItem>
            );
          }}
        </CommandList>
        <CommandEmpty>
          Nothing in your drive matches that name.
        </CommandEmpty>
      </Command>

      <aside
        aria-label="File details"
        className="flex flex-col gap-4 border-t border-border bg-muted/40 p-4 sm:border-t-0 sm:border-l"
      >
        <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-border bg-background">
          <ActiveIcon
            className="size-10 text-muted-foreground"
            strokeWidth={1.25}
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{active.label}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <FolderIcon className="size-3" aria-hidden="true" />
            <span className="truncate">{active.folder}</span>
          </p>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
          <dt className="text-muted-foreground">Type</dt>
          <dd className="text-right">{kindName[active.kind]}</dd>
          <dt className="text-muted-foreground">Size</dt>
          <dd className="text-right tabular-nums">{active.size}</dd>
          <dt className="text-muted-foreground">Modified</dt>
          <dd className="text-right">{active.modified}</dd>
          <dt className="text-muted-foreground">Owner</dt>
          <dd className="truncate text-right">{active.owner}</dd>
        </dl>
        <p className="mt-auto text-xs text-muted-foreground">
          {opened === active.value
            ? "Opened in a new tab."
            : "Press Enter to open."}
        </p>
      </aside>
    </div>
  );
}
