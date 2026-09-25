"use client";

import { CircleCheckIcon, GlobeIcon, RocketIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  AlertDialogTrigger,
} from "@/registry/base/ui/alert-dialog";
import { Button } from "@/registry/base/ui/button";

const domain = "fieldnotes.studio";

const changes = [
  { label: "Added", value: 3, sign: "+" },
  { label: "Edited", value: 9, sign: "~" },
  { label: "Removed", value: 2, sign: "−" },
];

export default function AlertDialog05() {
  const [step, setStep] = useState<"confirm" | "live">("confirm");
  const doneRef = useRef<HTMLButtonElement>(null);

  // The focused "Publish changes" button unmounts on the step swap, so hand
  // focus to the new primary action instead of letting it fall to <body>.
  useEffect(() => {
    if (step === "live") doneRef.current?.focus();
  }, [step]);

  return (
    <AlertDialog
      onOpenChangeComplete={(open) => {
        if (!open) setStep("confirm");
      }}
    >
      <AlertDialogTrigger
        render={
          <Button>
            <RocketIcon aria-hidden="true" data-icon="inline-start" />
            Publish
          </Button>
        }
      />
      <AlertDialogContent>
        {step === "confirm" ? (
          <>
            <AlertDialogHeader>
              <AlertDialogMedia>
                <RocketIcon aria-hidden="true" />
              </AlertDialogMedia>
              <AlertDialogTitle>Publish to {domain}?</AlertDialogTitle>
              <AlertDialogDescription>
                These changes replace the live site. Visitors see them within a
                minute, and you can roll back from History.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <dl className="grid grid-cols-3 gap-2">
              {changes.map((change) => (
                <div
                  key={change.label}
                  className="flex flex-col gap-0.5 rounded-lg border px-3 py-2"
                >
                  <dt className="text-xs text-muted-foreground">
                    {change.label}
                  </dt>
                  <dd className="text-sm font-medium tabular-nums">
                    <span aria-hidden="true" className="text-muted-foreground">
                      {change.sign}
                    </span>
                    {change.value} {change.value === 1 ? "page" : "pages"}
                  </dd>
                </div>
              ))}
            </dl>
            <AlertDialogFooter>
              <AlertDialogCancel>Not yet</AlertDialogCancel>
              <Button onClick={() => setStep("live")}>Publish changes</Button>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader className="animate-in duration-300 ease-out fade-in-0 slide-in-from-bottom-1">
              <AlertDialogMedia className="bg-success/10 text-success">
                <CircleCheckIcon aria-hidden="true" />
              </AlertDialogMedia>
              <AlertDialogTitle>Your site is live</AlertDialogTitle>
              <AlertDialogDescription>
                14 page changes were published just now.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <p className="flex min-w-0 items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm animate-in duration-300 ease-out fade-in-0">
              <GlobeIcon
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground"
              />
              <span className="truncate">https://{domain}</span>
            </p>
            <AlertDialogFooter>
              <AlertDialogAction ref={doneRef}>Done</AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
