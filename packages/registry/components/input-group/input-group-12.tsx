"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckIcon, XIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/registry/base/ui/input-group";
import { Spinner } from "@/registry/base/ui/spinner";

const takenSlugs = ["acme", "northwind", "studio", "design", "team"];

type Step = 1 | 2 | 3;

type Status = "idle" | "checking" | "available" | "taken" | "invalid";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .slice(0, 32);
}

export default function InputGroup12() {
  const inputId = useId();
  const hintId = useId();
  const nameId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState<Step>(2);
  const [name, setName] = useState("Northwind Labs");
  const [slug, setSlug] = useState("northwind-labs");
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    const value = slug.replace(/^-|-$/g, "");
    if (!value) {
      setStatus("idle");
      return;
    }
    if (value.length < 3) {
      setStatus("invalid");
      return;
    }
    setStatus("checking");
    // Simulated availability lookup; cleared whenever the slug changes.
    const timer = setTimeout(() => {
      setStatus(takenSlugs.includes(value) ? "taken" : "available");
    }, 450);
    return () => clearTimeout(timer);
  }, [slug]);

  const hint: Record<Status, string> = {
    idle: "Lowercase letters, numbers, and hyphens.",
    checking: "Checking availability…",
    available: `relay.so/${slug.replace(/^-|-$/g, "")} is yours to claim.`,
    taken: "That URL is already taken. Try adding your city or team.",
    invalid: "Use at least 3 characters.",
  };

  const isError = status === "taken" || status === "invalid";

  const clean = slug.replace(/^-|-$/g, "");

  function goTo(next: Step) {
    setStep(next);
    // Move focus to the new step's heading so keyboard and screen reader
    // users land on the content that just replaced the old step.
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  return (
    <form
      className="w-full max-w-md rounded-xl border border-border bg-card p-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (step === 1 && name.trim()) {
          setSlug(toSlug(name.trim()));
          goTo(2);
        }
        if (step === 2 && status === "available") goTo(3);
      }}
    >
      <div
        role="img"
        aria-label={`Step ${step} of 3`}
        className="flex gap-1.5"
      >
        {[1, 2, 3].map((item) => (
          <span
            key={item}
            className={
              item <= step
                ? "h-1 flex-1 rounded-full bg-primary"
                : "h-1 flex-1 rounded-full bg-muted"
            }
          />
        ))}
      </div>
      <h3
        ref={headingRef}
        tabIndex={-1}
        className="mt-5 text-lg font-semibold tracking-tight outline-none"
      >
        {step === 1
          ? "Name your workspace"
          : step === 2
            ? "Pick your workspace URL"
            : "Your workspace is ready"}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {step === 1
          ? "Use your company or team name. Teammates see it on every invite."
          : step === 2
            ? "Teammates use this link to sign in. You can change it later in settings."
            : `${name.trim()} lives at relay.so/${clean}. Share the link to invite your team.`}
      </p>
      {step === 1 ? (
        <div className="mt-5 flex flex-col gap-2">
          <label htmlFor={nameId} className="text-sm font-medium">
            Workspace name
          </label>
          <InputGroup>
            <InputGroupInput
              id={nameId}
              value={name}
              autoComplete="organization"
              onChange={(event) => setName(event.target.value)}
            />
          </InputGroup>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="mt-5 flex flex-col gap-2">
          <label htmlFor={inputId} className="text-sm font-medium">
            Workspace URL
          </label>
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>relay.so/</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id={inputId}
              value={slug}
              autoComplete="off"
              spellCheck={false}
              className="pl-0.5!"
              aria-invalid={isError ? true : undefined}
              aria-describedby={hintId}
              onChange={(event) => setSlug(toSlug(event.target.value))}
            />
            <InputGroupAddon align="inline-end">
              {status === "checking" ? (
                <Spinner aria-hidden="true" role="presentation" />
              ) : null}
              {status === "available" ? (
                <CheckIcon aria-hidden="true" className="text-success" />
              ) : null}
              {isError ? (
                <XIcon aria-hidden="true" className="text-destructive" />
              ) : null}
            </InputGroupAddon>
          </InputGroup>
          <p
            id={hintId}
            aria-live="polite"
            className={
              isError
                ? "text-sm text-destructive"
                : "text-sm text-muted-foreground"
            }
          >
            {hint[status]}
          </p>
        </div>
      ) : null}
      <div className="mt-6 flex items-center justify-between gap-3">
        {step > 1 ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => goTo(step === 3 ? 2 : 1)}
          >
            Back
          </Button>
        ) : (
          <span />
        )}
        {/* Distinct keys keep React from reusing one <button> for both: a
            reused element would flip to type="submit" mid-click and submit. */}
        {step === 3 ? (
          <Button
            key="start-over"
            type="button"
            variant="outline"
            onClick={() => {
              setName("Northwind Labs");
              setSlug("northwind-labs");
              goTo(1);
            }}
          >
            Start over
          </Button>
        ) : (
          <Button
            key="continue"
            type="submit"
            disabled={step === 1 ? !name.trim() : status !== "available"}
          >
            Continue
          </Button>
        )}
      </div>
    </form>
  );
}
