"use client";

import * as React from "react";
import {
  CircleCheckIcon,
  CloudUploadIcon,
  FileIcon,
  UploadIcon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Progress } from "@/registry/base/ui/progress";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  useToastManager,
} from "@/registry/base/ui/toast";

type UploadData = {
  progress: number;
  current: string;
};

const toastManager = createToastManager<UploadData>();

const UPLOAD_TOAST_ID = "upload-batch";

const queue = [
  { name: "site-visit-001.jpg", size: 2.4 },
  { name: "site-visit-002.jpg", size: 3.1 },
  { name: "floor-plan-rev-c.pdf", size: 1.2 },
  { name: "structural-notes.docx", size: 0.4 },
];

const totalSize = queue.reduce((sum, file) => sum + file.size, 0);

function fileAt(progress: number) {
  // Map overall progress to the file currently being sent.
  let sent = 0;
  for (const file of queue) {
    sent += file.size;
    if ((progress / 100) * totalSize < sent) return file;
  }
  return queue[queue.length - 1];
}

function UploadToasts() {
  const { toasts } = useToastManager<UploadData>();

  return toasts.map((toastItem) => {
    const data = toastItem.data;
    const done = toastItem.type === "success";

    return (
      <Toast key={toastItem.id} toast={toastItem}>
        <ToastContent className="items-start">
          <span className="mt-0.5 shrink-0 text-muted-foreground">
            {done ? (
              <CircleCheckIcon className="size-4" aria-hidden="true" />
            ) : (
              <CloudUploadIcon className="size-4" aria-hidden="true" />
            )}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-col gap-0.5">
              <ToastTitle />
              <ToastDescription className="truncate text-xs" />
            </div>
            {data && !done ? (
              <Progress
                value={data.progress}
                aria-label="Upload progress"
                className="w-full"
              />
            ) : null}
            {toastItem.actionProps ? (
              <ToastAction className="w-fit" />
            ) : null}
          </div>
          {done ? <ToastClose className="-mt-1 -mr-1" /> : null}
        </ToastContent>
      </Toast>
    );
  });
}

export default function Toast14() {
  const [status, setStatus] = React.useState<"idle" | "uploading" | "done">(
    "idle",
  );
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const stop = React.useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  React.useEffect(() => stop, [stop]);

  function cancel() {
    stop();
    setStatus("idle");
    toastManager.update(UPLOAD_TOAST_ID, {
      type: "info",
      title: "Upload canceled",
      description: "Files that finished stay in the folder.",
      timeout: 4000,
      data: undefined,
      actionProps: undefined,
    });
  }

  function start() {
    stop();
    setStatus("uploading");
    let progress = 0;

    toastManager.add({
      id: UPLOAD_TOAST_ID,
      type: "loading",
      title: `Uploading ${queue.length} files`,
      description: `${queue[0].name} · 0 of ${totalSize.toFixed(1)} MB`,
      timeout: 0,
      data: { progress: 0, current: queue[0].name },
      actionProps: { children: "Cancel", onClick: cancel },
    });

    intervalRef.current = setInterval(() => {
      progress = Math.min(100, progress + 4 + Math.random() * 6);
      const file = fileAt(progress);
      const sent = ((progress / 100) * totalSize).toFixed(1);

      if (progress >= 100) {
        stop();
        setStatus("done");
        toastManager.update(UPLOAD_TOAST_ID, {
          type: "success",
          title: `${queue.length} files uploaded`,
          description: "Saved to Projects / Harbor Street renovation.",
          timeout: 5000,
          data: undefined,
          actionProps: undefined,
        });
        return;
      }

      toastManager.update(UPLOAD_TOAST_ID, {
        description: `${file.name} · ${sent} of ${totalSize.toFixed(1)} MB`,
        data: { progress, current: file.name },
      });
    }, 350);
  }

  return (
    <ToastProvider toastManager={toastManager}>
      <ToastPortal>
        <ToastViewport>
          <UploadToasts />
        </ToastViewport>
      </ToastPortal>
      <section
        aria-labelledby="toast-14-heading"
        className="flex w-full max-w-md flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground"
      >
        <div className="flex flex-col gap-0.5">
          <h3 id="toast-14-heading" className="font-medium">
            Harbor Street renovation
          </h3>
          <p className="text-sm text-muted-foreground">
            {status === "done"
              ? "All files are in the project folder."
              : `${queue.length} files ready · ${totalSize.toFixed(1)} MB`}
          </p>
        </div>
        <ul className="flex flex-col gap-1 rounded-lg border border-dashed p-2">
          {queue.map((file) => (
            <li
              key={file.name}
              className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm"
            >
              {status === "done" ? (
                <CircleCheckIcon
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              ) : (
                <FileIcon
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {file.size.toFixed(1)} MB
              </span>
            </li>
          ))}
        </ul>
        <Button
          className="w-full"
          disabled={status === "uploading"}
          onClick={start}
        >
          <UploadIcon aria-hidden="true" />
          {status === "uploading"
            ? "Uploading…"
            : status === "done"
              ? "Upload again"
              : "Upload all files"}
        </Button>
      </section>
    </ToastProvider>
  );
}
