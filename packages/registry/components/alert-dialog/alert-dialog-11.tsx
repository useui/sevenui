"use client";

import * as React from "react";
import { LockIcon, TimerIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/registry/base/ui/alert-dialog";
import { Button } from "@/registry/base/ui/button";
import { Progress } from "@/registry/base/ui/progress";

const WARNING_SECONDS = 60;

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function AlertDialog11() {
  const [open, setOpen] = React.useState(false);
  const [remaining, setRemaining] = React.useState(WARNING_SECONDS);
  const [signedOut, setSignedOut] = React.useState(false);

  // Counts down only while the warning is showing; the interval is cleared on close.
  React.useEffect(() => {
    if (!open) return;
    const id = setInterval(() => {
      setRemaining((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [open]);

  React.useEffect(() => {
    if (open && remaining === 0) {
      setOpen(false);
      setSignedOut(true);
    }
  }, [open, remaining]);

  const warn = () => {
    setRemaining(WARNING_SECONDS);
    setOpen(true);
  };

  return (
    <section
      aria-labelledby="alert-dialog-11-heading"
      className="w-full max-w-sm rounded-xl border bg-card p-4 text-card-foreground"
    >
      {signedOut ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted">
            <LockIcon aria-hidden="true" className="size-5" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 id="alert-dialog-11-heading" className="font-medium">
              You were signed out
            </h3>
            <p className="text-sm text-balance text-muted-foreground">
              We ended your session after 15 minutes without activity.
            </p>
          </div>
          <Button size="sm" onClick={() => setSignedOut(false)}>
            Sign in again
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h3 id="alert-dialog-11-heading" className="font-medium">
              Payroll run · October
            </h3>
            <p className="text-sm text-muted-foreground">
              42 employees, $186,420.00 total. Draft saved at 09:14.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="self-start"
            onClick={warn}
          >
            <TimerIcon aria-hidden="true" data-icon="inline-start" />
            Simulate 14 minutes idle
          </Button>
        </div>
      )}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <TimerIcon aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>Are you still there?</AlertDialogTitle>
            <AlertDialogDescription>
              For your security, you will be signed out soon. Your payroll draft
              is saved either way.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col items-center gap-2">
            <p
              role="timer"
              aria-label={`${remaining} seconds until sign out`}
              className="text-3xl font-semibold tabular-nums"
            >
              {formatTime(remaining)}
            </p>
            <Progress
              aria-label="Time left before sign out"
              value={(remaining / WARNING_SECONDS) * 100}
              className="w-full [&_[data-slot=progress-indicator]]:transition-[width] [&_[data-slot=progress-indicator]]:duration-1000 [&_[data-slot=progress-indicator]]:ease-linear"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSignedOut(true)}>
              Sign out
            </AlertDialogCancel>
            <AlertDialogAction>Stay signed in</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
