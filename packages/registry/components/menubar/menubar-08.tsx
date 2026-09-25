"use client";

import * as React from "react";
import { CircleAlert, CircleCheck, CloudUpload, Send } from "lucide-react";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/registry/base/ui/menubar";
import { Spinner } from "@/registry/base/ui/spinner";

type Status = "idle" | "loading" | "success" | "error";

const triggerClass = "focus-visible:ring-2 focus-visible:ring-ring/50";

function useAsyncAction(duration: number, outcome: "success" | "error") {
  const [status, setStatus] = React.useState<Status>("idle");
  const timers = React.useRef<number[]>([]);

  React.useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const id of pending) window.clearTimeout(id);
    };
  }, []);

  const run = () => {
    if (status === "loading") return;
    setStatus("loading");
    timers.current.push(
      window.setTimeout(() => {
        setStatus(outcome);
        if (outcome === "success") {
          timers.current.push(window.setTimeout(() => setStatus("idle"), 2400));
        }
      }, duration),
    );
  };

  return { status, run };
}

function StatusIcon({
  status,
  idle,
}: {
  status: Status;
  idle: React.ReactNode;
}) {
  if (status === "loading") return <Spinner aria-hidden="true" />;
  if (status === "success")
    return <CircleCheck aria-hidden="true" className="text-success" />;
  if (status === "error")
    return <CircleAlert aria-hidden="true" className="text-destructive" />;
  return idle;
}

export default function Menubar08() {
  const publish = useAsyncAction(1400, "success");
  const sync = useAsyncAction(1600, "error");

  const publishLabel = {
    idle: "Publish changes",
    loading: "Publishing…",
    success: "Published",
    error: "Publish failed",
  }[publish.status];

  const syncLabel = {
    idle: "Sync to cloud",
    loading: "Syncing…",
    success: "Synced",
    error: "Sync failed, retry",
  }[sync.status];

  const barStatus =
    publish.status === "loading" || sync.status === "loading"
      ? { text: "Working…", tone: "text-muted-foreground" }
      : sync.status === "error"
        ? { text: "Offline copy", tone: "text-destructive" }
        : publish.status === "success"
          ? { text: "Live", tone: "text-success" }
          : { text: "Draft", tone: "text-muted-foreground" };

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <div className="flex items-center justify-between gap-2 rounded-lg border bg-card p-[3px] pr-2">
        <Menubar aria-label="Release" className="border-0 p-0">
          <MenubarMenu>
            <MenubarTrigger className={triggerClass}>Release</MenubarTrigger>
            <MenubarContent className="min-w-52">
              <MenubarItem
                closeOnClick={false}
                disabled={publish.status === "loading"}
                onClick={publish.run}
              >
                <StatusIcon
                  status={publish.status}
                  idle={<Send aria-hidden="true" />}
                />
                {publishLabel}
                <MenubarShortcut>⌘↵</MenubarShortcut>
              </MenubarItem>
              <MenubarItem
                closeOnClick={false}
                disabled={sync.status === "loading"}
                onClick={sync.run}
                className={
                  sync.status === "error" ? "text-destructive" : undefined
                }
              >
                <StatusIcon
                  status={sync.status}
                  idle={<CloudUpload aria-hidden="true" />}
                />
                {syncLabel}
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem>View release notes</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className={triggerClass}>History</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>v2.4.1 · today</MenubarItem>
              <MenubarItem>v2.4.0 · Sep 18</MenubarItem>
              <MenubarItem>v2.3.2 · Sep 02</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
        <span
          role="status"
          className={`flex items-center gap-1.5 text-xs font-medium ${barStatus.tone}`}
        >
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-current"
          />
          {barStatus.text}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Menu items stay open while they run, so progress and errors show in
        place.
      </p>
    </div>
  );
}
