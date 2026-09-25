"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

// Each input height matches the Button size it sits next to.
const sizes = [
  {
    id: "sm",
    size: "Small",
    hint: "toolbars and dense tables",
    label: "Assignee",
    placeholder: "Filter by name",
    action: "Filter",
    done: "Filtered",
    input: "h-7 rounded-md px-2 text-sm md:text-xs",
    button: "sm",
  },
  {
    id: "default",
    size: "Default",
    hint: "forms and settings",
    label: "Board name",
    placeholder: "Q4 roadmap review",
    action: "Rename",
    done: "Renamed",
    input: "",
    button: "default",
  },
  {
    id: "lg",
    size: "Large",
    hint: "onboarding and empty states",
    label: "Team goal",
    placeholder: "What are you building?",
    action: "Start",
    done: "Started",
    input: "h-9 px-3",
    button: "lg",
  },
] as const;

function SizeRow({ size }: { size: (typeof sizes)[number] }) {
  const [value, setValue] = React.useState("");
  const [invalid, setInvalid] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!done) return;
    const timeout = window.setTimeout(() => setDone(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [done]);

  return (
    <form
      noValidate
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (!value.trim()) {
          setInvalid(true);
          inputRef.current?.focus();
          return;
        }
        setDone(true);
      }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <Label htmlFor={`input-04-${size.id}`}>{size.label}</Label>
        <span className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{size.size}</span>
          {` · ${size.hint}`}
        </span>
      </div>
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          id={`input-04-${size.id}`}
          placeholder={size.placeholder}
          autoComplete="off"
          value={value}
          aria-invalid={invalid || undefined}
          onChange={(event) => {
            setValue(event.target.value);
            setInvalid(false);
            setDone(false);
          }}
          className={size.input}
        />
        <Button type="submit" variant="outline" size={size.button}>
          {done && <Check aria-hidden="true" data-icon="inline-start" />}
          {done ? size.done : size.action}
        </Button>
      </div>
      <span className="sr-only" aria-live="polite">
        {done ? `${size.done}: ${value.trim()}` : ""}
      </span>
    </form>
  );
}

export default function Input04() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      {sizes.map((size) => (
        <SizeRow key={size.id} size={size} />
      ))}
    </div>
  );
}
