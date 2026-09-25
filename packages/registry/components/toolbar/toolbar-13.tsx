"use client";

import {
  LockIcon,
  MessageSquareTextIcon,
  PaperclipIcon,
  SendHorizontalIcon,
  XIcon,
} from "lucide-react";
import { useId, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";
import { Kbd } from "@/registry/base/ui/kbd";
import { Toggle } from "@/registry/base/ui/toggle";
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/registry/base/ui/toolbar";

const savedReplies = [
  {
    title: "Refund issued",
    body: "I've issued a full refund to your original payment method. It usually appears within 5 to 10 business days.",
  },
  {
    title: "Escalated to engineering",
    body: "Thanks for the details. I've escalated this to our engineering team and will update you here within 24 hours.",
  },
  {
    title: "Closing the loop",
    body: "Glad that's sorted! I'll close this conversation, but reply anytime if anything else comes up.",
  },
];

export default function Toolbar13() {
  const id = useId();
  const [draft, setDraft] = useState("");
  const [internal, setInternal] = useState(false);
  const [attachment, setAttachment] = useState<string | null>(null);
  const [sent, setSent] = useState<{ text: string; internal: boolean }[]>([]);

  const canSend = draft.trim().length > 0;

  function send() {
    if (!canSend) return;
    setSent((current) => [...current, { text: draft.trim(), internal }]);
    setDraft("");
    setAttachment(null);
  }

  return (
    <section
      aria-label="Conversation with Hannah Lee"
      className="flex w-full max-w-md flex-col gap-3 rounded-xl border bg-card p-3 text-card-foreground shadow-xs"
    >
      <ol className="flex flex-col gap-2 text-sm">
        <li className="max-w-[85%] self-start rounded-lg rounded-bl-sm bg-muted px-3 py-2">
          Hi, I was charged twice for my Pro upgrade this morning. Order
          number 48213.
        </li>
        {sent.map((message, index) => (
          <li
            // biome-ignore lint/suspicious/noArrayIndexKey: messages are append-only
            key={index}
            className={
              message.internal
                ? "max-w-[85%] self-end rounded-lg rounded-br-sm border border-dashed border-warning/60 bg-warning/10 px-3 py-2"
                : "max-w-[85%] self-end rounded-lg rounded-br-sm bg-primary px-3 py-2 text-primary-foreground"
            }
          >
            {message.internal ? (
              <span className="mb-0.5 flex items-center gap-1 text-xs font-medium">
                <LockIcon aria-hidden="true" className="size-3" />
                Internal note
              </span>
            ) : null}
            {message.text}
          </li>
        ))}
      </ol>

      <div
        data-internal={internal || undefined}
        className="flex flex-col rounded-lg border bg-background transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 data-internal:border-warning/60 data-internal:bg-warning/5"
      >
        <label htmlFor={`${id}-reply`} className="sr-only">
          {internal ? "Internal note" : "Reply to Hannah"}
        </label>
        <textarea
          id={`${id}-reply`}
          rows={3}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              send();
            }
          }}
          placeholder={
            internal
              ? "Only your team can see this note"
              : "Reply to Hannah..."
          }
          className="w-full resize-none bg-transparent px-3 pt-2.5 text-sm outline-none placeholder:text-muted-foreground"
        />

        {attachment ? (
          <div className="px-3 pb-1">
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-muted py-0.5 pr-1 pl-2 text-xs">
              <PaperclipIcon aria-hidden="true" className="size-3 shrink-0" />
              <span className="truncate">{attachment}</span>
              <button
                type="button"
                aria-label={`Remove ${attachment}`}
                onClick={() => setAttachment(null)}
                className="inline-flex size-5 shrink-0 items-center justify-center rounded-sm outline-none hover:bg-background focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <XIcon aria-hidden="true" className="size-3" />
              </button>
            </span>
          </div>
        ) : null}

        <Toolbar
          aria-label="Reply options"
          className="w-full rounded-t-none border-0 bg-transparent shadow-none"
        >
          <ToolbarGroup aria-label="Insert">
            <ToolbarButton
              aria-label="Attach file"
              onClick={() => setAttachment("invoice-48213.pdf")}
            >
              <PaperclipIcon aria-hidden="true" />
            </ToolbarButton>
            <DropdownMenu>
              <ToolbarButton
                render={<DropdownMenuTrigger />}
                aria-label="Insert saved reply"
              >
                <MessageSquareTextIcon aria-hidden="true" />
              </ToolbarButton>
              <DropdownMenuContent className="w-60">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Saved replies</DropdownMenuLabel>
                  {savedReplies.map((reply) => (
                    <DropdownMenuItem
                      key={reply.title}
                      onClick={() => setDraft(reply.body)}
                      className="flex-col items-start gap-0"
                    >
                      <span className="font-medium">{reply.title}</span>
                      <span className="line-clamp-1 text-xs text-muted-foreground">
                        {reply.body}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarButton
            render={
              <Toggle
                size="sm"
                pressed={internal}
                onPressedChange={setInternal}
              />
            }
            className="data-pressed:bg-warning/15 data-pressed:text-foreground"
          >
            <LockIcon aria-hidden="true" />
            Internal
          </ToolbarButton>
          <span className="ml-auto hidden items-center gap-0.5 pr-1 text-xs text-muted-foreground sm:inline-flex">
            <Kbd>⌘</Kbd>
            <Kbd>Enter</Kbd>
          </span>
          <ToolbarButton
            disabled={!canSend}
            onClick={send}
            className="ml-auto bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground sm:ml-0"
          >
            {internal ? "Add note" : "Send"}
            <SendHorizontalIcon aria-hidden="true" />
          </ToolbarButton>
        </Toolbar>
      </div>
    </section>
  );
}
