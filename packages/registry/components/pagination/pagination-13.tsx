"use client";

import * as React from "react";
import {
  CheckIcon,
  DownloadIcon,
  FileImageIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FileVideoIcon,
  Trash2Icon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/registry/base/ui/pagination";

const typeIcon = {
  doc: FileTextIcon,
  image: FileImageIcon,
  sheet: FileSpreadsheetIcon,
  video: FileVideoIcon,
};

const initialFiles: {
  name: string;
  type: keyof typeof typeIcon;
  size: string;
  modified: string;
}[] = [
  { name: "Brand guidelines 2026.pdf", type: "doc", size: "8.2 MB", modified: "Sep 22" },
  { name: "Homepage hero.png", type: "image", size: "2.4 MB", modified: "Sep 21" },
  { name: "Q3 revenue.xlsx", type: "sheet", size: "640 KB", modified: "Sep 20" },
  { name: "Product walkthrough.mp4", type: "video", size: "184 MB", modified: "Sep 18" },
  { name: "Launch checklist.docx", type: "doc", size: "96 KB", modified: "Sep 17" },
  { name: "Team offsite photo.jpg", type: "image", size: "5.1 MB", modified: "Sep 15" },
  { name: "Churn by cohort.xlsx", type: "sheet", size: "1.2 MB", modified: "Sep 12" },
  { name: "Press kit.pdf", type: "doc", size: "12.8 MB", modified: "Sep 10" },
  { name: "Onboarding screens.png", type: "image", size: "3.7 MB", modified: "Sep 8" },
  { name: "Customer interview 04.mp4", type: "video", size: "322 MB", modified: "Sep 5" },
  { name: "Pricing experiment.xlsx", type: "sheet", size: "410 KB", modified: "Sep 2" },
  { name: "Roadmap H2.pdf", type: "doc", size: "2.2 MB", modified: "Aug 29" },
  { name: "App icon set.png", type: "image", size: "900 KB", modified: "Aug 27" },
  { name: "Support macros.docx", type: "doc", size: "54 KB", modified: "Aug 24" },
];

const PAGE_SIZE = 5;

export default function Pagination13() {
  const [files, setFiles] = React.useState(initialFiles);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [page, setPage] = React.useState(1);
  const [downloaded, setDownloaded] = React.useState(false);
  const downloadTimer = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  React.useEffect(() => {
    return () => {
      if (downloadTimer.current) clearTimeout(downloadTimer.current);
    };
  }, []);

  const pageCount = Math.max(1, Math.ceil(files.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = files.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const selectedOnPage = visible.filter((file) => selected.has(file.name));
  const allOnPage = visible.length > 0 && selectedOnPage.length === visible.length;

  function toggle(name: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(name);
      else next.delete(name);
      return next;
    });
  }

  function togglePage(checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const file of visible) {
        if (checked) next.add(file.name);
        else next.delete(file.name);
      }
      return next;
    });
  }

  // Simulates handing the selection to the browser as a zip, then confirms
  // briefly on the button before it returns to its idle label.
  function downloadSelected() {
    if (downloadTimer.current) clearTimeout(downloadTimer.current);
    setDownloaded(true);
    downloadTimer.current = setTimeout(() => setDownloaded(false), 1500);
  }

  function deleteSelected() {
    setFiles((prev) => prev.filter((file) => !selected.has(file.name)));
    setSelected(new Set());
  }

  function goTo(event: React.MouseEvent, next: number) {
    event.preventDefault();
    if (next >= 1 && next <= pageCount) setPage(next);
  }

  // Count selections that live on other pages so they aren't forgotten.
  const elsewhere = selected.size - selectedOnPage.length;

  return (
    <section
      aria-label="Marketing assets"
      className="w-full max-w-xl overflow-hidden rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex min-h-14 items-center justify-between gap-2 border-b px-4 py-2">
        {selected.size > 0 ? (
          <>
            <p className="text-sm" aria-live="polite">
              <span className="font-medium tabular-nums">{selected.size}</span>{" "}
              selected
              {elsewhere > 0 && (
                <span className="text-muted-foreground">
                  {" "}
                  · {elsewhere} on other pages
                </span>
              )}
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={downloadSelected}>
                {downloaded ? (
                  <CheckIcon aria-hidden="true" data-icon="inline-start" />
                ) : (
                  <DownloadIcon aria-hidden="true" data-icon="inline-start" />
                )}
                <span className="hidden sm:inline">
                  {downloaded ? "Downloaded" : "Download"}
                </span>
                <span className="sr-only sm:hidden">
                  {downloaded ? "Downloaded" : "Download selected"}
                </span>
              </Button>
              <Button variant="destructive" size="sm" onClick={deleteSelected}>
                <Trash2Icon aria-hidden="true" data-icon="inline-start" />
                <span className="hidden sm:inline">Delete</span>
                <span className="sr-only sm:hidden">Delete selected</span>
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-medium">
              Marketing assets
            </h2>
            <p className="text-sm text-muted-foreground tabular-nums">
              {files.length} files
            </p>
          </>
        )}
      </header>

      <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground">
        <Checkbox
          aria-label="Select all files on this page"
          checked={allOnPage}
          indeterminate={selectedOnPage.length > 0 && !allOnPage}
          onCheckedChange={(checked) => togglePage(checked)}
          disabled={visible.length === 0}
        />
        <span className="flex-1">Name</span>
        <span className="hidden w-16 text-right sm:block">Size</span>
        <span className="w-14 text-right">Modified</span>
      </div>

      {visible.length > 0 ? (
        <ul className="divide-y">
          {visible.map((file) => {
            const Icon = typeIcon[file.type];
            const isSelected = selected.has(file.name);
            return (
              <li
                key={file.name}
                data-selected={isSelected || undefined}
                className="flex items-center gap-3 px-4 py-2.5 text-sm data-selected:bg-accent/60"
              >
                <Checkbox
                  aria-label={`Select ${file.name}`}
                  checked={isSelected}
                  onCheckedChange={(checked) => toggle(file.name, checked)}
                />
                <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{file.name}</span>
                <span className="hidden w-16 text-right text-muted-foreground tabular-nums sm:block">
                  {file.size}
                </span>
                <span className="w-14 text-right text-muted-foreground tabular-nums">
                  {file.modified}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          This folder is empty.
        </p>
      )}

      <footer className="border-t px-2 py-2">
        <Pagination aria-label="File pages">
          <PaginationContent className="w-full">
            <PaginationItem className="mr-auto">
              <PaginationPrevious
                href="#"
                aria-disabled={current === 1}
                tabIndex={current === 1 ? -1 : undefined}
                className={current === 1 ? "pointer-events-none opacity-50" : ""}
                onClick={(event) => goTo(event, current - 1)}
              />
            </PaginationItem>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (number) => (
                <PaginationItem key={number}>
                  <PaginationLink
                    href="#"
                    size="icon-sm"
                    isActive={number === current}
                    aria-label={`Page ${number}`}
                    onClick={(event) => goTo(event, number)}
                  >
                    {number}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}
            <PaginationItem className="ml-auto">
              <PaginationNext
                href="#"
                aria-disabled={current === pageCount}
                tabIndex={current === pageCount ? -1 : undefined}
                className={
                  current === pageCount ? "pointer-events-none opacity-50" : ""
                }
                onClick={(event) => goTo(event, current + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </footer>
    </section>
  );
}
