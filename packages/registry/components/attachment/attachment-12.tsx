"use client";

import * as React from "react";
import { CameraIcon, CheckIcon, XIcon } from "lucide-react";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/registry/base/ui/attachment";
import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

const reasons = [
  { value: "damaged", label: "Arrived damaged" },
  { value: "wrong-size", label: "Wrong size" },
  { value: "not-as-described", label: "Not as described" },
];

const samplePhotos = [
  { id: "box", name: "outer-box.jpg", size: "1.8 MB" },
  { id: "crack", name: "cracked-lid.jpg", size: "2.1 MB" },
  { id: "label", name: "shipping-label.jpg", size: "940 KB" },
];

const MAX_PHOTOS = 3;

export default function Attachment12() {
  const [reason, setReason] = React.useState("damaged");
  const [photos, setPhotos] = React.useState(samplePhotos.slice(0, 2));
  const [submitted, setSubmitted] = React.useState(false);
  const needsPhotos = reason === "damaged";
  const canSubmit = !needsPhotos || photos.length > 0;

  function addPhoto() {
    const next = samplePhotos.find(
      (photo) => !photos.some((current) => current.id === photo.id),
    );
    if (next) setPhotos((current) => [...current, next]);
    setSubmitted(false);
  }

  return (
    <form
      className="w-full max-w-sm rounded-2xl border bg-card text-card-foreground"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) setSubmitted(true);
      }}
    >
      <div className="flex items-center gap-3 border-b p-4">
        <img
          src="/placeholder.svg"
          alt=""
          className="size-12 shrink-0 rounded-lg bg-muted object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">Stoneware Pour-Over Set</p>
          <p className="text-xs text-muted-foreground">
            Order #SV-20931 · Delivered Sep 22
          </p>
        </div>
        <span className="text-sm tabular-nums">$68.00</span>
      </div>
      <div className="flex flex-col gap-5 p-4">
        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-2.5 text-sm font-medium">Why are you returning it?</legend>
          <RadioGroup
            value={reason}
            onValueChange={(value) => {
              setReason(String(value));
              setSubmitted(false);
            }}
          >
            {reasons.map((item) => (
              <Label key={item.value} className="font-normal">
                <RadioGroupItem value={item.value} />
                {item.label}
              </Label>
            ))}
          </RadioGroup>
        </fieldset>
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-2">
            <p id="attachment-12-photos" className="text-sm font-medium">
              Photos
            </p>
            <span className="text-xs text-muted-foreground tabular-nums">
              {needsPhotos ? "Required" : "Optional"} ·{" "}
              {`${photos.length}/${MAX_PHOTOS}`}
            </span>
          </div>
          <AttachmentGroup aria-labelledby="attachment-12-photos" role="list">
            {photos.map((photo) => (
              <Attachment
                key={photo.id}
                orientation="vertical"
                size="sm"
                role="listitem"
                className="has-data-[slot=attachment-content]:w-26"
              >
                <AttachmentMedia variant="image">
                  <img src="/placeholder.svg" alt="" />
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle>{photo.name}</AttachmentTitle>
                  <AttachmentDescription>{photo.size}</AttachmentDescription>
                </AttachmentContent>
                <AttachmentActions className="top-2.5 right-2.5">
                  <AttachmentAction
                    variant="secondary"
                    aria-label={`Remove ${photo.name}`}
                    onClick={() => {
                      setSubmitted(false);
                      setPhotos((current) =>
                        current.filter((item) => item.id !== photo.id),
                      );
                    }}
                  >
                    <XIcon aria-hidden="true" />
                  </AttachmentAction>
                </AttachmentActions>
              </Attachment>
            ))}
            {photos.length < MAX_PHOTOS ? (
              <Attachment
                state="idle"
                orientation="vertical"
                size="sm"
                role="listitem"
                className="has-data-[slot=attachment-content]:w-26"
              >
                <AttachmentMedia className="bg-transparent text-muted-foreground">
                  <CameraIcon aria-hidden="true" />
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle>Add photo</AttachmentTitle>
                  <AttachmentDescription>JPG or PNG</AttachmentDescription>
                </AttachmentContent>
                <AttachmentTrigger
                  aria-label="Add a photo of the item"
                  className="rounded-2xl focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={addPhoto}
                />
              </Attachment>
            ) : null}
          </AttachmentGroup>
          {needsPhotos && photos.length === 0 ? (
            <p role="alert" className="text-xs text-destructive">
              Add at least one photo of the damage so we can refund without a pickup.
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={!canSubmit || submitted}>
            {submitted ? (
              <>
                <CheckIcon aria-hidden="true" data-icon="inline-start" />
                Refund requested
              </>
            ) : (
              "Request refund"
            )}
          </Button>
          {submitted ? (
            <p role="status" className="text-center text-xs text-muted-foreground">
              We’ll email a decision within 2 business days.
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
