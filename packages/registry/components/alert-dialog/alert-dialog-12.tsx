"use client";

import * as React from "react";
import { CalendarX2, Clock, MapPin } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/registry/base/ui/alert-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";
import { Textarea } from "@/registry/base/ui/textarea";

const attendees = [
  { initials: "JK", name: "Jonas Keller" },
  { initials: "AM", name: "Aiko Mori" },
  { initials: "SB", name: "Sofia Barros" },
  { initials: "TW", name: "Theo Walsh" },
  { initials: "RN", name: "Ruth Ndlovu" },
];

export default function AlertDialog12() {
  const [notify, setNotify] = React.useState(true);
  const [message, setMessage] = React.useState("");
  const [status, setStatus] = React.useState<"scheduled" | "cancelled">(
    "scheduled",
  );
  const [notified, setNotified] = React.useState(0);

  const cancelled = status === "cancelled";

  return (
    <article
      aria-labelledby="alert-dialog-12-title"
      className="w-full max-w-sm rounded-xl border bg-card p-4 text-card-foreground"
    >
      <div className="flex items-start gap-3">
        <div
          aria-hidden="true"
          className="flex w-12 shrink-0 flex-col items-center rounded-lg border py-1.5"
        >
          <span className="text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
            Thu
          </span>
          <span className="text-lg leading-tight font-semibold tabular-nums">
            26
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3
              id="alert-dialog-12-title"
              className="truncate font-medium data-[cancelled=true]:text-muted-foreground data-[cancelled=true]:line-through"
              data-cancelled={cancelled}
            >
              Checkout redesign review
            </h3>
            {cancelled ? <Badge variant="destructive">Cancelled</Badge> : null}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock aria-hidden="true" className="size-3.5" />
            14:00 – 14:45
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin aria-hidden="true" className="size-3.5" />
            Room Atlas · 3rd floor
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <AvatarGroup
          aria-label={`${attendees.length} attendees`}
          className="-space-x-1"
        >
          {attendees.slice(0, 3).map((person) => (
            <Avatar key={person.initials}>
              <AvatarFallback title={person.name}>
                {person.initials}
              </AvatarFallback>
            </Avatar>
          ))}
          <AvatarGroupCount>+{attendees.length - 3}</AvatarGroupCount>
        </AvatarGroup>

        <AlertDialog>
          {cancelled ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatus("scheduled")}
            >
              Restore event
            </Button>
          ) : (
            <AlertDialogTrigger
              render={
                <Button variant="outline" size="sm">
                  <CalendarX2 aria-hidden="true" />
                  Cancel event
                </Button>
              }
            />
          )}
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Cancel Checkout redesign review?
              </AlertDialogTitle>
              <AlertDialogDescription>
                The event is removed from {attendees.length} calendars and Room
                Atlas is released for Thursday 14:00.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="alert-dialog-12-notify" className="font-normal">
                  Email attendees about the cancellation
                </Label>
                <Switch
                  id="alert-dialog-12-notify"
                  checked={notify}
                  onCheckedChange={setNotify}
                />
              </div>
              {notify ? (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="alert-dialog-12-message" className="sr-only">
                    Note to attendees
                  </Label>
                  <Textarea
                    id="alert-dialog-12-message"
                    placeholder="Add a note, e.g. moving this to next week's sync."
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    maxLength={280}
                  />
                </div>
              ) : null}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep event</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  setNotified(notify ? attendees.length : 0);
                  setStatus("cancelled");
                  setMessage("");
                }}
              >
                {notify ? "Cancel and notify" : "Cancel quietly"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <p
        aria-live="polite"
        className="mt-3 text-xs text-muted-foreground empty:hidden"
      >
        {cancelled
          ? notified > 0
            ? `${notified} attendees were emailed.`
            : "Attendees were not notified."
          : ""}
      </p>
    </article>
  );
}
