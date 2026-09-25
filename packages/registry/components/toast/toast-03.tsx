"use client";

import * as React from "react";
import { DownloadIcon, RefreshCwIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
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

const nextVersion = "2.4.0";

const toastManager = createToastManager();

function UpdateToasts() {
  const { toasts } = useToastManager();

  return toasts.map((toastItem) => (
    <Toast key={toastItem.id} toast={toastItem}>
      <ToastContent className="flex-col items-stretch gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
            <DownloadIcon aria-hidden="true" className="size-4" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <ToastTitle />
            <ToastDescription className="text-pretty" />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border pt-3">
          <ToastClose
            aria-label={undefined}
            render={<Button variant="ghost" size="sm" />}
            className="text-foreground after:hidden"
          >
            Remind me later
          </ToastClose>
          <ToastAction render={<Button size="sm" />} />
        </div>
      </ToastContent>
    </Toast>
  ));
}

export default function Toast03() {
  const [status, setStatus] = React.useState<"current" | "restarting">(
    "current",
  );

  const showUpdate = () => {
    const id = toastManager.add({
      id: "desktop-update",
      title: `Version ${nextVersion} is ready`,
      description:
        "Includes offline drafts and faster search. Restart to finish installing.",
      timeout: 0,
      actionProps: {
        children: "Restart now",
        onClick: () => {
          setStatus("restarting");
          toastManager.close(id);
        },
      },
    });
  };

  return (
    <ToastProvider toastManager={toastManager}>
      <div className="flex w-full max-w-xs flex-col items-center gap-3 text-center">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {status === "current"
            ? "Acme Desktop 2.3.2 is installed."
            : `Restarting to apply ${nextVersion}…`}
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setStatus("current");
            showUpdate();
          }}
        >
          <RefreshCwIcon aria-hidden="true" />
          Check for updates
        </Button>
      </div>
      <ToastPortal>
        <ToastViewport>
          <UpdateToasts />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}
