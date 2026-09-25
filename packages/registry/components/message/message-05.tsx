"use client";

import * as React from "react";
import { PencilIcon, Trash2Icon, Undo2Icon } from "lucide-react";

import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";
import {
  Message,
  MessageContent,
  MessageFooter,
} from "@/registry/base/ui/message";
import { Textarea } from "@/registry/base/ui/textarea";

type Mode = "view" | "edit" | "deleted";

const originalText =
  "Standup moves to 9:30 tomorrow so the design team can join from Lisbon.";

export default function Message05() {
  const [mode, setMode] = React.useState<Mode>("view");
  const [text, setText] = React.useState(originalText);
  const [draft, setDraft] = React.useState(originalText);
  const [edited, setEdited] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const editButtonRef = React.useRef<HTMLButtonElement>(null);
  const undoButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (mode === "edit") {
      const node = textareaRef.current;
      node?.focus();
      node?.setSelectionRange(node.value.length, node.value.length);
    }
    // Keep focus on the only remaining control after a delete.
    if (mode === "deleted") undoButtonRef.current?.focus();
  }, [mode]);

  const trimmed = draft.trim();
  const unchanged = trimmed === text;

  function startEdit() {
    setDraft(text);
    setMode("edit");
  }

  function cancel() {
    setMode("view");
    requestAnimationFrame(() => editButtonRef.current?.focus());
  }

  function save() {
    if (!trimmed) return;
    if (!unchanged) {
      setText(trimmed);
      setEdited(true);
    }
    cancel();
  }

  return (
    <div className="flex w-full max-w-sm flex-col">
      <Message align="end">
        <MessageContent className="gap-1.5">
          {mode === "view" && (
            <>
              <Bubble align="end">
                <BubbleContent>{text}</BubbleContent>
              </Bubble>
              <MessageFooter className="gap-1">
                <span className="mr-1 tabular-nums">
                  {edited ? "Edited · 11:06" : "11:04"}
                </span>
                <Button
                  ref={editButtonRef}
                  variant="ghost"
                  size="xs"
                  onClick={startEdit}
                >
                  <PencilIcon data-icon="inline-start" aria-hidden="true" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  className="hover:text-destructive"
                  onClick={() => setMode("deleted")}
                >
                  <Trash2Icon data-icon="inline-start" aria-hidden="true" />
                  Delete
                </Button>
              </MessageFooter>
            </>
          )}
          {mode === "edit" && (
            <form
              className="flex w-full flex-col gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                save();
              }}
            >
              <label htmlFor="message-05-edit" className="sr-only">
                Edit message
              </label>
              <Textarea
                ref={textareaRef}
                id="message-05-edit"
                value={draft}
                aria-invalid={!trimmed || undefined}
                aria-describedby="message-05-hint"
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    cancel();
                  }
                  if (
                    event.key === "Enter" &&
                    (event.metaKey || event.ctrlKey)
                  ) {
                    event.preventDefault();
                    save();
                  }
                }}
                className="min-h-20 resize-none rounded-2xl"
              />
              <div className="flex items-center justify-between gap-2">
                <span
                  id="message-05-hint"
                  className="text-xs text-muted-foreground"
                >
                  {trimmed
                    ? "Esc to cancel · Ctrl or ⌘ + Enter to save"
                    : "A message cannot be empty"}
                </span>
                <div className="flex gap-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={cancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!trimmed || unchanged}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </form>
          )}
          {mode === "deleted" && (
            <>
              <Bubble align="end" variant="outline">
                <BubbleContent className="border-dashed text-muted-foreground italic">
                  You deleted this message
                </BubbleContent>
              </Bubble>
              <MessageFooter>
                <Button
                  variant="ghost"
                  size="xs"
                  ref={undoButtonRef}
                  onClick={() => {
                    setMode("view");
                    requestAnimationFrame(() => editButtonRef.current?.focus());
                  }}
                >
                  <Undo2Icon data-icon="inline-start" aria-hidden="true" />
                  Undo
                </Button>
              </MessageFooter>
            </>
          )}
        </MessageContent>
      </Message>
    </div>
  );
}
