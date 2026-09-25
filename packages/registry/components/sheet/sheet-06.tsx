"use client";

import * as React from "react";
import { TriangleAlertIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/base/ui/sheet";
import { Textarea } from "@/registry/base/ui/textarea";

type Project = { name: string; summary: string };

const initialProject: Project = {
  name: "Checkout redesign",
  summary:
    "Cut the checkout from four steps to two and add Apple Pay for returning customers.",
};

export default function Sheet06() {
  const [open, setOpen] = React.useState(false);
  const [saved, setSaved] = React.useState<Project>(initialProject);
  const [draft, setDraft] = React.useState<Project>(initialProject);
  const [confirming, setConfirming] = React.useState(false);

  const dirty = draft.name !== saved.name || draft.summary !== saved.summary;

  // Controlled open state: intercept every close request while there are
  // unsaved edits and ask for confirmation instead.
  function handleOpenChange(next: boolean) {
    if (next) {
      setDraft(saved);
      setConfirming(false);
      setOpen(true);
      return;
    }
    if (dirty) {
      setConfirming(true);
      return;
    }
    setOpen(false);
  }

  function discard() {
    setDraft(saved);
    setConfirming(false);
    setOpen(false);
  }

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(draft);
    setConfirming(false);
    setOpen(false);
  }

  return (
    <div className="flex w-full max-w-xs flex-col gap-3 rounded-xl border bg-card p-4">
      <div className="grid gap-1">
        <h3 className="font-medium">{saved.name}</h3>
        <p className="text-muted-foreground text-sm">{saved.summary}</p>
      </div>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetTrigger
          render={
            <Button variant="outline" size="sm" className="self-start">
              Edit project
            </Button>
          }
        />
        <SheetContent className="gap-0">
          <form onSubmit={save} className="flex flex-1 flex-col">
            <SheetHeader className="pr-12">
              <SheetTitle>Edit project</SheetTitle>
              <SheetDescription>
                {dirty ? "You have unsaved changes." : "No changes yet."}
              </SheetDescription>
            </SheetHeader>
            <div className="grid content-start gap-4 px-4">
              <div className="grid gap-2">
                <Label htmlFor="sheet-06-name">Project name</Label>
                <Input
                  id="sheet-06-name"
                  value={draft.name}
                  onChange={(event) =>
                    setDraft({ ...draft, name: event.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sheet-06-summary">Summary</Label>
                <Textarea
                  id="sheet-06-summary"
                  rows={4}
                  value={draft.summary}
                  onChange={(event) =>
                    setDraft({ ...draft, summary: event.target.value })
                  }
                />
              </div>
            </div>
            <SheetFooter>
              {confirming ? (
                <div
                  role="alert"
                  className="grid gap-3 rounded-lg border border-warning/40 bg-warning/10 p-3"
                >
                  <div className="flex gap-2">
                    <TriangleAlertIcon
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-warning"
                    />
                    <p>
                      Discard your edits to this project? This can&apos;t be
                      undone.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      autoFocus
                      onClick={() => setConfirming(false)}
                    >
                      Keep editing
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={discard}
                    >
                      Discard
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={!dirty}>
                    Save changes
                  </Button>
                </div>
              )}
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
