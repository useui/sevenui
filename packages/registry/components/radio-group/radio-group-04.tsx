"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "cn";
import { LockIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

const windows = [
  { value: "30", label: "30 days", note: "Minimum for SOC 2 evidence" },
  { value: "90", label: "90 days", note: "Recommended for most teams" },
  { value: "365", label: "1 year", note: "Required for audit trails" },
];

export default function RadioGroup04() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState("90");
  const [draft, setDraft] = useState("90");
  const groupRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLButtonElement>(null);
  const toggled = useRef(false);

  // Edit, Save and Cancel unmount themselves, so hand focus to the control
  // that replaces them instead of letting it fall back to the page.
  useEffect(() => {
    if (!toggled.current) return;
    toggled.current = false;
    if (editing) {
      groupRef.current
        ?.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]')
        ?.focus();
    } else {
      editRef.current?.focus();
    }
  }, [editing]);

  const edit = () => {
    toggled.current = true;
    setEditing(true);
  };

  const cancel = () => {
    toggled.current = true;
    setDraft(saved);
    setEditing(false);
  };

  const save = () => {
    toggled.current = true;
    setSaved(draft);
    setEditing(false);
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p id="radio-group-04-label" className="text-sm font-medium">
            Log retention
          </p>
          <p
            id="radio-group-04-hint"
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            {editing ? (
              "Changes apply to logs written after you save."
            ) : (
              <>
                <LockIcon aria-hidden="true" className="size-3 shrink-0" />
                Read-only. Only workspace owners can edit.
              </>
            )}
          </p>
        </div>
        {editing ? null : (
          <Button
            ref={editRef}
            size="sm"
            variant="outline"
            onClick={edit}
          >
            Edit
          </Button>
        )}
      </div>

      <RadioGroup
        ref={groupRef}
        value={draft}
        onValueChange={(value) => setDraft(value as string)}
        readOnly={!editing}
        aria-labelledby="radio-group-04-label"
        aria-describedby="radio-group-04-hint"
        className="gap-3 aria-readonly:[&_[data-slot=radio-group-item]]:opacity-60"
      >
        {windows.map((option) => (
          <Label
            key={option.value}
            className={cn(
              "items-start gap-3 font-normal",
              editing ? "cursor-pointer" : "cursor-default",
            )}
          >
            <RadioGroupItem value={option.value} className="mt-px" />
            <span className="flex flex-col gap-1">
              <span className="font-medium">{option.label}</span>
              <span className="text-xs text-muted-foreground">
                {option.note}
              </span>
            </span>
          </Label>
        ))}
      </RadioGroup>

      {editing ? (
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button size="sm" variant="ghost" onClick={cancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={save} disabled={draft === saved}>
            Save
          </Button>
        </div>
      ) : null}
    </div>
  );
}
