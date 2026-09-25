"use client";

import * as React from "react";
import { ArrowDown, Check, Clock } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import { Label } from "@/registry/base/ui/label";
import { ScrollArea } from "@/registry/base/ui/scroll-area";

const clauses = [
  {
    heading: "1. Your workspace",
    body: "You own the projects, files, and comments you create in Northwind. We store them only to provide the service and never sell or rent them to third parties.",
  },
  {
    heading: "2. Acceptable use",
    body: "Do not use the workspace to distribute malware, send unsolicited bulk email, or attempt to access another customer's data. We may suspend accounts that put other customers at risk.",
  },
  {
    heading: "3. Billing and renewals",
    body: "Paid plans renew automatically at the end of each billing period. You can cancel at any time from Settings → Billing, and your plan stays active until the period ends.",
  },
  {
    heading: "4. Data retention",
    body: "When you delete a project it moves to the trash for 30 days, after which it is permanently erased from our primary systems. Encrypted backups are purged within 90 days.",
  },
  {
    heading: "5. Service availability",
    body: "We target 99.9% monthly uptime for the web app and API. Scheduled maintenance is announced at least 72 hours in advance on our status page.",
  },
  {
    heading: "6. Changes to these terms",
    body: "If we make material changes, we will notify workspace owners by email 30 days before they take effect. Continuing to use Northwind after that date means you accept the updated terms.",
  },
];

export default function ScrollArea07() {
  const [reachedEnd, setReachedEnd] = React.useState(false);
  const [agreed, setAgreed] = React.useState(false);
  const [accepted, setAccepted] = React.useState(false);
  const [snoozed, setSnoozed] = React.useState(false);

  function handleScroll(event: React.UIEvent<HTMLDivElement>) {
    if (reachedEnd) return;
    const target = event.target as HTMLElement;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 8) {
      setReachedEnd(true);
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-4 rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex flex-col gap-1">
        <h3 id="scroll-area-07-title" className="font-semibold">
          Review the updated Terms of Service
        </h3>
        <p className="text-sm text-muted-foreground">
          Effective October 1, 2026. Read through to the end to continue.
        </p>
      </div>
      <ScrollArea
        role="region"
        aria-labelledby="scroll-area-07-title"
        onScrollCapture={handleScroll}
        className="h-56 rounded-lg border bg-background after:pointer-events-none after:absolute after:inset-x-0 after:right-2.5 after:bottom-0 after:h-12 after:rounded-bl-lg after:bg-linear-to-t after:from-background after:opacity-0 after:transition-opacity data-overflow-y-end:after:opacity-100"
      >
        <div className="flex flex-col gap-4 p-4 pr-5 text-sm leading-relaxed">
          {clauses.map((clause) => (
            <section key={clause.heading} className="flex flex-col gap-1">
              <h4 className="font-medium">{clause.heading}</h4>
              <p className="text-muted-foreground">{clause.body}</p>
            </section>
          ))}
        </div>
      </ScrollArea>
      <p
        aria-live="polite"
        className="flex items-center gap-1.5 text-xs text-muted-foreground"
      >
        {snoozed && !accepted ? (
          <>
            <Clock aria-hidden="true" className="size-3.5" />
            We'll remind you again tomorrow. You can still accept now.
          </>
        ) : reachedEnd ? (
          <>
            <Check aria-hidden="true" className="size-3.5 text-success" />
            You have reached the end of the document.
          </>
        ) : (
          <>
            <ArrowDown aria-hidden="true" className="size-3.5" />
            Scroll to the end to unlock the agreement.
          </>
        )}
      </p>
      <div className="flex items-start gap-2.5">
        <Checkbox
          id="scroll-area-07-agree"
          checked={agreed}
          disabled={!reachedEnd || accepted}
          onCheckedChange={(checked) => setAgreed(checked)}
          className="mt-0.5"
        />
        <Label
          htmlFor="scroll-area-07-agree"
          className="text-sm leading-snug font-normal"
        >
          I have read and agree to the Terms of Service on behalf of my
          workspace.
        </Label>
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          disabled={accepted || snoozed}
          onClick={() => setSnoozed(true)}
        >
          {snoozed ? "Reminder set" : "Remind me later"}
        </Button>
        <Button
          disabled={!agreed || accepted}
          onClick={() => setAccepted(true)}
        >
          {accepted ? (
            <>
              <Check aria-hidden="true" />
              Accepted
            </>
          ) : (
            "Accept and continue"
          )}
        </Button>
      </div>
    </div>
  );
}
