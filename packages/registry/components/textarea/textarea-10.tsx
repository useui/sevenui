"use client";

import { useId, useState } from "react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import { Textarea } from "@/registry/base/ui/textarea";

const MAX_LENGTH = 160;
const SAVED_BIO =
  "Product designer at Northwind. Building calm tools for busy support teams. Based in Lisbon.";

export default function Textarea10() {
  const id = useId();
  const [savedBio, setSavedBio] = useState(SAVED_BIO);
  const [bio, setBio] = useState(SAVED_BIO);

  const isDirty = bio.trim() !== savedBio.trim();
  const remaining = MAX_LENGTH - bio.length;

  return (
    <form
      aria-labelledby={`${id}-heading`}
      className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card text-card-foreground"
      onSubmit={(event) => {
        event.preventDefault();
        setSavedBio(bio.trim());
        setBio(bio.trim());
      }}
    >
      <div className="grid gap-4 p-4 sm:grid-cols-[10rem_1fr] sm:gap-6 sm:p-6">
        <div className="flex flex-col gap-1">
          <h3 id={`${id}-heading`} className="text-sm font-medium">
            Public bio
          </h3>
          <p className="text-sm text-muted-foreground">
            Shown on your profile and next to your comments.
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-bio`} className="sr-only">
              Bio
            </Label>
            <Textarea
              id={`${id}-bio`}
              value={bio}
              maxLength={MAX_LENGTH}
              onChange={(event) => setBio(event.target.value)}
              aria-describedby={`${id}-count`}
              className="min-h-24"
            />
            <p
              id={`${id}-count`}
              className="text-right text-xs text-muted-foreground tabular-nums"
            >
              {remaining} / {MAX_LENGTH}
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-muted/60 p-3">
            <Avatar size="sm">
              <AvatarFallback>IR</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Inês Rocha</p>
              <p className="text-sm break-words text-muted-foreground">
                {bio.trim() || "No bio yet."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/40 px-4 py-3 sm:px-6">
        <p aria-live="polite" className="text-xs text-muted-foreground">
          {isDirty ? "You have unsaved changes." : "All changes saved."}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!isDirty}
            onClick={() => setBio(savedBio)}
          >
            Discard
          </Button>
          <Button type="submit" size="sm" disabled={!isDirty}>
            Save
          </Button>
        </div>
      </div>
    </form>
  );
}
