"use client";

import * as React from "react";
import { ArrowUpIcon, SparklesIcon, SquareIcon } from "lucide-react";

import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/registry/base/ui/input-group";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/registry/base/ui/message-scroller";

type Turn = { id: string; role: "user" | "assistant"; text: string };

const answers: Record<string, string> = {
  "Why did my bill go up this month?":
    "Your September invoice is $412.80, up $118.40 from August. Most of the increase comes from two places: 3 new seats added on Sept 9 (prorated at $26.40 each, $79.20 total), and 1.9 TB of extra bandwidth on the Pro plan, billed at $20 per TB over the included 2 TB ($38.00). The remaining $1.20 is sales tax on the new charges.",
  "Which seats haven't been used in 30 days?":
    "Four seats show no sign-in for 30+ days: dana.kim@northwind.dev (last seen Aug 11), ops-bot@northwind.dev (never), leo.marsh@northwind.dev (Aug 2), and a pending invite for sam.ortiz@northwind.dev. Removing them before Oct 1 would lower next month's invoice by $105.60.",
  "How do I switch to annual billing?":
    "Open Settings → Billing → Plan and choose Annual. You'll be credited for the unused days of September, and the annual Pro plan is billed at $1,980 per year for your current 12 seats — about 17% less than paying monthly.",
};

const suggestions = Object.keys(answers);

export default function MessageScroller10() {
  const [turns, setTurns] = React.useState<Turn[]>([
    {
      id: "t0",
      role: "assistant",
      text: "Hi Morgan. I can answer questions about invoices, seats, and usage for the Northwind workspace.",
    },
  ]);
  const [draft, setDraft] = React.useState("");
  const [streaming, setStreaming] = React.useState<{
    id: string;
    words: string[];
    shown: number;
  } | null>(null);

  React.useEffect(() => {
    if (!streaming) return;
    if (streaming.shown >= streaming.words.length) {
      setStreaming(null);
      return;
    }
    const timer = window.setTimeout(() => {
      const shown = streaming.shown + 2;
      setTurns((prev) =>
        prev.map((turn) =>
          turn.id === streaming.id
            ? { ...turn, text: streaming.words.slice(0, shown).join(" ") }
            : turn,
        ),
      );
      setStreaming({ ...streaming, shown });
    }, 60);
    return () => window.clearTimeout(timer);
  }, [streaming]);

  function ask(question: string) {
    const text = question.trim();
    if (!text || streaming) return;
    const answer =
      answers[text] ??
      "I couldn't find that in your billing data. Try asking about invoices, seats, or usage.";
    const id = `a${turns.length + 1}`;
    setTurns((prev) => [
      ...prev,
      { id: `u${prev.length}`, role: "user", text },
      { id, role: "assistant", text: "" },
    ]);
    setStreaming({ id, words: answer.split(" "), shown: 0 });
    setDraft("");
  }

  function stop() {
    if (!streaming) return;
    const { id } = streaming;
    setTurns((prev) =>
      prev.map((turn) =>
        turn.id === id
          ? { ...turn, text: turn.text ? `${turn.text} …` : "Response stopped." }
          : turn,
      ),
    );
    setStreaming(null);
  }

  const asked = new Set(
    turns.filter((turn) => turn.role === "user").map((turn) => turn.text),
  );
  const remaining = suggestions.filter((item) => !asked.has(item));

  return (
    <aside
      aria-labelledby="billing-assistant-title"
      className="flex h-[30rem] w-full max-w-md flex-col overflow-hidden rounded-xl border bg-background"
    >
      <header className="flex items-center gap-2 border-b px-4 py-3">
        <SparklesIcon
          aria-hidden="true"
          className="size-4 shrink-0 text-primary"
        />
        <h2
          id="billing-assistant-title"
          className="shrink-0 text-sm font-medium"
        >
          Billing assistant
        </h2>
        <span className="ms-auto min-w-0 truncate text-xs text-muted-foreground">
          Invoice INV-2026-0917
        </span>
      </header>
      <MessageScrollerProvider autoScroll scrollPreviousItemPeek={48}>
        <MessageScroller className="flex-1">
          <MessageScrollerViewport
            className="px-4 py-4"
            aria-label="Billing assistant conversation"
            aria-busy={streaming ? true : undefined}
          >
            <MessageScrollerContent className="gap-5">
              {turns.map((turn) => (
                <MessageScrollerItem
                  key={turn.id}
                  messageId={turn.id}
                  scrollAnchor={turn.role === "user"}
                  className="flex flex-col"
                >
                  {turn.role === "user" ? (
                    <Bubble variant="secondary" align="end">
                      <BubbleContent>{turn.text}</BubbleContent>
                    </Bubble>
                  ) : (
                    <Bubble variant="ghost">
                      <BubbleContent className="text-pretty">
                        {turn.text || (
                          <span className="text-muted-foreground">
                            Reading your invoices…
                          </span>
                        )}
                      </BubbleContent>
                    </Bubble>
                  )}
                </MessageScrollerItem>
              ))}
              {remaining.length > 0 && !streaming ? (
                <MessageScrollerItem className="flex flex-col items-start gap-2">
                  <p className="text-xs text-muted-foreground">
                    Suggested questions
                  </p>
                  <div className="flex w-full flex-wrap gap-2">
                    {remaining.map((item) => (
                      <Button
                        key={item}
                        variant="outline"
                        size="sm"
                        className="h-auto max-w-full py-1.5 text-start whitespace-normal"
                        onClick={() => ask(item)}
                      >
                        {item}
                      </Button>
                    ))}
                  </div>
                </MessageScrollerItem>
              ) : null}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>
      <form
        className="p-3"
        onSubmit={(event) => {
          event.preventDefault();
          ask(draft);
        }}
      >
        <InputGroup>
          <InputGroupTextarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                ask(draft);
              }
            }}
            rows={1}
            placeholder="Ask about charges, seats, or usage"
            aria-label="Ask the billing assistant"
            className="min-h-10"
          />
          <InputGroupAddon align="block-end" className="justify-between">
            <span className="text-xs text-muted-foreground">
              Answers use your live billing data
            </span>
            {streaming ? (
              <InputGroupButton
                size="icon-xs"
                variant="secondary"
                onClick={stop}
                aria-label="Stop generating"
              >
                <SquareIcon aria-hidden="true" className="fill-current" />
              </InputGroupButton>
            ) : (
              <InputGroupButton
                type="submit"
                size="icon-xs"
                variant="default"
                disabled={!draft.trim()}
                aria-label="Send question"
              >
                <ArrowUpIcon aria-hidden="true" />
              </InputGroupButton>
            )}
          </InputGroupAddon>
        </InputGroup>
      </form>
    </aside>
  );
}
