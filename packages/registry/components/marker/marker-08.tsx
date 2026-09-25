"use client";

import * as React from "react";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  CloudUploadIcon,
} from "lucide-react";

import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@/registry/base/ui/marker";
import { Textarea } from "@/registry/base/ui/textarea";

type SaveState = "saved" | "saving" | "invalid";

const statusCopy: Record<SaveState, string> = {
  saved: "All changes saved",
  saving: "Saving changes…",
  invalid: "Not saved — workspace name is required",
};

export default function Marker08() {
  const [name, setName] = React.useState("Acme Logistics");
  const [about, setAbout] = React.useState(
    "Freight routing and warehouse tooling for mid-size carriers.",
  );
  const [state, setState] = React.useState<SaveState>("saved");
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function queueSave(nextName: string) {
    if (timer.current) clearTimeout(timer.current);
    if (nextName.trim() === "") {
      setState("invalid");
      return;
    }
    setState("saving");
    // Simulate a debounced autosave round-trip.
    timer.current = setTimeout(() => setState("saved"), 900);
  }

  const Icon =
    state === "saved"
      ? CircleCheckIcon
      : state === "saving"
        ? CloudUploadIcon
        : CircleAlertIcon;

  return (
    <form
      aria-labelledby="marker-08-title"
      onSubmit={(event) => event.preventDefault()}
      className="flex w-full max-w-md flex-col gap-5 rounded-xl border border-border bg-card p-5 text-card-foreground"
    >
      <div className="flex flex-col gap-1">
        <h3 id="marker-08-title" className="text-sm font-medium">
          Workspace profile
        </h3>
        <p className="text-sm text-muted-foreground">
          Changes save automatically as you type.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="marker-08-name">Workspace name</Label>
        <Input
          id="marker-08-name"
          value={name}
          aria-invalid={state === "invalid" || undefined}
          aria-describedby="marker-08-status"
          onChange={(event) => {
            setName(event.target.value);
            queueSave(event.target.value);
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="marker-08-about">Description</Label>
        <Textarea
          id="marker-08-about"
          rows={3}
          value={about}
          onChange={(event) => {
            setAbout(event.target.value);
            queueSave(name);
          }}
        />
      </div>

      <Marker
        id="marker-08-status"
        role="status"
        data-state={state}
        className="border-t border-border pt-4 text-xs data-[state=invalid]:text-destructive data-[state=saving]:text-foreground"
      >
        <MarkerIcon
          className={state === "saving" ? "motion-safe:animate-pulse" : undefined}
        >
          <Icon />
        </MarkerIcon>
        <MarkerContent>{statusCopy[state]}</MarkerContent>
      </Marker>
    </form>
  );
}
