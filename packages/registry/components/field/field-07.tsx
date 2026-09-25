"use client";

import { useEffect, useRef, useState } from "react";
import { CircleCheckIcon, CircleXIcon } from "lucide-react";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/registry/base/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/registry/base/ui/input-group";
import { Spinner } from "@/registry/base/ui/spinner";

type Status = "idle" | "checking" | "available" | "taken";

type FieldActions = { validate: () => void };

// Stand-in for a server lookup; swap for your own API call.
const takenHandles = ["alex", "design", "sevenui", "studio", "maria"];

function lookupHandle(handle: string) {
  return new Promise<boolean>((resolve) => {
    setTimeout(() => resolve(!takenHandles.includes(handle)), 650);
  });
}

function suggestionsFor(handle: string) {
  return [`${handle}.studio`, `${handle}hq`, `the${handle}`];
}

export default function Field07() {
  const [handle, setHandle] = useState("studio");
  const [status, setStatus] = useState<Status>("idle");
  // Starts at 1 so the prefilled handle is checked on mount.
  const [revalidate, setRevalidate] = useState(1);
  const actionsRef = useRef<FieldActions | null>(null);
  const requestRef = useRef(0);

  // Validate on mount and after a suggestion is applied programmatically.
  useEffect(() => {
    if (revalidate > 0) actionsRef.current?.validate();
  }, [revalidate]);

  const validate = async (value: unknown) => {
    const next = String(value ?? "")
      .trim()
      .toLowerCase();
    const request = ++requestRef.current;

    if (next.length < 3) {
      setStatus("idle");
      return "Handles need at least 3 characters.";
    }
    if (!/^[a-z0-9._]+$/.test(next)) {
      setStatus("idle");
      return "Use letters, numbers, dots, or underscores.";
    }

    setStatus("checking");
    const available = await lookupHandle(next);
    if (request !== requestRef.current) return null;

    setStatus(available ? "available" : "taken");
    return available ? null : `@${next} is already taken.`;
  };

  const applySuggestion = (suggestion: string) => {
    setHandle(suggestion);
    setRevalidate((count) => count + 1);
  };

  return (
    <div className="w-full max-w-sm">
      <Field
        name="handle"
        actionsRef={actionsRef}
        validationMode="onChange"
        validationDebounceTime={400}
        validate={validate}
      >
        <FieldLabel>Public handle</FieldLabel>
        <InputGroup
          className={
            status === "available"
              ? "border-success/60 has-[[data-slot=input-group-control]:focus-visible]:border-success has-[[data-slot=input-group-control]:focus-visible]:ring-success/25"
              : undefined
          }
        >
          <InputGroupAddon>
            <InputGroupText>@</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            value={handle}
            autoComplete="off"
            spellCheck={false}
            className="pl-0.5"
            onChange={(event) => setHandle(event.target.value)}
          />
          <InputGroupAddon align="inline-end">
            {status === "checking" && (
              <Spinner aria-label="Checking availability" />
            )}
            {status === "available" && (
              <CircleCheckIcon aria-hidden="true" className="text-success" />
            )}
            {status === "taken" && (
              <CircleXIcon aria-hidden="true" className="text-destructive" />
            )}
          </InputGroupAddon>
        </InputGroup>

        {status === "available" ? (
          <FieldDescription role="status" className="text-success">
            Good news: sevenui.dev/@{handle.trim().toLowerCase()} is yours to
            claim.
          </FieldDescription>
        ) : (
          <FieldDescription>
            {status === "checking"
              ? "Checking availability…"
              : "Your profile lives at sevenui.dev/@handle."}
          </FieldDescription>
        )}

        <FieldError />

        {status === "taken" && (
          <div className="flex flex-wrap items-center gap-1.5 text-sm animate-in fade-in-0 slide-in-from-top-1">
            <span className="text-muted-foreground">Try</span>
            {suggestionsFor(handle.trim().toLowerCase()).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => applySuggestion(suggestion)}
                className="rounded-md border border-border bg-muted/50 px-2 py-0.5 font-medium transition-colors outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                @{suggestion}
              </button>
            ))}
          </div>
        )}
      </Field>
    </div>
  );
}
