"use client";

import {
  FileSpreadsheetIcon,
  FileTextIcon,
  FolderIcon,
  ImageIcon,
  StarIcon,
} from "lucide-react";
import * as React from "react";

import { Toggle } from "@/registry/base/ui/toggle";

const files = [
  { id: "f1", name: "Brand guidelines 2026.pdf", meta: "4.2 MB · Edited 2h ago", icon: FileTextIcon },
  { id: "f2", name: "Q3 revenue forecast.xlsx", meta: "860 KB · Edited yesterday", icon: FileSpreadsheetIcon },
  { id: "f3", name: "Launch assets", meta: "24 files · Edited Sep 21", icon: FolderIcon },
  { id: "f4", name: "Homepage hero.png", meta: "2.1 MB · Edited Sep 18", icon: ImageIcon },
  { id: "f5", name: "Vendor contract draft.docx", meta: "118 KB · Edited Sep 12", icon: FileTextIcon },
];

export default function Toggle10() {
  const [starred, setStarred] = React.useState<Set<string>>(
    () => new Set(["f2", "f3"]),
  );
  const [starredOnly, setStarredOnly] = React.useState(false);

  function setStar(id: string, pressed: boolean) {
    setStarred((current) => {
      const next = new Set(current);
      if (pressed) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const visible = starredOnly ? files.filter((f) => starred.has(f.id)) : files;

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h3 className="font-medium">Marketing drive</h3>
          <p className="text-xs text-muted-foreground tabular-nums">
            {visible.length} of {files.length} items
          </p>
        </div>
        <Toggle
          size="sm"
          variant="outline"
          pressed={starredOnly}
          onPressedChange={setStarredOnly}
        >
          <StarIcon
            aria-hidden="true"
            className="group-aria-pressed/toggle:fill-warning group-aria-pressed/toggle:text-warning"
          />
          Starred only
        </Toggle>
      </div>
      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-1 px-4 py-10 text-center">
          <StarIcon aria-hidden="true" className="size-5 text-muted-foreground" />
          <p className="text-sm font-medium">No starred files yet</p>
          <p className="text-sm text-muted-foreground">
            Star a file to keep it one click away.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {visible.map((file) => {
            const Icon = file.icon;
            const isStarred = starred.has(file.id);
            return (
              <li key={file.id} className="flex items-center gap-3 px-4 py-2.5">
                <Icon
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {file.meta}
                  </p>
                </div>
                <Toggle
                  size="sm"
                  pressed={isStarred}
                  onPressedChange={(pressed) => setStar(file.id, pressed)}
                  aria-label={`Star ${file.name}`}
                  className="text-muted-foreground aria-pressed:bg-transparent aria-pressed:text-warning"
                >
                  <StarIcon
                    aria-hidden="true"
                    className="group-aria-pressed/toggle:fill-current"
                  />
                </Toggle>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
