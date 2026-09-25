"use client";

import * as React from "react";
import { CalendarClock, Check, Minus } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/registry/base/ui/alert-dialog";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";

const losses = [
  "Unlimited projects drop to 3 active projects",
  "Version history shrinks from 90 days to 7",
  "Custom domains are unpublished",
];

const periodEnd = "October 24, 2026";

export default function AlertDialog08() {
  const [cancelled, setCancelled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  return (
    <section
      aria-labelledby="alert-dialog-08-plan"
      className="w-full max-w-sm rounded-xl border bg-card p-5 text-card-foreground"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Current plan</p>
          <h3 id="alert-dialog-08-plan" className="text-lg font-semibold">
            Studio
          </h3>
        </div>
        {cancelled ? (
          <Badge variant="outline">Cancels {periodEnd}</Badge>
        ) : (
          <Badge variant="secondary">Active</Badge>
        )}
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums">
        $24
        <span className="text-sm font-normal text-muted-foreground">
          {" "}
          / month
        </span>
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
        <CalendarClock aria-hidden="true" className="size-4" />
        {cancelled
          ? `Access continues until ${periodEnd}`
          : `Renews on ${periodEnd}`}
      </p>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        {cancelled ? (
          <Button className="w-full" onClick={() => setCancelled(false)}>
            Resume subscription
          </Button>
        ) : (
          <>
            <Button variant="outline" className="w-full sm:w-auto sm:flex-1">
              Change plan
            </Button>
            <Button
              variant="ghost"
              className="w-full sm:w-auto sm:flex-1"
              onClick={() => setOpen(true)}
            >
              Cancel subscription
            </Button>
          </>
        )}
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel your Studio plan?</AlertDialogTitle>
            <AlertDialogDescription>
              You keep every Studio feature until {periodEnd}. After that, your
              workspace moves to the Free plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ul
            aria-label="What changes on the Free plan"
            className="flex flex-col gap-2 rounded-lg bg-muted/60 p-3 text-sm"
          >
            {losses.map((loss) => (
              <li key={loss} className="flex items-start gap-2">
                <Minus
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
                {loss}
              </li>
            ))}
            <li className="flex items-start gap-2 text-muted-foreground">
              <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              Your files and projects stay put
            </li>
          </ul>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Studio</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => setCancelled(true)}
            >
              Cancel at period end
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
