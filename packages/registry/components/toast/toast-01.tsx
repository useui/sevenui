"use client";

import { CheckIcon, CopyIcon, LinkIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Toast,
  ToastContent,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  useToastManager,
} from "@/registry/base/ui/toast";

const shareUrl = "https://acme.app/share/q3-roadmap";

const toastManager = createToastManager();

function CompactToasts() {
  const { toasts } = useToastManager();

  return toasts.map((toastItem) => (
    <Toast
      key={toastItem.id}
      toast={toastItem}
      className="rounded-full border-transparent bg-foreground text-background shadow-md focus-visible:ring-ring"
    >
      <ToastContent className="gap-2 px-4 py-2.5">
        <CheckIcon aria-hidden="true" className="size-4 shrink-0" />
        <ToastTitle className="truncate" />
      </ToastContent>
    </Toast>
  ));
}

export default function Toast01() {
  const copyLink = () => {
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
    toastManager.add({
      id: "link-copied",
      title: "Link copied to clipboard",
      timeout: 2000,
    });
  };

  return (
    <ToastProvider toastManager={toastManager}>
      <div className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-border bg-background p-1.5 pl-3 shadow-xs">
        <LinkIcon
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground"
        />
        <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
          {shareUrl}
        </span>
        <Button size="sm" variant="secondary" onClick={copyLink}>
          <CopyIcon aria-hidden="true" />
          Copy link
        </Button>
      </div>
      <ToastPortal>
        <ToastViewport>
          <CompactToasts />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}
