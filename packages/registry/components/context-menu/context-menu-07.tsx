"use client";

import {
  AlertCircle,
  Check,
  CloudUpload,
  RefreshCw,
  Rocket,
} from "lucide-react";
import * as React from "react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/registry/base/ui/context-menu";
import { Spinner } from "@/registry/base/ui/spinner";

// macOS browsers never turn Shift+F10 into a contextmenu event (Windows and
// Linux do), so the shortcut the hint advertises is forwarded by hand there.
function openMenuWithShiftF10(event: React.KeyboardEvent<HTMLElement>) {
  if (event.key !== "F10" || !event.shiftKey) return;
  if (!/Mac|iPhone|iPad/.test(navigator.userAgent)) return;
  event.preventDefault();
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.dispatchEvent(
    new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: rect.left + 8,
      clientY: rect.top + 8,
    }),
  );
}

type Status = "idle" | "loading" | "success" | "error";
type ActionKey = "sync" | "backup" | "publish";

const actions: {
  key: ActionKey;
  label: string;
  icon: typeof RefreshCw;
  outcome: "success" | "error";
  success: string;
  error: string;
}[] = [
  {
    key: "sync",
    label: "Sync with GitHub",
    icon: RefreshCw,
    outcome: "success",
    success: "Synced 12 commits",
    error: "",
  },
  {
    key: "backup",
    label: "Back up database",
    icon: CloudUpload,
    outcome: "success",
    success: "Snapshot saved",
    error: "",
  },
  {
    key: "publish",
    label: "Deploy to production",
    icon: Rocket,
    outcome: "error",
    success: "Deployed in 48s",
    error: "Build failed: 2 type errors",
  },
];

const initialStatus: Record<ActionKey, Status> = {
  sync: "idle",
  backup: "idle",
  publish: "idle",
};

export default function ContextMenu07() {
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState(initialStatus);
  const [announcement, setAnnouncement] = React.useState("");
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  React.useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function run(action: (typeof actions)[number]) {
    if (status[action.key] === "loading") return;
    // The first deploy fails on purpose; a retry succeeds.
    const outcome = status[action.key] === "error" ? "success" : action.outcome;
    setStatus((prev) => ({ ...prev, [action.key]: "loading" }));
    setAnnouncement(`${action.label} started`);
    timers.current.push(
      setTimeout(() => {
        setStatus((prev) => ({ ...prev, [action.key]: outcome }));
        setAnnouncement(outcome === "success" ? action.success : action.error);
      }, 1400),
    );
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      // Drop results still pending from the last visit so they cannot land
      // on the freshly reset menu.
      timers.current.forEach(clearTimeout);
      timers.current.length = 0;
      setStatus(initialStatus);
    }
  }

  const busy = Object.values(status).some((value) => value === "loading");

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <ContextMenu open={open} onOpenChange={handleOpenChange}>
        <ContextMenuTrigger
          onKeyDown={openMenuWithShiftF10}
          tabIndex={0}
          aria-label="acme-web project. Right-click or press Shift+F10 for project actions."
          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:border-ring"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">acme-web</p>
            <p className="truncate text-xs text-muted-foreground">
              main · last deploy 3 hours ago
            </p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {open ? (busy ? "Working…" : "Menu open") : "Right-click"}
          </span>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuGroup>
            <ContextMenuLabel>Project actions</ContextMenuLabel>
            {actions.map((action) => {
              const state = status[action.key];
              const Icon = action.icon;
              return (
                <ContextMenuItem
                  key={action.key}
                  closeOnClick={false}
                  label={action.label}
                  aria-busy={state === "loading"}
                  onClick={() => run(action)}
                  className="items-start py-1.5"
                >
                  <span className="mt-0.5 flex size-4 items-center justify-center">
                    {state === "loading" ? (
                      <Spinner aria-hidden="true" />
                    ) : state === "success" ? (
                      <Check aria-hidden="true" className="text-success" />
                    ) : state === "error" ? (
                      <AlertCircle
                        aria-hidden="true"
                        className="text-destructive"
                      />
                    ) : (
                      <Icon aria-hidden="true" />
                    )}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span>{action.label}</span>
                    {state === "loading" && (
                      <span className="text-xs text-muted-foreground">
                        Running…
                      </span>
                    )}
                    {state === "success" && (
                      <span className="text-xs text-muted-foreground">
                        {action.success}
                      </span>
                    )}
                    {state === "error" && (
                      <span className="text-xs text-destructive">
                        {action.error} · Click to retry
                      </span>
                    )}
                  </span>
                </ContextMenuItem>
              );
            })}
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => setOpen(false)}>
            Done
            <ContextMenuShortcut>Esc</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      <p className="text-xs text-muted-foreground">
        Actions keep the menu open and report progress inline.
      </p>
    </div>
  );
}
