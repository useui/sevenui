"use client";

import { CloudCheckIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { Label } from "@/registry/base/ui/label";
import { Spinner } from "@/registry/base/ui/spinner";
import { Textarea } from "@/registry/base/ui/textarea";

const WORDS_PER_MINUTE = 200;

const initialDraft = `This week we shipped usage-based billing to the first 40 workspaces. Invoices now itemize API calls per project, and nobody has opened a billing ticket about it yet.

Next week: move the remaining Team plans over and retire the old seat calculator.`;

type SaveState = "saved" | "saving";

function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export default function Textarea06() {
  const id = useId();
  const [draft, setDraft] = useState(initialDraft);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [savedAt, setSavedAt] = useState("9:41 AM");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function handleChange(value: string) {
    setDraft(value);
    setSaveState("saving");
    if (timer.current) clearTimeout(timer.current);
    // Debounce: save once typing pauses for 800ms.
    timer.current = setTimeout(() => {
      setSaveState("saved");
      setSavedAt(
        new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
      );
    }, 800);
  }

  const words = countWords(draft);
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));

  return (
    <div className="flex w-full max-w-lg flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={`${id}-draft`}>Weekly update to #billing-team</Label>
        <p
          aria-live="polite"
          className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground"
        >
          {saveState === "saving" ? (
            <>
              <Spinner aria-hidden="true" className="size-3.5" />
              Saving
            </>
          ) : (
            <>
              <CloudCheckIcon aria-hidden="true" className="size-3.5" />
              Saved at {savedAt}
            </>
          )}
        </p>
      </div>
      <Textarea
        id={`${id}-draft`}
        value={draft}
        onChange={(event) => handleChange(event.target.value)}
        aria-describedby={`${id}-meta`}
        placeholder="What shipped, what slipped, and what is next?"
        className="min-h-40 leading-relaxed"
      />
      <div
        id={`${id}-meta`}
        className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-muted-foreground"
      >
        <span className="tabular-nums">
          {words} {words === 1 ? "word" : "words"} · about {minutes} min read
        </span>
        <span>Drafts are kept for 30 days.</span>
      </div>
    </div>
  );
}
