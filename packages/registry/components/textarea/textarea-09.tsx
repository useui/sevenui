"use client";

import { MapPinIcon, PlusIcon } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import { Textarea } from "@/registry/base/ui/textarea";

const MAX_LENGTH = 180;

const addresses = [
  { name: "Maya Chen", line: "1482 Alder Street, Apt 3B, Portland, OR 97205" },
  { name: "Maya Chen (work)", line: "700 SW Main Street, Floor 4, Portland, OR 97204" },
];

const suggestions = [
  "Leave at the front door",
  "Ring the bell twice",
  "Gate code 4471",
  "Hand to the concierge",
];

export default function Textarea09() {
  const id = useId();
  const [note, setNote] = useState("");
  const [addressIndex, setAddressIndex] = useState(0);
  const address = addresses[addressIndex];

  const remaining = MAX_LENGTH - note.length;

  const addSuggestion = (text: string) => {
    setNote((current) => {
      const trimmed = current.trimEnd();
      const next = trimmed ? `${trimmed.replace(/[.,]$/, "")}. ${text}.` : `${text}.`;
      return next.slice(0, MAX_LENGTH);
    });
  };

  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <MapPinIcon aria-hidden="true" className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 id={`${id}-heading`} className="text-sm font-medium">
            Shipping to {address.name}
          </h3>
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {address.line}
          </p>
        </div>
        <Button
          variant="link"
          size="sm"
          className="h-auto px-0"
          onClick={() => setAddressIndex((index) => (index + 1) % addresses.length)}
        >
          Change
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <Label htmlFor={`${id}-note`}>Delivery instructions</Label>
          <span className="text-xs text-muted-foreground">Optional</span>
        </div>
        <Textarea
          id={`${id}-note`}
          value={note}
          maxLength={MAX_LENGTH}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Anything the courier should know to get your parcel to you?"
          aria-describedby={`${id}-count`}
          className="min-h-20 resize-none"
        />
        <fieldset className="flex min-w-0 flex-wrap gap-1.5">
          <legend className="sr-only">Quick instructions</legend>
          {suggestions.map((suggestion) => {
            const used = note.includes(suggestion);
            return (
              <Button
                key={suggestion}
                type="button"
                variant="outline"
                size="xs"
                disabled={used || remaining < suggestion.length + 2}
                onClick={() => addSuggestion(suggestion)}
                className="rounded-full"
              >
                <PlusIcon aria-hidden="true" />
                {suggestion}
              </Button>
            );
          })}
        </fieldset>
        <p
          id={`${id}-count`}
          aria-live="polite"
          className="text-xs text-muted-foreground tabular-nums"
        >
          Shared with the courier only. {remaining} characters left.
        </p>
      </div>
    </section>
  );
}
