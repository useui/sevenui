"use client";

import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/registry/base/ui/dialog";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import { Spinner } from "@/registry/base/ui/spinner";

// Slugs another workspace already owns, to demonstrate the error state.
const takenNames = ["acme", "acme-labs", "northwind"];

export default function Dialog06() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("acme-design");
  const [savedName, setSavedName] = React.useState("acme-design");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleOpenChange = (next: boolean) => {
    // Keep the dialog open while the request is in flight.
    if (pending) return;
    setOpen(next);
    if (next) {
      setName(savedName);
      setError(null);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const slug = name.trim().toLowerCase();
    if (slug.length < 3) {
      setError("Use at least 3 characters.");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError("Use only lowercase letters, numbers, and dashes.");
      return;
    }
    if (takenNames.includes(slug)) {
      setError(`"${slug}" is already taken. Try another name.`);
      return;
    }
    setError(null);
    setPending(true);
    timer.current = setTimeout(() => {
      setPending(false);
      setSavedName(slug);
      setOpen(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Button variant="outline" onClick={() => handleOpenChange(true)}>
        Rename workspace
      </Button>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Current URL:{" "}
        <span className="font-medium text-foreground">
          app.acme.co/{savedName}
        </span>
      </p>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent showCloseButton={!pending} className="sm:max-w-md">
          <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
            <DialogHeader>
              <DialogTitle>Rename workspace</DialogTitle>
              <DialogDescription>
                Changing the name also changes the workspace URL. Old links
                redirect for 30 days.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="dialog-06-name">Workspace name</Label>
              <div className="flex min-w-0 items-center overflow-hidden rounded-lg border border-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-destructive/20">
                <span className="shrink-0 border-r border-input bg-muted px-2.5 py-1.5 text-sm text-muted-foreground">
                  app.acme.co/
                </span>
                <Input
                  id="dialog-06-name"
                  value={name}
                  disabled={pending}
                  onChange={(event) => {
                    setName(event.target.value);
                    if (error) setError(null);
                  }}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={
                    error ? "dialog-06-error" : "dialog-06-hint"
                  }
                  autoComplete="off"
                  spellCheck={false}
                  className="min-w-0 rounded-none border-0 shadow-none focus-visible:ring-0 aria-invalid:ring-0"
                />
              </div>
              {error ? (
                <p
                  id="dialog-06-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {error}
                </p>
              ) : (
                <p id="dialog-06-hint" className="text-sm text-muted-foreground">
                  Lowercase letters, numbers, and dashes.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? (
                  <>
                    <Spinner aria-hidden="true" role="presentation" />
                    Saving…
                  </>
                ) : (
                  "Save name"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
