"use client";

import * as React from "react";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  GitBranchIcon,
  KanbanIcon,
  LockIcon,
  MessageSquareIcon,
  PenToolIcon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/registry/base/ui/item";
import { Spinner } from "@/registry/base/ui/spinner";

type Status = "idle" | "connecting" | "connected" | "error" | "locked";

const integrations = [
  {
    id: "chat",
    icon: MessageSquareIcon,
    name: "Team chat",
    description: "Post deploy summaries to a channel.",
    initial: "connected" as Status,
    failsOnce: false,
  },
  {
    id: "git",
    icon: GitBranchIcon,
    name: "Git provider",
    description: "Link pull requests to tasks automatically.",
    initial: "idle" as Status,
    failsOnce: false,
  },
  {
    id: "tracker",
    icon: KanbanIcon,
    name: "Issue tracker",
    description: "Sync issue status in both directions.",
    initial: "idle" as Status,
    failsOnce: true,
  },
  {
    id: "design",
    icon: PenToolIcon,
    name: "Design files",
    description: "Embed live frames in any page.",
    initial: "locked" as Status,
    failsOnce: false,
  },
];

const descriptions: Partial<Record<Status, string>> = {
  connecting: "Waiting for authorization…",
  error: "Authorization timed out. Check pop-up blockers and try again.",
  locked: "Available on the Business plan.",
};

export default function Item09() {
  const [status, setStatus] = React.useState<Record<string, Status>>(() =>
    Object.fromEntries(integrations.map((entry) => [entry.id, entry.initial])),
  );
  const failed = React.useRef(new Set<string>());
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  React.useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function connect(id: string, failsOnce: boolean) {
    setStatus((current) => ({ ...current, [id]: "connecting" }));
    const shouldFail = failsOnce && !failed.current.has(id);
    timers.current.push(
      setTimeout(() => {
        if (shouldFail) failed.current.add(id);
        setStatus((current) => ({
          ...current,
          [id]: shouldFail ? "error" : "connected",
        }));
      }, 1400),
    );
  }

  function disconnect(id: string) {
    setStatus((current) => ({ ...current, [id]: "idle" }));
  }

  // Stands in for the upgrade flow: once the plan allows it, the
  // integration becomes connectable.
  function unlock(id: string) {
    setStatus((current) => ({ ...current, [id]: "idle" }));
  }

  return (
    <ItemGroup aria-label="Integrations" className="w-full max-w-md gap-2">
      {integrations.map(({ id, icon: Icon, name, description, failsOnce }) => {
        const state = status[id];
        return (
          <Item
            key={id}
            role="listitem"
            variant="outline"
            aria-busy={state === "connecting"}
            data-status={state}
            className="data-[status=error]:border-destructive/40 data-[status=error]:bg-destructive/5 data-[status=locked]:bg-muted/40"
          >
            <ItemMedia
              variant="icon"
              className="size-9 rounded-md bg-muted text-foreground in-data-[status=locked]:text-muted-foreground"
            >
              <Icon aria-hidden="true" />
            </ItemMedia>
            <ItemContent className="min-w-40 gap-0.5">
              <ItemTitle>
                {name}
                {state === "connected" ? (
                  <CircleCheckIcon
                    role="img"
                    aria-label="Connected"
                    className="size-3.5 text-success"
                  />
                ) : null}
              </ItemTitle>
              <ItemDescription
                aria-live="polite"
                className="flex items-start gap-1.5 in-data-[status=error]:text-destructive"
              >
                {state === "error" ? (
                  <CircleAlertIcon
                    aria-hidden="true"
                    className="mt-0.5 size-3.5 shrink-0"
                  />
                ) : null}
                <span>{descriptions[state] ?? description}</span>
              </ItemDescription>
            </ItemContent>
            <ItemActions className="ml-auto">
              {state === "idle" ? (
                <Button size="sm" onClick={() => connect(id, failsOnce)}>
                  Connect
                </Button>
              ) : null}
              {state === "connecting" ? (
                <Button size="sm" variant="outline" disabled>
                  <Spinner aria-hidden="true" />
                  Connecting
                </Button>
              ) : null}
              {state === "connected" ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => disconnect(id)}
                >
                  Disconnect
                </Button>
              ) : null}
              {state === "error" ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => connect(id, failsOnce)}
                >
                  Try again
                </Button>
              ) : null}
              {state === "locked" ? (
                <Button size="sm" variant="outline" onClick={() => unlock(id)}>
                  <LockIcon aria-hidden="true" />
                  Upgrade
                </Button>
              ) : null}
            </ItemActions>
          </Item>
        );
      })}
    </ItemGroup>
  );
}
