"use client";

import * as React from "react";
import { KeyRound, Plus } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/base/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";

type ApiKey = {
  id: string;
  label: string;
  preview: string;
  scope: string;
  lastUsed: string;
};

const initialKeys: ApiKey[] = [
  {
    id: "key_prod",
    label: "Production server",
    preview: "sk_live_…8f2a",
    scope: "Read & write",
    lastUsed: "2 minutes ago",
  },
  {
    id: "key_ci",
    label: "GitHub Actions",
    preview: "sk_live_…41c9",
    scope: "Deploy only",
    lastUsed: "Yesterday",
  },
  {
    id: "key_local",
    label: "Local development",
    preview: "sk_test_…d07e",
    scope: "Read only",
    lastUsed: "3 weeks ago",
  },
];

function RevokeKeyDialog({
  apiKey,
  onRevoke,
}: {
  apiKey: ApiKey;
  onRevoke: (id: string) => void;
}) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Revoke ${apiKey.label} key`}
          >
            Revoke
          </Button>
        }
      />
      <DialogContent showCloseButton={false} className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Revoke "{apiKey.label}"?</DialogTitle>
          <DialogDescription>
            Requests signed with{" "}
            <span className="font-mono text-foreground">{apiKey.preview}</span>{" "}
            will fail immediately. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Keep key</Button>} />
          <DialogClose
            render={
              <Button
                variant="destructive"
                onClick={() => onRevoke(apiKey.id)}
              >
                Revoke key
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Dialog10() {
  const [keys, setKeys] = React.useState(initialKeys);
  const created = React.useRef(0);
  const list = React.useRef<HTMLUListElement>(null);
  const createButton = React.useRef<HTMLButtonElement>(null);

  // The revoked row takes its trigger with it, so move focus to the row that
  // slides into its place, or to "Create key" once the list is empty.
  const revokeKey = (id: string) => {
    const index = keys.findIndex((k) => k.id === id);
    setKeys((current) => current.filter((k) => k.id !== id));
    requestAnimationFrame(() => {
      const triggers =
        list.current?.querySelectorAll<HTMLButtonElement>("li button") ?? [];
      const next = triggers[Math.min(index, triggers.length - 1)];
      (next ?? createButton.current)?.focus();
    });
  };

  const createKey = () => {
    created.current += 1;
    const suffix = (4096 + created.current * 2731).toString(16).slice(-4);
    setKeys((current) => [
      ...current,
      {
        id: `key_new_${created.current}`,
        label: `Untitled key ${created.current}`,
        preview: `sk_live_…${suffix}`,
        scope: "Read only",
        lastUsed: "Never",
      },
    ]);
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline">
            <KeyRound aria-hidden="true" data-icon="inline-start" />
            Manage API keys
          </Button>
        }
      />
      <DialogContent className="transition-[scale,opacity,filter] duration-200 ease-out data-nested-dialog-open:scale-[0.96] data-nested-dialog-open:opacity-80 data-nested-dialog-open:blur-[1px] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>API keys</DialogTitle>
          <DialogDescription>
            Keys grant access to the Acme API on behalf of this workspace.
          </DialogDescription>
        </DialogHeader>
        {keys.length > 0 ? (
          <ul ref={list} className="-mx-1 grid">
            {keys.map((apiKey) => (
              <li
                key={apiKey.id}
                className="flex items-center gap-3 px-1 py-2.5 not-last:border-b"
              >
                <div className="grid min-w-0 flex-1 gap-0.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-medium">
                      {apiKey.label}
                    </span>
                    <Badge variant="outline" className="hidden sm:inline-flex">
                      {apiKey.scope}
                    </Badge>
                  </div>
                  <span className="truncate text-xs text-muted-foreground">
                    <span className="font-mono">{apiKey.preview}</span> ·{" "}
                    {apiKey.lastUsed === "Never"
                      ? "Never used"
                      : `Used ${apiKey.lastUsed.toLowerCase()}`}
                  </span>
                </div>
                <RevokeKeyDialog apiKey={apiKey} onRevoke={revokeKey} />
              </li>
            ))}
          </ul>
        ) : (
          <Empty className="rounded-lg border border-dashed py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <KeyRound aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>No active keys</EmptyTitle>
              <EmptyDescription>
                Integrations that used these keys are disconnected. Create a key to reconnect them.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
        <DialogFooter>
          <Button ref={createButton} variant="outline" onClick={createKey}>
            <Plus aria-hidden="true" data-icon="inline-start" />
            Create key
          </Button>
          <DialogClose render={<Button>Done</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
