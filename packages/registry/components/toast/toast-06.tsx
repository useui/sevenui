"use client";

import * as React from "react";
import { CloudCheckIcon, PencilLineIcon, WifiOffIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import { Spinner } from "@/registry/base/ui/spinner";
import { Switch } from "@/registry/base/ui/switch";
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

type ConnectionData = {
  pending: number;
};

const CONNECTION_ID = "connection";

const toastManager = createToastManager<ConnectionData>();

function plural(count: number) {
  return count === 1 ? "1 edit" : `${count} edits`;
}

function ConnectionIcon({ type }: { type: string | undefined }) {
  if (type === "syncing") {
    return <Spinner aria-hidden="true" className="size-4" />;
  }

  if (type === "online") {
    return <CloudCheckIcon aria-hidden="true" className="size-4 text-success" />;
  }

  return <WifiOffIcon aria-hidden="true" className="size-4" />;
}

function ConnectionToasts() {
  const { toasts } = useToastManager<ConnectionData>();

  return toasts.map((toastItem) => {
    const pending = toastItem.data?.pending ?? 0;
    const offline = toastItem.type === "offline";

    return (
      <Toast key={toastItem.id} toast={toastItem}>
        <ToastContent>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ConnectionIcon type={toastItem.type} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <ToastTitle />
            <ToastDescription className="text-xs text-pretty" />
          </div>
          {offline && pending > 0 ? (
            <Badge variant="secondary" className="shrink-0 tabular-nums">
              {plural(pending)} waiting
            </Badge>
          ) : null}
          {toastItem.type === "online" ? <ToastClose /> : null}
        </ToastContent>
      </Toast>
    );
  });
}

export default function Toast06() {
  const [online, setOnline] = React.useState(true);
  const [pending, setPending] = React.useState(0);
  const [saved, setSaved] = React.useState(12);
  const syncTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    },
    [],
  );

  const goOffline = () => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    setOnline(false);
    toastManager.add({
      id: CONNECTION_ID,
      type: "offline",
      priority: "high",
      title: "You're offline",
      description: "Edits are kept on this device until you reconnect.",
      timeout: 0,
      data: { pending },
    });
  };

  const goOnline = () => {
    setOnline(true);
    const count = pending;

    if (count === 0) {
      toastManager.update(CONNECTION_ID, {
        type: "online",
        title: "Back online",
        description: "Nothing to sync. You're up to date.",
        timeout: 3000,
      });
      return;
    }

    toastManager.update(CONNECTION_ID, {
      type: "syncing",
      title: "Back online",
      description: `Syncing ${plural(count)}…`,
    });

    syncTimer.current = setTimeout(() => {
      setPending(0);
      setSaved((current) => current + count);
      toastManager.update(CONNECTION_ID, {
        type: "online",
        title: "All changes synced",
        description: `${plural(count)} made offline are saved to the cloud.`,
        timeout: 4000,
        data: { pending: 0 },
      });
    }, 1200);
  };

  const edit = () => {
    if (online) {
      setSaved((current) => current + 1);
      return;
    }

    const next = pending + 1;
    setPending(next);
    toastManager.update(CONNECTION_ID, { data: { pending: next } });
  };

  return (
    <ToastProvider toastManager={toastManager}>
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-sm font-medium">
              Q4 hiring plan
            </span>
            <span className="text-sm text-muted-foreground" aria-live="polite">
              {online
                ? `${saved} edits saved`
                : `${plural(pending)} saved on this device`}
            </span>
          </div>
          <Label className="shrink-0 gap-2 text-sm font-normal">
            Online
            <Switch
              checked={online}
              onCheckedChange={(checked) =>
                checked ? goOnline() : goOffline()
              }
            />
          </Label>
        </div>
        <Button variant="outline" onClick={edit}>
          <PencilLineIcon aria-hidden="true" />
          Edit the document
        </Button>
      </div>
      <ToastPortal>
        <ToastViewport>
          <ConnectionToasts />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}
