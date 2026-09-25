"use client";

import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";
import { useEffect, useState } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/registry/base/ui/input-group";
import { Label } from "@/registry/base/ui/label";
import { Spinner } from "@/registry/base/ui/spinner";

const takenHandles = ["admin", "sevenui", "support", "design"];

type Status = "idle" | "checking" | "available" | "taken";

export default function Spinner06() {
  const [value, setValue] = useState("maya-lin");
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    const handle = value.trim().toLowerCase();
    if (handle.length < 3) {
      setStatus("idle");
      return;
    }
    setStatus("checking");
    const timer = window.setTimeout(() => {
      setStatus(takenHandles.includes(handle) ? "taken" : "available");
    }, 900);
    return () => window.clearTimeout(timer);
  }, [value]);

  const message = {
    idle: "Use at least 3 characters.",
    checking: "Checking availability…",
    available: `sevenui.dev/@${value.trim()} is available.`,
    taken: "That handle is taken. Try adding your team name.",
  }[status];

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Label htmlFor="spinner-06-handle">Profile handle</Label>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>@</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          id="spinner-06-handle"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-invalid={status === "taken" || undefined}
          aria-describedby="spinner-06-status"
          autoComplete="off"
          spellCheck={false}
        />
        <InputGroupAddon align="inline-end">
          {status === "checking" ? (
            <Spinner aria-hidden="true" className="text-muted-foreground" />
          ) : null}
          {status === "available" ? (
            <CircleCheckIcon aria-hidden="true" className="text-success" />
          ) : null}
          {status === "taken" ? (
            <CircleAlertIcon aria-hidden="true" className="text-destructive" />
          ) : null}
        </InputGroupAddon>
      </InputGroup>
      <p
        id="spinner-06-status"
        aria-live="polite"
        className={
          status === "taken"
            ? "text-xs text-destructive"
            : "text-xs text-muted-foreground"
        }
      >
        {message}
      </p>
      <p className="text-xs text-muted-foreground">
        Try <span className="font-mono">design</span> to see a taken handle.
      </p>
    </div>
  );
}
