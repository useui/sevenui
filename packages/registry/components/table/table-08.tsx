"use client";

import { CircleAlert, Inbox, RotateCw } from "lucide-react";
import * as React from "react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";
import { Skeleton } from "@/registry/base/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/base/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type ViewState = "ready" | "loading" | "empty" | "error";

const states: { value: ViewState; label: string }[] = [
  { value: "ready", label: "Ready" },
  { value: "loading", label: "Loading" },
  { value: "empty", label: "Empty" },
  { value: "error", label: "Error" },
];

const payouts = [
  {
    id: "po_8H2k",
    date: "Sep 23",
    account: "Checking ••4821",
    amount: "$12,480.00",
    status: "Paid",
  },
  {
    id: "po_7Qm1",
    date: "Sep 16",
    account: "Checking ••4821",
    amount: "$9,215.40",
    status: "Paid",
  },
  {
    id: "po_6Zt9",
    date: "Sep 09",
    account: "Checking ••4821",
    amount: "$10,902.15",
    status: "Paid",
  },
];

const COLUMN_COUNT = 4;

export default function Table08() {
  const [view, setView] = React.useState<ViewState>("ready");
  const retryTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  React.useEffect(() => () => clearTimeout(retryTimer.current), []);

  function retry() {
    setView("loading");
    clearTimeout(retryTimer.current);
    retryTimer.current = setTimeout(() => setView("ready"), 1200);
  }

  return (
    <div className="w-full max-w-xl space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p id="table-08-state" className="text-sm font-medium">
          Preview state
        </p>
        <ToggleGroup
          aria-labelledby="table-08-state"
          variant="outline"
          size="sm"
          spacing={0}
          value={[view]}
          onValueChange={(value) => {
            if (value[0]) {
              clearTimeout(retryTimer.current);
              setView(value[0] as ViewState);
            }
          }}
        >
          {states.map((state) => (
            <ToggleGroupItem key={state.value} value={state.value}>
              {state.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="rounded-lg border">
        <Table aria-busy={view === "loading"}>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-3">Date</TableHead>
              <TableHead className="hidden sm:table-cell">
                Destination
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-3 text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {view === "ready" &&
              payouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell className="pl-3 font-medium">
                    {payout.date}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {payout.account}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{payout.status}</Badge>
                  </TableCell>
                  <TableCell className="pr-3 text-right tabular-nums">
                    {payout.amount}
                  </TableCell>
                </TableRow>
              ))}

            {view === "loading" &&
              payouts.map((payout) => (
                <TableRow key={payout.id} className="hover:bg-transparent">
                  <TableCell className="pl-3">
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-11 rounded-full" />
                  </TableCell>
                  <TableCell className="pr-3">
                    <Skeleton className="ml-auto h-4 w-20" />
                  </TableCell>
                </TableRow>
              ))}

            {view === "empty" && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={COLUMN_COUNT} className="whitespace-normal">
                  <Empty className="py-8">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Inbox aria-hidden="true" />
                      </EmptyMedia>
                      <EmptyTitle>No payouts yet</EmptyTitle>
                      <EmptyDescription>
                        Your first payout is sent 2 business days after your
                        first successful charge.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )}

            {view === "error" && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={COLUMN_COUNT} className="whitespace-normal">
                  <div
                    role="alert"
                    className="mx-auto flex max-w-sm flex-col items-center gap-3 py-8 text-center"
                  >
                    <div className="flex size-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                      <CircleAlert aria-hidden="true" className="size-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">Couldn't load payouts</p>
                      <p className="text-muted-foreground">
                        The payments service timed out. Your balance is not
                        affected.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={retry}>
                      <RotateCw aria-hidden="true" />
                      Try again
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
