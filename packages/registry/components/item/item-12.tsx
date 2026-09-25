"use client";

import * as React from "react";
import {
  DownloadIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FileVideoIcon,
  FolderOpenIcon,
  ImageIcon,
  LinkIcon,
  MoreHorizontalIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/registry/base/ui/item";

const FILES = [
  {
    id: "q3-forecast",
    name: "Q3 revenue forecast.xlsx",
    meta: "2.4 MB · Edited by Priya 12 min ago",
    icon: FileSpreadsheetIcon,
    tone: "bg-chart-2/15 text-chart-2",
  },
  {
    id: "brand-guide",
    name: "Brand guidelines v4.pdf",
    meta: "18.1 MB · Edited by you yesterday",
    icon: FileTextIcon,
    tone: "bg-chart-1/15 text-chart-1",
  },
  {
    id: "hero-shot",
    name: "Homepage hero — final.png",
    meta: "5.7 MB · Edited by Marco on Sep 21",
    icon: ImageIcon,
    tone: "bg-chart-4/15 text-chart-4",
  },
  {
    id: "onboarding-walkthrough",
    name: "Onboarding walkthrough.mp4",
    meta: "142 MB · Uploaded by Lena on Sep 18",
    icon: FileVideoIcon,
    tone: "bg-chart-5/15 text-chart-5",
  },
];

type DriveFile = (typeof FILES)[number];

export default function Item12() {
  const [files, setFiles] = React.useState<DriveFile[]>(FILES);
  const [starred, setStarred] = React.useState<string[]>(["q3-forecast"]);
  const [lastTrashed, setLastTrashed] = React.useState<{
    file: DriveFile;
    index: number;
  } | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  function toggleStar(id: string) {
    setStarred((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  function trash(file: DriveFile) {
    const index = files.findIndex((f) => f.id === file.id);
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
    setLastTrashed({ file, index });
    setNotice(null);
  }

  async function copyLink(file: DriveFile) {
    const link = `${window.location.origin}/files/${file.id}`;
    try {
      await navigator.clipboard.writeText(link);
      setNotice("Link copied to clipboard");
    } catch {
      setNotice("Couldn't copy the link. Check clipboard permissions.");
    }
    setLastTrashed(null);
  }

  function download(file: DriveFile) {
    setNotice(`Downloading “${file.name}”…`);
    setLastTrashed(null);
  }

  function restore() {
    if (!lastTrashed) return;
    setFiles((prev) => {
      const next = [...prev];
      next.splice(lastTrashed.index, 0, lastTrashed.file);
      return next;
    });
    setLastTrashed(null);
  }

  return (
    <div className="w-full max-w-lg space-y-2">
      <div className="flex items-baseline justify-between gap-2 px-1">
        <h3 className="text-sm font-semibold">Recent files</h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {files.length} {files.length === 1 ? "file" : "files"}
        </span>
      </div>

      {files.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-10 text-center">
          <FolderOpenIcon
            aria-hidden="true"
            className="size-6 text-muted-foreground"
          />
          <p className="text-sm font-medium">No recent files</p>
          <p className="text-sm text-muted-foreground">
            Files you open or edit will show up here.
          </p>
        </div>
      ) : (
        <ItemGroup className="gap-1">
          {files.map((file) => {
            const Icon = file.icon;
            const isStarred = starred.includes(file.id);
            return (
              <Item
                key={file.id}
                role="listitem"
                size="sm"
                className="hover:bg-muted/50"
              >
                <ItemMedia
                  className={`size-9 rounded-md [&_svg]:size-4.5 ${file.tone}`}
                >
                  <Icon aria-hidden="true" />
                </ItemMedia>
                <ItemContent className="min-w-0">
                  <ItemTitle className="w-full">
                    <span className="min-w-0 truncate">{file.name}</span>
                    {isStarred && (
                      <StarIcon
                        role="img"
                        aria-label="Starred"
                        className="size-3.5 shrink-0 fill-warning text-warning"
                      />
                    )}
                  </ItemTitle>
                  <ItemDescription className="truncate">
                    {file.meta}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Actions for ${file.name}`}
                        >
                          <MoreHorizontalIcon aria-hidden="true" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => toggleStar(file.id)}>
                        <StarIcon aria-hidden="true" />
                        {isStarred ? "Remove star" : "Add star"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => copyLink(file)}>
                        <LinkIcon aria-hidden="true" />
                        Copy link
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => download(file)}>
                        <DownloadIcon aria-hidden="true" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => trash(file)}
                      >
                        <Trash2Icon aria-hidden="true" />
                        Move to trash
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ItemActions>
              </Item>
            );
          })}
        </ItemGroup>
      )}

      <div aria-live="polite" className="min-h-9">
        {lastTrashed && (
          <div className="flex items-center justify-between gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm">
            <span className="min-w-0 truncate">
              Moved “{lastTrashed.file.name}” to trash
            </span>
            <Button size="sm" variant="ghost" onClick={restore}>
              Undo
            </Button>
          </div>
        )}
        {notice && !lastTrashed && (
          <div className="flex items-center justify-between gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm">
            <span className="min-w-0 truncate">{notice}</span>
            <Button size="sm" variant="ghost" onClick={() => setNotice(null)}>
              Dismiss
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
