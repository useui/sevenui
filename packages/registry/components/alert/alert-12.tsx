"use client";

import * as React from "react";
import { CircleDotIcon } from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/registry/base/ui/alert";
import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

const saved = {
  name: "Daniel Okafor",
  email: "daniel@lumen.studio",
  title: "Product designer",
};

type Profile = typeof saved;

export default function Alert12() {
  const [committed, setCommitted] = React.useState<Profile>(saved);
  const [draft, setDraft] = React.useState<Profile>({
    ...saved,
    title: "Senior product designer",
  });

  const changed = (Object.keys(draft) as (keyof Profile)[]).filter(
    (key) => draft[key] !== committed[key],
  );

  const update =
    (key: keyof Profile) => (event: React.ChangeEvent<HTMLInputElement>) =>
      setDraft((current) => ({ ...current, [key]: event.target.value }));

  return (
    <form
      className="grid w-full max-w-md gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setCommitted(draft);
      }}
    >
      <div className="grid gap-1">
        <h3 className="font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          How teammates see you across the workspace.
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="alert-12-name">Full name</Label>
        <Input id="alert-12-name" value={draft.name} onChange={update("name")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="alert-12-email">Email</Label>
        <Input
          id="alert-12-email"
          type="email"
          value={draft.email}
          onChange={update("email")}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="alert-12-title">Job title</Label>
        <Input
          id="alert-12-title"
          value={draft.title}
          onChange={update("title")}
        />
      </div>
      <div aria-live="polite">
        {changed.length > 0 ? (
          <Alert className="bg-muted/60 has-data-[slot=alert-action]:pr-2.5 sm:has-data-[slot=alert-action]:pr-52">
            <CircleDotIcon aria-hidden="true" className="text-primary!" />
            <AlertTitle>
              {changed.length} unsaved {changed.length === 1 ? "change" : "changes"}
            </AlertTitle>
            <AlertDescription>
              Edited: {changed.join(", ")}.
            </AlertDescription>
            <AlertAction className="static col-start-2 mt-2 flex gap-2 sm:absolute sm:top-1/2 sm:mt-0 sm:-translate-y-1/2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setDraft(committed)}
              >
                Discard
              </Button>
              <Button type="submit" size="sm">
                Save changes
              </Button>
            </AlertAction>
          </Alert>
        ) : (
          <p className="text-sm text-muted-foreground">All changes saved.</p>
        )}
      </div>
    </form>
  );
}
