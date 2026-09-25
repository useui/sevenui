"use client";

import * as React from "react";
import {
  CircleCheckIcon,
  FileArchiveIcon,
  FileImageIcon,
  FileTextIcon,
  FileVideoIcon,
  RotateCwIcon,
  XIcon,
} from "lucide-react";
import { cn } from "cn";

import { Button } from "@/registry/base/ui/button";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/registry/base/ui/progress";

type Status = "queued" | "uploading" | "processing" | "done" | "failed";

type Upload = {
  id: string;
  name: string;
  sizeMb: number;
  icon: typeof FileTextIcon;
  progress: number;
  status: Status;
  failAt?: number;
  processingTicks: number;
};

const INITIAL: Upload[] = [
  {
    id: "brand",
    name: "brand-guidelines-2026.pdf",
    sizeMb: 8.4,
    icon: FileTextIcon,
    progress: 100,
    status: "done",
    processingTicks: 0,
  },
  {
    id: "launch",
    name: "launch-teaser-cut-03.mp4",
    sizeMb: 146,
    icon: FileVideoIcon,
    progress: 38,
    status: "uploading",
    processingTicks: 0,
  },
  {
    id: "deck",
    name: "board-deck-final.key",
    sizeMb: 52,
    icon: FileArchiveIcon,
    progress: 44,
    status: "uploading",
    failAt: 62,
    processingTicks: 0,
  },
  {
    id: "hero",
    name: "homepage-hero@2x.png",
    sizeMb: 6.1,
    icon: FileImageIcon,
    progress: 0,
    status: "queued",
    processingTicks: 0,
  },
];

const MAX_PARALLEL = 2;
const TICK_MS = 450;

function step(uploads: Upload[]): Upload[] {
  const next = uploads.map((file): Upload => {
    if (file.status === "processing") {
      return file.processingTicks >= 3
        ? { ...file, status: "done" }
        : { ...file, processingTicks: file.processingTicks + 1 };
    }
    if (file.status !== "uploading") return file;
    const increment = Math.max(2, Math.round(240 / file.sizeMb));
    const progress = Math.min(file.progress + increment, 100);
    if (file.failAt !== undefined && progress >= file.failAt) {
      return { ...file, progress: file.failAt, status: "failed" };
    }
    if (progress === 100) {
      return { ...file, progress, status: "processing" };
    }
    return { ...file, progress };
  });

  // Start queued files while a parallel slot is free.
  let active = next.filter((file) => file.status === "uploading").length;
  return next.map((file) => {
    if (file.status === "queued" && active < MAX_PARALLEL) {
      active += 1;
      return { ...file, status: "uploading" };
    }
    return file;
  });
}

const STATUS_TEXT: Record<Status, string> = {
  queued: "Waiting",
  uploading: "Uploading",
  processing: "Scanning for viruses",
  done: "Uploaded",
  failed: "Connection lost",
};

function describe(file: Upload) {
  switch (file.status) {
    case "uploading":
      return `${Math.round((file.sizeMb * file.progress) / 100)} of ${file.sizeMb} MB`;
    case "done":
      return `${file.sizeMb} MB · ${STATUS_TEXT.done}`;
    case "failed":
      return `${STATUS_TEXT.failed} at ${file.progress}%`;
    default:
      return STATUS_TEXT[file.status];
  }
}

export default function Progress09() {
  const [uploads, setUploads] = React.useState(INITIAL);

  const running = uploads.some((file) =>
    ["queued", "uploading", "processing"].includes(file.status),
  );

  React.useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setUploads(step), TICK_MS);
    return () => clearInterval(timer);
  }, [running]);

  const totalMb = uploads.reduce((sum, file) => sum + file.sizeMb, 0);
  const sentMb = uploads.reduce(
    (sum, file) => sum + (file.sizeMb * file.progress) / 100,
    0,
  );
  const doneCount = uploads.filter((file) => file.status === "done").length;
  const failedCount = uploads.filter((file) => file.status === "failed").length;

  function retry(id: string) {
    setUploads((current) =>
      current.map((file) =>
        file.id === id
          ? { ...file, status: "queued", progress: 0, failAt: undefined }
          : file,
      ),
    );
  }

  function remove(id: string) {
    setUploads((current) => current.filter((file) => file.id !== id));
  }

  return (
    <section
      aria-labelledby="progress-09-title"
      className="flex w-full max-w-md flex-col overflow-hidden rounded-xl border bg-card text-card-foreground"
    >
      <div className="flex flex-col gap-3 border-b bg-muted/40 p-4">
        <h3 id="progress-09-title" className="text-sm font-medium">
          Uploading to Marketing / Q4 launch
        </h3>
        <Progress
          value={totalMb === 0 ? 0 : (sentMb / totalMb) * 100}
          getAriaValueText={(formatted) =>
            `${formatted} of all files uploaded`
          }
          className="gap-1.5 [&_[data-slot=progress-track]]:h-1.5"
        >
          <ProgressLabel className="text-xs font-normal text-muted-foreground tabular-nums">
            {doneCount} of {uploads.length} files ·{" "}
            {Math.round(sentMb)} / {Math.round(totalMb)} MB
            {failedCount > 0 ? ` · ${failedCount} failed` : ""}
          </ProgressLabel>
          <ProgressValue className="text-xs" />
        </Progress>
      </div>

      {uploads.length === 0 ? (
        <p className="p-6 text-center text-sm text-muted-foreground">
          No uploads in progress.
        </p>
      ) : (
        <ul className="flex flex-col divide-y">
          {uploads.map((file) => {
            const Icon = file.icon;
            const failed = file.status === "failed";
            const done = file.status === "done";
            return (
              <li key={file.id} className="flex items-start gap-3 p-4">
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
                >
                  <Icon className="size-4" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <Progress
                    value={file.status === "processing" ? null : file.progress}
                    getAriaValueText={(formatted, value) =>
                      value === null
                        ? `${file.name}: ${STATUS_TEXT.processing}`
                        : `${file.name}: ${STATUS_TEXT[file.status]}, ${formatted}`
                    }
                    className={cn(
                      "gap-x-2 gap-y-1.5 [&[data-indeterminate]_[data-slot=progress-indicator]]:w-full [&[data-indeterminate]_[data-slot=progress-indicator]]:animate-pulse motion-reduce:[&[data-indeterminate]_[data-slot=progress-indicator]]:animate-none",
                      failed &&
                        "[&_[data-slot=progress-indicator]]:bg-destructive",
                      done && "[&_[data-slot=progress-track]]:hidden",
                    )}
                  >
                    <ProgressLabel className="min-w-0 flex-1 truncate">
                      {file.name}
                    </ProgressLabel>
                    <span
                      className={cn(
                        "flex w-full items-center gap-1.5 text-xs text-muted-foreground tabular-nums",
                        failed && "text-destructive",
                      )}
                    >
                      {done ? (
                        <CircleCheckIcon
                          aria-hidden="true"
                          className="size-3.5 text-success"
                        />
                      ) : null}
                      <span>{describe(file)}</span>
                      {file.status === "uploading" ? (
                        <ProgressValue className="text-xs" />
                      ) : null}
                    </span>
                  </Progress>
                </div>
                {failed ? (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Retry ${file.name}`}
                    onClick={() => retry(file.id)}
                  >
                    <RotateCwIcon aria-hidden="true" />
                  </Button>
                ) : null}
                {done ? null : (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Cancel ${file.name}`}
                    onClick={() => remove(file.id)}
                  >
                    <XIcon aria-hidden="true" />
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
