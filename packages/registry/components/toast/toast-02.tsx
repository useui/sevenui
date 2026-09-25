"use client";

import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Toast,
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

type Status = "success" | "info" | "warning" | "error";

const statuses: Record<
  Status,
  {
    label: string;
    icon: typeof InfoIcon;
    tile: string;
    title: string;
    description: string;
  }
> = {
  success: {
    label: "Success",
    icon: CircleCheckIcon,
    tile: "bg-success/12 text-success",
    title: "Invoice INV-2048 sent",
    description: "Delivered to billing@northwind.io.",
  },
  info: {
    label: "Info",
    icon: InfoIcon,
    tile: "bg-primary/10 text-primary",
    title: "Maintenance on Saturday",
    description: "The API is read-only from 02:00 to 03:00 UTC.",
  },
  warning: {
    label: "Warning",
    icon: TriangleAlertIcon,
    tile: "bg-warning/20 text-warning-foreground dark:text-warning",
    title: "Storage almost full",
    description: "4.5 of 5 GB used on the Team plan.",
  },
  error: {
    label: "Error",
    icon: CircleAlertIcon,
    tile: "bg-destructive/10 text-destructive",
    title: "Payment failed",
    description: "Card ending in 4242 was declined. Update your billing details.",
  },
};

const order: Status[] = ["success", "info", "warning", "error"];

const toastManager = createToastManager();

function StatusToasts() {
  const { toasts } = useToastManager();

  return toasts.map((toastItem) => {
    const status = statuses[(toastItem.type as Status) ?? "info"];
    const Icon = status.icon;

    return (
      <Toast key={toastItem.id} toast={toastItem}>
        <ToastContent className="items-start">
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${status.tile}`}
          >
            <Icon aria-hidden="true" className="size-4.5" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5">
            <ToastTitle />
            <ToastDescription className="text-pretty" />
          </div>
          <ToastClose className="-mt-1 -mr-1" />
        </ToastContent>
      </Toast>
    );
  });
}

export default function Toast02() {
  return (
    <ToastProvider toastManager={toastManager}>
      <div className="grid w-full max-w-md grid-cols-2 gap-2 sm:grid-cols-4">
        {order.map((type) => {
          const status = statuses[type];
          const Icon = status.icon;

          return (
            <Button
              key={type}
              variant="outline"
              onClick={() =>
                toastManager.add({
                  type,
                  title: status.title,
                  description: status.description,
                  priority: type === "error" ? "high" : "low",
                })
              }
            >
              <Icon aria-hidden="true" />
              {status.label}
            </Button>
          );
        })}
      </div>
      <ToastPortal>
        <ToastViewport>
          <StatusToasts />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}
