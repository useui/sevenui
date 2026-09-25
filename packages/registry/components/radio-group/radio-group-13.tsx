"use client";

import * as React from "react";
import { BadgePercent } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";
import { Textarea } from "@/registry/base/ui/textarea";

const reasons = [
  { value: "price", label: "It's too expensive" },
  { value: "features", label: "Missing a feature I need" },
  { value: "switching", label: "Switching to another tool" },
  { value: "usage", label: "I don't use it enough" },
  { value: "other", label: "Something else" },
];

export default function RadioGroup13() {
  const [reason, setReason] = React.useState<string | null>(null);
  const [details, setDetails] = React.useState("");
  const [status, setStatus] = React.useState<
    "survey" | "kept" | "stayed" | "canceled"
  >("survey");

  if (status !== "survey") {
    return (
      <div
        role="status"
        className="flex w-full max-w-md flex-col gap-3 rounded-xl border border-border bg-card p-5 text-card-foreground"
      >
        <h3 className="text-sm font-semibold">
          {status === "canceled"
            ? "Your plan has been canceled"
            : status === "kept"
              ? "Discount applied"
              : "You're still on Pro"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {status === "canceled"
            ? "Pro features stay active until Oct 31. You can resubscribe anytime from Billing."
            : status === "kept"
              ? "You'll pay $6/month for the next 3 months. Thanks for staying with us."
              : "Nothing changed. Your next invoice is $12 on Oct 31."}
        </p>
        <Button
          variant="outline"
          className="self-start"
          onClick={() => {
            setStatus("survey");
            setReason(null);
            setDetails("");
          }}
        >
          Back to billing
        </Button>
      </div>
    );
  }

  const needsDetails = reason === "other" || reason === "features";
  const canSubmit = reason !== null && (!needsDetails || details.trim().length > 0);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) setStatus("canceled");
      }}
      className="flex w-full max-w-md flex-col gap-5 rounded-xl border border-border bg-card p-5 text-card-foreground"
    >
      <div className="flex flex-col gap-1">
        <h3 id="radio-group-13-title" className="text-base font-semibold">
          Before you cancel Pro
        </h3>
        <p className="text-sm text-muted-foreground">
          What's the main reason you're leaving? Your answer goes straight to our product team.
        </p>
      </div>
      <RadioGroup
        aria-labelledby="radio-group-13-title"
        aria-required="true"
        value={reason}
        onValueChange={(value) => setReason(value as string)}
        className="gap-3.5"
      >
        {reasons.map((item) => (
          <Label key={item.value} className="cursor-pointer font-normal">
            <RadioGroupItem value={item.value} />
            {item.label}
          </Label>
        ))}
      </RadioGroup>
      {reason === "price" && (
        <div className="flex gap-3 rounded-lg border border-border bg-muted/50 p-3">
          <BadgePercent aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
          <div className="flex flex-col gap-2">
            <p className="text-sm">
              <span className="font-medium">Stay for 50% off.</span>{" "}
              <span className="text-muted-foreground">
                Keep Pro for $6/month for the next 3 months.
              </span>
            </p>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="self-start"
              onClick={() => setStatus("kept")}
            >
              Apply discount
            </Button>
          </div>
        </div>
      )}
      {needsDetails && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="radio-group-13-details">
            {reason === "features" ? "Which feature were you missing?" : "Tell us more"}
          </Label>
          <Textarea
            id="radio-group-13-details"
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder={
              reason === "features"
                ? "For example: recurring tasks, Gantt view, SSO"
                : "What could we have done better?"
            }
            className="min-h-20"
          />
        </div>
      )}
      <div className="flex flex-col-reverse gap-2 min-[400px]:flex-row min-[400px]:justify-end">
        <Button type="button" variant="ghost" onClick={() => setStatus("stayed")}>
          Keep my plan
        </Button>
        <Button type="submit" variant="destructive" disabled={!canSubmit}>
          Cancel subscription
        </Button>
      </div>
    </form>
  );
}
