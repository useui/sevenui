"use client";

import * as React from "react";
import {
  CheckIcon,
  FileCodeIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  ImageIcon,
} from "lucide-react";
import { cn } from "cn";

import {
  Attachment,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/registry/base/ui/attachment";
import { Button } from "@/registry/base/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Mode = "single" | "multiple";

const files = [
  {
    id: "spec",
    name: "checkout-redesign-spec.md",
    meta: "24 KB · Markdown",
    icon: FileTextIcon,
  },
  {
    id: "metrics",
    name: "conversion-funnel.csv",
    meta: "1.3 MB · CSV",
    icon: FileSpreadsheetIcon,
  },
  {
    id: "mockup",
    name: "payment-step.png",
    meta: "860 KB · Image",
    icon: ImageIcon,
  },
  {
    id: "schema",
    name: "orders-schema.ts",
    meta: "6 KB · TypeScript",
    icon: FileCodeIcon,
  },
];

export default function Attachment06() {
  const [mode, setMode] = React.useState<Mode>("multiple");
  const [selected, setSelected] = React.useState<string[]>(["spec", "mockup"]);
  const [attached, setAttached] = React.useState(false);

  React.useEffect(() => {
    if (!attached) return;
    const timeout = window.setTimeout(() => setAttached(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [attached]);

  function changeMode(value: string[]) {
    const next = value[0] as Mode | undefined;
    if (!next) return;
    setMode(next);
    if (next === "single") setSelected((current) => current.slice(0, 1));
  }

  function toggle(id: string) {
    setAttached(false);
    setSelected((current) => {
      const isSelected = current.includes(id);
      if (mode === "single") return isSelected ? [] : [id];
      return isSelected
        ? current.filter((item) => item !== id)
        : [...current, id];
    });
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span id="attachment-06-heading" className="text-sm font-medium">
          Add context to your prompt
        </span>
        <ToggleGroup
          aria-label="Selection mode"
          variant="outline"
          size="sm"
          spacing={0}
          value={[mode]}
          onValueChange={changeMode}
        >
          <ToggleGroupItem value="single">Single</ToggleGroupItem>
          <ToggleGroupItem value="multiple">Multiple</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <ul
        aria-labelledby="attachment-06-heading"
        className="flex flex-col gap-2"
      >
        {files.map((file) => {
          const Icon = file.icon;
          const isSelected = selected.includes(file.id);
          return (
            <li key={file.id}>
              <Attachment
                size="sm"
                data-selected={isSelected || undefined}
                className="w-full data-selected:border-primary data-selected:bg-primary/5"
              >
                <AttachmentMedia>
                  <Icon aria-hidden="true" />
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle>{file.name}</AttachmentTitle>
                  <AttachmentDescription>{file.meta}</AttachmentDescription>
                </AttachmentContent>
                <AttachmentActions className="pointer-events-none pr-1">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-4.5 items-center justify-center border transition-[background-color,border-color,transform] duration-150 ease-out",
                      mode === "single" ? "rounded-full" : "rounded-[5px]",
                      isSelected
                        ? "scale-100 border-primary bg-primary text-primary-foreground"
                        : "scale-90 border-input bg-background text-transparent",
                    )}
                  >
                    <CheckIcon className="size-3" strokeWidth={3} />
                  </span>
                </AttachmentActions>
                <AttachmentTrigger
                  aria-pressed={isSelected}
                  aria-label={`Select ${file.name}`}
                  onClick={() => toggle(file.id)}
                  className="rounded-2xl focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </Attachment>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
        <span
          aria-live="polite"
          className="text-xs text-muted-foreground tabular-nums"
        >
          {selected.length === 0
            ? "No files selected"
            : `${selected.length} ${selected.length === 1 ? "file" : "files"} ${attached ? "added to your prompt" : "selected"}`}
        </span>
        <Button
          size="sm"
          disabled={selected.length === 0}
          onClick={() => setAttached(true)}
        >
          {attached ? (
            <>
              <CheckIcon aria-hidden="true" data-icon="inline-start" />
              Attached
            </>
          ) : (
            "Attach"
          )}
        </Button>
      </div>
    </div>
  );
}
