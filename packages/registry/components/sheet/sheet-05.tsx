"use client";

import * as React from "react";
import {
  CircleAlertIcon,
  GitCommitHorizontalIcon,
  GitPullRequestIcon,
  InboxIcon,
  RotateCwIcon,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/registry/base/ui/alert";
import { Button } from "@/registry/base/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/base/ui/sheet";
import { Skeleton } from "@/registry/base/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Outcome = "success" | "empty" | "error";
type Status = "loading" | Outcome;

const outcomes: { value: Outcome; label: string }[] = [
  { value: "success", label: "Loaded" },
  { value: "empty", label: "Empty" },
  { value: "error", label: "Error" },
];

const activity = [
  {
    icon: GitPullRequestIcon,
    title: "Opened PR 482: Add usage-based billing",
    meta: "Dana Ortiz, 12 min ago",
  },
  {
    icon: GitCommitHorizontalIcon,
    title: "Pushed 3 commits to main",
    meta: "Leo Martins, 40 min ago",
  },
  {
    icon: GitPullRequestIcon,
    title: "Merged PR 479: Fix invoice rounding",
    meta: "Dana Ortiz, 2 hours ago",
  },
];

export default function Sheet05() {
  const [outcome, setOutcome] = React.useState<Outcome>("success");
  const [status, setStatus] = React.useState<Status>("loading");
  const [open, setOpen] = React.useState(false);
  const timer = React.useRef<number | undefined>(undefined);

  // Simulate a request each time the sheet opens or the user retries.
  function load() {
    window.clearTimeout(timer.current);
    setStatus("loading");
    timer.current = window.setTimeout(() => setStatus(outcome), 1200);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) load();
    else window.clearTimeout(timer.current);
  }

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <span id="sheet-05-outcome" className="text-sm text-muted-foreground">
          Simulated response
        </span>
        <ToggleGroup
          aria-labelledby="sheet-05-outcome"
          variant="outline"
          size="sm"
          spacing={0}
          value={[outcome]}
          onValueChange={(value) => {
            const next = value[0] as Outcome | undefined;
            if (next) setOutcome(next);
          }}
        >
          {outcomes.map((item) => (
            <ToggleGroupItem key={item.value} value={item.value}>
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetTrigger
          render={<Button className="w-full">Repository activity</Button>}
        />
        <SheetContent className="gap-0">
          <SheetHeader className="pr-12">
            <SheetTitle>Recent activity</SheetTitle>
            <SheetDescription>acme/billing-service</SheetDescription>
          </SheetHeader>
          <div
            aria-busy={status === "loading"}
            aria-live="polite"
            className="flex flex-1 flex-col px-4 pb-4"
          >
            {status === "loading" && (
              <ul className="grid gap-4" aria-label="Loading activity">
                {[0, 1, 2].map((row) => (
                  <li key={row} className="flex items-start gap-3">
                    <Skeleton className="size-8 rounded-lg" />
                    <div className="grid flex-1 gap-2 pt-0.5">
                      <Skeleton className="h-3.5 w-4/5" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {status === "success" && (
              <ul className="grid gap-4">
                {activity.map(({ icon: Icon, title, meta }) => (
                  <li key={title} className="flex items-start gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <div className="grid gap-0.5">
                      <span>{title}</span>
                      <span className="text-muted-foreground text-xs">
                        {meta}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {status === "empty" && (
              <Empty className="flex-1">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <InboxIcon aria-hidden="true" />
                  </EmptyMedia>
                  <EmptyTitle>No activity this week</EmptyTitle>
                  <EmptyDescription>
                    Pull requests, commits and reviews will show up here as
                    soon as someone pushes.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
            {status === "error" && (
              <Alert variant="destructive">
                <CircleAlertIcon aria-hidden="true" />
                <AlertTitle>Couldn&apos;t load activity</AlertTitle>
                <AlertDescription>
                  <p>The repository service timed out after 10 seconds.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 gap-1.5"
                    onClick={load}
                  >
                    <RotateCwIcon aria-hidden="true" />
                    Try again
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
