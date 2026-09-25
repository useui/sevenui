"use client";

import * as React from "react";
import {
  BugIcon,
  CreditCardIcon,
  MessagesSquareIcon,
  SendIcon,
  SparklesIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarGroup } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";
import { Textarea } from "@/registry/base/ui/textarea";

const team = [
  { initials: "MO", name: "Maya Ortiz" },
  { initials: "TB", name: "Theo Brandt" },
  { initials: "AN", name: "Aiko Nakamura" },
];

const topics = [
  {
    icon: CreditCardIcon,
    label: "Billing question",
    draft: "Hi! I have a question about my latest invoice: ",
  },
  {
    icon: BugIcon,
    label: "Report a bug",
    draft: "I found a bug. Steps to reproduce: ",
  },
  {
    icon: SparklesIcon,
    label: "Request a feature",
    draft: "It would help my team if you could add ",
  },
];

export default function Empty19() {
  const [draft, setDraft] = React.useState("");
  const [messages, setMessages] = React.useState<{ id: number; text: string }[]>([]);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  function startTopic(text: string) {
    setDraft(text);
    const field = textareaRef.current;
    if (field) {
      field.focus();
      requestAnimationFrame(() =>
        field.setSelectionRange(text.length, text.length),
      );
    }
  }

  function send(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((current) => [...current, { id: current.length + 1, text }]);
    setDraft("");
  }

  return (
    <section
      aria-labelledby="empty-19-title"
      className="flex h-[30rem] w-full max-w-sm flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm"
    >
      <header className="flex items-center gap-3 border-b bg-muted/40 px-4 py-3">
        <AvatarGroup className="-space-x-1">
          {team.map((member) => (
            <Avatar key={member.initials}>
              <AvatarFallback className="text-xs">
                {member.initials}
              </AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
        <div className="min-w-0">
          <h2 id="empty-19-title" className="text-sm font-medium">
            Acme support
          </h2>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
            Online &middot; replies in ~5&nbsp;min
          </p>
        </div>
      </header>

      <div
        role="log"
        aria-label="Conversation"
        className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4"
      >
        {messages.length === 0 ? (
          <Empty className="p-2">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessagesSquareIcon aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>How can we help?</EmptyTitle>
              <EmptyDescription>
                Pick a topic or write your own. Maya, Theo, and Aiko are on
                shift until 6 PM CET.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex w-full flex-col gap-1.5">
                {topics.map((topic) => (
                  <Button
                    key={topic.label}
                    variant="outline"
                    className="justify-start"
                    onClick={() => startTopic(topic.draft)}
                  >
                    <topic.icon
                      data-icon="inline-start"
                      className="text-muted-foreground"
                      aria-hidden="true"
                    />
                    {topic.label}
                  </Button>
                ))}
              </div>
            </EmptyContent>
          </Empty>
        ) : (
          <ol className="mt-auto flex flex-col gap-2">
            {messages.map((message) => (
              <li
                key={message.id}
                className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm text-primary-foreground"
              >
                {message.text}
              </li>
            ))}
            <li className="mt-2 self-center text-xs text-muted-foreground">
              Maya usually replies within 5 minutes. We&apos;ll also email you.
            </li>
          </ol>
        )}
      </div>

      <form onSubmit={send} className="flex items-end gap-2 border-t p-3">
        <label htmlFor="empty-19-message" className="sr-only">
          Message
        </label>
        <Textarea
          ref={textareaRef}
          id="empty-19-message"
          rows={1}
          value={draft}
          placeholder="Write a message…"
          className="max-h-28 min-h-9 resize-none"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
        />
        <Button
          type="submit"
          size="icon"
          aria-label="Send message"
          disabled={!draft.trim()}
          className="size-9"
        >
          <SendIcon aria-hidden="true" />
        </Button>
      </form>
    </section>
  );
}
