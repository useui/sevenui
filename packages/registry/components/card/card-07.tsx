"use client";

import * as React from "react";
import { CircleAlert, Inbox, RotateCw, User } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { Skeleton } from "@/registry/base/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Status = "ready" | "loading" | "empty" | "error";

const states: { value: Status; label: string }[] = [
  { value: "ready", label: "Ready" },
  { value: "loading", label: "Loading" },
  { value: "empty", label: "Empty" },
  { value: "error", label: "Error" },
];

const tickets = [
  { id: "T-1042", customer: "Olivia Martin", subject: "Refund not showing on my card", time: "4m ago" },
  { id: "T-1039", customer: "Noah Brooks", subject: "Can't export reports to CSV", time: "1h ago" },
  { id: "T-1031", customer: "Ava Thompson", subject: "Change billing email address", time: "Yesterday" },
];

function TicketsBody({
  status,
  onRetry,
}: {
  status: Status;
  onRetry: () => void;
}) {
  if (status === "loading") {
    return (
      <ul aria-hidden="true" className="flex flex-col gap-4">
        {tickets.map((ticket) => (
          <li key={ticket.id} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </li>
        ))}
      </ul>
    );
  }

  if (status === "empty") {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center">
        <Inbox aria-hidden="true" className="size-5 text-muted-foreground" />
        <p className="font-medium">Inbox zero</p>
        <p className="text-xs text-muted-foreground text-pretty">
          No open tickets. New requests from the help widget land here.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-2 rounded-lg bg-destructive/5 px-4 py-6 text-center"
      >
        <CircleAlert aria-hidden="true" className="size-5 text-destructive" />
        <p className="font-medium">Couldn't load tickets</p>
        <p className="text-xs text-muted-foreground text-pretty">
          The helpdesk service timed out. No tickets were lost; try again.
        </p>
        <Button size="sm" variant="outline" className="mt-1" onClick={onRetry}>
          <RotateCw aria-hidden="true" data-icon="inline-start" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {tickets.map((ticket) => (
        <li key={ticket.id} className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate font-medium">{ticket.subject}</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <User aria-hidden="true" className="size-3" />
              {ticket.customer} · {ticket.id}
            </span>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {ticket.time}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function Card07() {
  const [status, setStatus] = React.useState<Status>("ready");
  const [refreshing, setRefreshing] = React.useState(false);

  // Refresh and Retry simulate a short round trip before showing the tickets.
  React.useEffect(() => {
    if (!refreshing) return;
    const timer = window.setTimeout(() => {
      setRefreshing(false);
      setStatus("ready");
    }, 900);
    return () => window.clearTimeout(timer);
  }, [refreshing]);

  const refresh = () => {
    setStatus("loading");
    setRefreshing(true);
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span id="card-07-state-label" className="text-xs text-muted-foreground">
          Preview state
        </span>
        <ToggleGroup
          aria-labelledby="card-07-state-label"
          variant="outline"
          size="sm"
          spacing={0}
          value={[status]}
          onValueChange={(next) => {
            if (next.length > 0) {
              setRefreshing(false);
              setStatus(next[0] as Status);
            }
          }}
          className="w-full"
        >
          {states.map((state) => (
            <ToggleGroupItem key={state.value} value={state.value} className="flex-1">
              {state.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <Card aria-busy={status === "loading"}>
        <CardHeader>
          <CardTitle>Open tickets</CardTitle>
          <CardDescription>Billing queue · Assigned to you</CardDescription>
          <CardAction>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Refresh tickets"
              disabled={status === "loading"}
              onClick={refresh}
            >
              <RotateCw
                aria-hidden="true"
                className={status === "loading" ? "animate-spin" : undefined}
              />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {status === "loading" ? (
            <span className="sr-only">Loading tickets</span>
          ) : null}
          <TicketsBody status={status} onRetry={refresh} />
        </CardContent>
      </Card>
    </div>
  );
}
