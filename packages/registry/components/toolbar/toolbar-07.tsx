"use client";

import * as React from "react";
import {
  CircleAlert,
  CircleCheck,
  RefreshCw,
  Rocket,
  Save,
} from "lucide-react";

import { cn } from "cn";

import { Spinner } from "@/registry/base/ui/spinner";
import {
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
} from "@/registry/base/ui/toolbar";

type Status = "idle" | "loading" | "success" | "error";
type ActionId = "save" | "sync" | "publish";

const actions: {
  id: ActionId;
  label: string;
  shortLabel?: string;
  icon: typeof Save;
  busy: string;
  done: string;
  failed?: string;
}[] = [
  {
    id: "save",
    label: "Save draft",
    shortLabel: "Save",
    icon: Save,
    busy: "Saving",
    done: "Saved",
  },
  { id: "sync", label: "Sync", icon: RefreshCw, busy: "Syncing", done: "Synced" },
  {
    id: "publish",
    label: "Publish",
    icon: Rocket,
    busy: "Publishing",
    done: "Published",
    failed: "Retry",
  },
];

const idle: Record<ActionId, Status> = {
  save: "idle",
  sync: "idle",
  publish: "idle",
};

export default function Toolbar07() {
  const [status, setStatus] = React.useState(idle);
  const [message, setMessage] = React.useState({
    text: "All changes saved locally.",
    error: false,
  });
  const publishAttempts = React.useRef(0);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  React.useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending) clearTimeout(timer);
    };
  }, []);

  function schedule(fn: () => void, ms: number) {
    timers.current.push(setTimeout(fn, ms));
  }

  function run(action: (typeof actions)[number]) {
    setStatus((prev) => ({ ...prev, [action.id]: "loading" }));
    setMessage({ text: `${action.busy}…`, error: false });

    // The first publish fails on purpose to show the error state.
    const fails = action.id === "publish" && publishAttempts.current++ === 0;

    schedule(() => {
      setStatus((prev) => ({
        ...prev,
        [action.id]: fails ? "error" : "success",
      }));
      setMessage(
        fails
          ? {
              text: "Publish failed: the cover image is missing alt text. Add it and retry.",
              error: true,
            }
          : { text: `${action.done} just now.`, error: false },
      );
      if (!fails) {
        schedule(() => {
          setStatus((prev) => ({ ...prev, [action.id]: "idle" }));
        }, 1800);
      }
    }, 1200);
  }

  return (
    <div className="flex w-full max-w-md flex-col items-start gap-2">
      <Toolbar aria-label="Post actions" className="max-w-full flex-wrap">
        {actions.map((action, index) => {
          const state = status[action.id];
          const Icon =
            state === "success"
              ? CircleCheck
              : state === "error"
                ? CircleAlert
                : action.icon;
          const label =
            state === "loading"
              ? action.busy
              : state === "success"
                ? action.done
                : state === "error"
                  ? (action.failed ?? action.label)
                  : null;

          return (
            <React.Fragment key={action.id}>
              {index === 2 ? <ToolbarSeparator /> : null}
              <ToolbarButton
                disabled={state === "loading"}
                aria-busy={state === "loading" || undefined}
                onClick={() => run(action)}
                className={cn(
                  "transition-colors max-sm:gap-1.5 max-sm:px-1.5",
                  state === "success" && "text-success",
                  state === "error" &&
                    "text-destructive hover:bg-destructive/10 hover:text-destructive",
                  action.id === "publish" &&
                    state !== "error" &&
                    state !== "success" &&
                    "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                )}
              >
                {state === "loading" ? (
                  <Spinner aria-hidden="true" role="presentation" />
                ) : (
                  <Icon aria-hidden="true" />
                )}
                {label ?? (
                  <>
                    <span className="sm:hidden">
                      {action.shortLabel ?? action.label}
                    </span>
                    <span className="max-sm:hidden">{action.label}</span>
                  </>
                )}
              </ToolbarButton>
            </React.Fragment>
          );
        })}
      </Toolbar>
      <p
        role="status"
        className={cn(
          "text-xs text-muted-foreground",
          message.error && "text-destructive",
        )}
      >
        {message.text}
      </p>
    </div>
  );
}
