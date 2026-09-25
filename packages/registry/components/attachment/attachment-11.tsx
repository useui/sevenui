"use client";

import * as React from "react";
import {
  CheckIcon,
  IdCardIcon,
  ShieldCheckIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/registry/base/ui/attachment";
import { Button } from "@/registry/base/ui/button";

const slots = [
  {
    id: "front",
    label: "Front of ID",
    hint: "All four corners visible",
    file: "license-front.jpg",
  },
  {
    id: "back",
    label: "Back of ID",
    hint: "Barcode must be readable",
    file: "license-back.jpg",
  },
] as const;

type SlotId = (typeof slots)[number]["id"];

export default function Attachment11() {
  const [uploaded, setUploaded] = React.useState<Record<SlotId, boolean>>({
    front: true,
    back: false,
  });
  const [submitted, setSubmitted] = React.useState(false);
  const complete = slots.every((slot) => uploaded[slot.id]);

  function setSlot(id: SlotId, value: boolean) {
    setSubmitted(false);
    setUploaded((current) => ({ ...current, [id]: value }));
  }

  return (
    <section
      aria-labelledby="attachment-11-title"
      className="w-full max-w-sm rounded-2xl border bg-card p-5 text-card-foreground"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 id="attachment-11-title" className="text-base font-medium">
          Verify your identity
        </h3>
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          Step {submitted ? 3 : 2} of 3
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Add a photo of both sides of a driver’s license or national ID card. We
        only use it to confirm payouts go to you.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {slots.map((slot) =>
          uploaded[slot.id] ? (
            <Attachment
              key={slot.id}
              orientation="vertical"
              className="w-full has-data-[slot=attachment-content]:w-full"
            >
              <AttachmentMedia variant="image">
                <img src="/placeholder.svg" alt={`${slot.label} preview`} />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{slot.file}</AttachmentTitle>
                <AttachmentDescription className="flex items-center gap-1">
                  <CheckIcon aria-hidden="true" className="size-3 shrink-0" />
                  <span className="min-w-0 truncate">{slot.label} added</span>
                </AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction
                  variant="secondary"
                  aria-label={`Remove ${slot.label.toLowerCase()}`}
                  onClick={() => setSlot(slot.id, false)}
                >
                  <XIcon aria-hidden="true" />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          ) : (
            <Attachment
              key={slot.id}
              state="idle"
              orientation="vertical"
              className="w-full hover:bg-muted/50 has-data-[slot=attachment-content]:w-full"
            >
              <AttachmentMedia className="bg-transparent text-muted-foreground">
                <IdCardIcon aria-hidden="true" />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle className="flex items-center gap-1">
                  <UploadIcon aria-hidden="true" className="size-3 shrink-0" />
                  {slot.label}
                </AttachmentTitle>
                <AttachmentDescription className="whitespace-normal">
                  {slot.hint}
                </AttachmentDescription>
              </AttachmentContent>
              <AttachmentTrigger
                aria-label={`Upload ${slot.label.toLowerCase()}`}
                className="rounded-2xl focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setSlot(slot.id, true)}
              />
            </Attachment>
          ),
        )}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <p
          aria-live="polite"
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <ShieldCheckIcon aria-hidden="true" className="size-3.5 shrink-0" />
          {submitted
            ? "Sent for review"
            : "Encrypted, deleted after 30 days"}
        </p>
        <Button
          size="sm"
          disabled={!complete || submitted}
          onClick={() => setSubmitted(true)}
        >
          {submitted ? (
            <>
              <CheckIcon aria-hidden="true" data-icon="inline-start" />
              Submitted
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </section>
  );
}
