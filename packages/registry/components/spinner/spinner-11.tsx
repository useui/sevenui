"use client";

import {
  CircleAlertIcon,
  CircleCheckIcon,
  FileImageIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FileVideoIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/registry/base/ui/button";
import { Spinner } from "@/registry/base/ui/spinner";

type Stage = "uploading" | "scanning" | "preview" | "ready" | "failed";

type QueuedFile = {
  id: string;
  name: string;
  size: string;
  icon: typeof FileTextIcon;
  stage: Stage;
  failsOnce?: boolean;
};

const stageLabel: Record<Stage, string> = {
  uploading: "Uploading",
  scanning: "Scanning for malware",
  preview: "Generating preview",
  ready: "Ready",
  failed: "Couldn't generate a preview",
};

const nextStage: Partial<Record<Stage, Stage>> = {
  uploading: "scanning",
  scanning: "preview",
  preview: "ready",
};

const initialFiles: QueuedFile[] = [
  {
    id: "f1",
    name: "Q3 board deck.pdf",
    size: "4.2 MB",
    icon: FileTextIcon,
    stage: "uploading",
  },
  {
    id: "f2",
    name: "Revenue by region.xlsx",
    size: "812 KB",
    icon: FileSpreadsheetIcon,
    stage: "uploading",
  },
  {
    id: "f3",
    name: "Product walkthrough.mp4",
    size: "48.6 MB",
    icon: FileVideoIcon,
    stage: "uploading",
    failsOnce: true,
  },
  {
    id: "f4",
    name: "Team offsite.jpg",
    size: "2.9 MB",
    icon: FileImageIcon,
    stage: "uploading",
  },
];

export default function Spinner11() {
  const [files, setFiles] = useState(initialFiles);
  const timers = useRef<number[]>([]);

  const filesRef = useRef(files);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  const advance = useCallback((id: string, delay: number) => {
    timers.current.push(
      window.setTimeout(() => {
        const file = filesRef.current.find((item) => item.id === id);
        if (!file) return;
        const fails = file.stage === "preview" && file.failsOnce;
        const next: Stage | undefined = fails
          ? "failed"
          : nextStage[file.stage];
        if (!next) return;
        setFiles((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  stage: next,
                  failsOnce: fails ? false : item.failsOnce,
                }
              : item,
          ),
        );
        if (next !== "ready" && next !== "failed") {
          advance(id, 900 + Math.random() * 700);
        }
      }, delay),
    );
  }, []);

  const start = useCallback(() => {
    initialFiles.forEach((file, index) => {
      advance(file.id, 700 + index * 450);
    });
  }, [advance]);

  useEffect(() => {
    start();
    const pending = timers.current;
    return () => {
      for (const id of pending) window.clearTimeout(id);
    };
  }, [start]);

  function retry(id: string) {
    setFiles((prev) =>
      prev.map((file) =>
        file.id === id ? { ...file, stage: "preview" } : file,
      ),
    );
    advance(id, 1200);
  }

  function replay() {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current.length = 0;
    setFiles(initialFiles);
    start();
  }

  const ready = files.filter((file) => file.stage === "ready").length;
  const failed = files.filter((file) => file.stage === "failed").length;
  const working = files.length - ready - failed;

  return (
    <section
      aria-labelledby="spinner-11-title"
      className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card text-card-foreground"
    >
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="grid min-w-0 gap-0.5">
          <h3 id="spinner-11-title" className="text-sm font-medium text-balance">
            Adding to “Board meeting · October”
          </h3>
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {working > 0
              ? `Processing ${working} of ${files.length} files`
              : `${ready} of ${files.length} files ready`}
            {failed > 0 ? ` · ${failed} needs attention` : ""}
          </p>
        </div>
        {working > 0 ? (
          <Spinner
            className="size-5 text-muted-foreground"
            aria-label="Processing files"
          />
        ) : (
          <Button size="sm" variant="outline" onClick={replay}>
            Upload again
          </Button>
        )}
      </header>
      <ul className="divide-y divide-border">
        {files.map((file) => {
          const Icon = file.icon;
          const busy = file.stage !== "ready" && file.stage !== "failed";
          return (
            <li
              key={file.id}
              aria-busy={busy}
              className="flex items-center gap-3 px-4 py-3"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Icon aria-hidden="true" className="size-4" />
              </span>
              <div className="grid min-w-0 flex-1 gap-0.5">
                <span className="truncate text-sm font-medium">
                  {file.name}
                </span>
                <span
                  className={`flex items-center gap-1.5 text-xs ${
                    file.stage === "failed"
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {busy ? (
                    <Spinner
                      className="size-3"
                      aria-label={`${stageLabel[file.stage]}: ${file.name}`}
                    />
                  ) : null}
                  <span className="min-w-0">
                    {file.size} · {stageLabel[file.stage]}
                  </span>
                </span>
              </div>
              {file.stage === "ready" ? (
                <CircleCheckIcon
                  aria-label="Ready"
                  role="img"
                  className="size-4 shrink-0 text-success"
                />
              ) : null}
              {file.stage === "failed" ? (
                <div className="flex shrink-0 items-center gap-2">
                  <CircleAlertIcon
                    aria-hidden="true"
                    className="size-4 text-destructive"
                  />
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => retry(file.id)}
                    aria-label={`Retry ${file.name}`}
                  >
                    Retry
                  </Button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
