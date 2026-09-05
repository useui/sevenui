"use client";

import * as React from "react";
import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { CircleAlertIcon, CircleCheckIcon, XIcon } from "lucide-react";

import { cn } from "@/registry/base/lib/utils";

const toastManager = ToastPrimitive.createToastManager();

type AddOptions = Parameters<typeof toastManager.add>[0];
type ToastOptions = Omit<AddOptions, "title" | "type">;

const toast = Object.assign(
  (title: React.ReactNode, options?: ToastOptions) =>
    toastManager.add({ title, ...options }),
  {
    success: (title: React.ReactNode, options?: ToastOptions) =>
      toastManager.add({ title, type: "success", ...options }),
    error: (title: React.ReactNode, options?: ToastOptions) =>
      toastManager.add({ title, type: "error", ...options }),
    promise: toastManager.promise,
    dismiss: (toastId?: string) => toastManager.close(toastId),
  },
);

function Toaster({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <ToastPrimitive.Provider toastManager={toastManager}>
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport
          className={cn(
            "fixed right-4 bottom-4 z-50 w-[calc(100vw-2rem)] sm:right-6 sm:bottom-6 sm:w-90",
            className,
          )}
          {...props}
        >
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();
  return toasts.map((toastItem) => (
    <ToastPrimitive.Root
      key={toastItem.id}
      toast={toastItem}
      className={cn(
        "absolute right-0 bottom-0 left-auto w-full rounded-lg border bg-popover p-4 text-popover-foreground shadow-lg outline-none select-none",
        "[--gap:0.75rem] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))]",
        "z-[calc(1000-var(--toast-index))] h-[var(--height)] origin-[bottom_center]",
        "[transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s]",
        "[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))]",
        "data-[expanded]:h-[var(--toast-height)] data-[expanded]:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
        "data-[starting-style]:[transform:translateY(150%)]",
        "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
        "data-[ending-style]:opacity-0 data-[limited]:opacity-0",
        "data-[ending-style]:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-[ending-style]:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
      )}
    >
      <ToastPrimitive.Content className="flex w-full items-start gap-3 overflow-hidden transition-opacity duration-300 data-[behind]:opacity-0 data-[expanded]:opacity-100">
        {toastItem.type === "success" && (
          <CircleCheckIcon className="mt-0.5 size-4 shrink-0" />
        )}
        {toastItem.type === "error" && (
          <CircleAlertIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <ToastPrimitive.Title className="text-sm leading-none font-medium" />
          <ToastPrimitive.Description className="text-sm text-muted-foreground" />
        </div>
        <ToastPrimitive.Action className="inline-flex h-7 shrink-0 items-center rounded-md border bg-transparent px-2 text-xs font-medium shadow-xs outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50" />
        <ToastPrimitive.Close
          aria-label="Close"
          className="shrink-0 rounded-xs text-muted-foreground opacity-70 transition-opacity outline-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <XIcon className="size-4" />
        </ToastPrimitive.Close>
      </ToastPrimitive.Content>
    </ToastPrimitive.Root>
  ));
}

export { Toaster, toast };
