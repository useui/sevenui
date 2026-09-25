"use client";

import * as React from "react";
import {
  CheckCheckIcon,
  CheckIcon,
  DownloadIcon,
  FileTextIcon,
  HashIcon,
  SendHorizontalIcon,
  SmilePlusIcon,
} from "lucide-react";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/registry/base/ui/attachment";
import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
} from "@/registry/base/ui/bubble";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/registry/base/ui/input-group";
import { Kbd } from "@/registry/base/ui/kbd";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/registry/base/ui/message";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/base/ui/popover";

const reactionChoices = ["👍", "🎉", "👀", "🚀", "❤️"];

type Outgoing = {
  id: number;
  text: string;
  status: "sent" | "seen";
};

export default function Bubble16() {
  const [reactions, setReactions] = React.useState<string[]>(["🎉"]);
  const [outgoing, setOutgoing] = React.useState<Outgoing[]>([]);
  const [draft, setDraft] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const [replied, setReplied] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const nextId = React.useRef(1);

  const lastOutgoingId = outgoing.at(-1)?.id;

  // Simulate the teammate reading and replying to your first message.
  React.useEffect(() => {
    if (lastOutgoingId === undefined || replied) return;
    const seen = window.setTimeout(() => {
      setOutgoing((current) =>
        current.map((message) => ({ ...message, status: "seen" })),
      );
      setTyping(true);
    }, 900);
    const reply = window.setTimeout(() => {
      setTyping(false);
      setReplied(true);
    }, 2600);
    return () => {
      window.clearTimeout(seen);
      window.clearTimeout(reply);
    };
  }, [lastOutgoingId, replied]);

  React.useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    // Keep the log pinned to the newest message: jump there on first
    // render, then glide as new messages or the typing indicator arrive.
    const initial = outgoing.length === 0 && !typing;
    node.scrollTo({
      top: node.scrollHeight,
      behavior: initial ? "instant" : "smooth",
    });
  }, [outgoing.length, typing]);

  function toggleReaction(emoji: string) {
    setReactions((current) =>
      current.includes(emoji)
        ? current.filter((item) => item !== emoji)
        : [...current, emoji],
    );
  }

  function send() {
    const text = draft.trim();
    if (!text) return;
    const id = nextId.current++;
    setOutgoing((current) => [...current, { id, text, status: "sent" }]);
    setDraft("");
  }

  return (
    <section
      aria-labelledby="bubble-16-title"
      className="flex h-[30rem] w-full max-w-md flex-col overflow-hidden rounded-2xl border bg-background text-foreground shadow-sm"
    >
      <header className="flex items-center gap-2 border-b bg-card px-4 py-3">
        <HashIcon aria-hidden className="size-4 text-muted-foreground" />
        <h2 id="bubble-16-title" className="text-sm font-medium">
          launch-week
        </h2>
        <span className="ml-auto text-xs text-muted-foreground">8 members</span>
      </header>

      <div
        ref={scrollRef}
        role="log"
        aria-label="Messages in launch-week"
        className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto scroll-smooth px-3 py-4 motion-reduce:scroll-auto"
      >
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          Today
          <span className="h-px flex-1 bg-border" />
        </div>

        <Message>
          <MessageAvatar>
            <Avatar>
              <AvatarFallback>JW</AvatarFallback>
            </Avatar>
          </MessageAvatar>
          <MessageContent className="gap-1">
            <MessageHeader className="gap-1.5">
              <span className="text-foreground">Jade Wu</span>
              <time>09:12</time>
            </MessageHeader>
            <BubbleGroup className="gap-1">
              <Bubble variant="muted">
                <BubbleContent className="rounded-tl-md">
                  Final launch checklist is up — we're green on everything
                  except the status page.
                </BubbleContent>
              </Bubble>
              <Bubble variant="ghost" className="mb-3">
                <BubbleContent className="rounded-2xl">
                  <Attachment>
                    <AttachmentMedia>
                      <FileTextIcon aria-hidden />
                    </AttachmentMedia>
                    <AttachmentContent>
                      <AttachmentTitle>launch-checklist.pdf</AttachmentTitle>
                      <AttachmentDescription>
                        PDF · 312 KB
                      </AttachmentDescription>
                    </AttachmentContent>
                    <AttachmentActions>
                      <AttachmentAction aria-label="Download launch-checklist.pdf">
                        <DownloadIcon aria-hidden />
                      </AttachmentAction>
                    </AttachmentActions>
                  </Attachment>
                </BubbleContent>
              </Bubble>
              <Bubble variant="muted">
                <BubbleContent>
                  Can someone own the status page before 3pm?
                </BubbleContent>
                <BubbleReactions align="start">
                  {reactions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      aria-label={`Remove ${emoji} reaction`}
                      onClick={() => toggleReaction(emoji)}
                      className="rounded-full px-1.5 py-0.5 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {emoji}
                    </button>
                  ))}
                  <Popover>
                    <PopoverTrigger
                      aria-label="Add reaction"
                      className="flex size-6 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <SmilePlusIcon aria-hidden className="size-3.5" />
                    </PopoverTrigger>
                    <PopoverContent
                      side="top"
                      align="start"
                      className="w-auto flex-row gap-1 p-1"
                    >
                      {reactionChoices.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          aria-pressed={reactions.includes(emoji)}
                          aria-label={`React with ${emoji}`}
                          onClick={() => toggleReaction(emoji)}
                          className="flex size-8 items-center justify-center rounded-md text-base outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring aria-pressed:bg-muted"
                        >
                          {emoji}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                </BubbleReactions>
              </Bubble>
            </BubbleGroup>
          </MessageContent>
        </Message>

        {outgoing.length > 0 && (
          <Message align="end">
            <MessageContent className="gap-1">
              <BubbleGroup className="gap-1">
                {outgoing.map((message) => (
                  <Bubble key={message.id} align="end">
                    <BubbleContent className="whitespace-pre-line">
                      {message.text}
                    </BubbleContent>
                  </Bubble>
                ))}
              </BubbleGroup>
              <MessageFooter className="gap-1">
                {outgoing.at(-1)?.status === "seen" ? (
                  <>
                    <CheckCheckIcon
                      aria-hidden
                      className="size-3.5 text-primary"
                    />
                    Seen by Jade
                  </>
                ) : (
                  <>
                    <CheckIcon aria-hidden className="size-3.5" />
                    Sent
                  </>
                )}
              </MessageFooter>
            </MessageContent>
          </Message>
        )}

        {(typing || replied) && (
          <Message>
            <MessageAvatar>
              <Avatar>
                <AvatarFallback>JW</AvatarFallback>
              </Avatar>
            </MessageAvatar>
            <MessageContent>
              <Bubble variant="muted">
                {typing ? (
                  <BubbleContent
                    aria-label="Jade is typing"
                    className="flex h-10 items-center gap-1"
                  >
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        aria-hidden
                        className="size-1.5 animate-pulse rounded-full bg-muted-foreground motion-reduce:animate-none"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </BubbleContent>
                ) : (
                  <BubbleContent>
                    Amazing, thank you! Assigning it to you now.
                  </BubbleContent>
                )}
              </Bubble>
            </MessageContent>
          </Message>
        )}
      </div>

      <form
        className="border-t bg-card p-3"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <InputGroup>
          <InputGroupTextarea
            rows={1}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
            placeholder="Message #launch-week"
            aria-label="Message #launch-week"
            className="max-h-28 min-h-0"
          />
          <InputGroupAddon align="block-end" className="justify-between">
            <span className="hidden items-center gap-1 text-xs font-normal min-[360px]:flex">
              <Kbd>Shift</Kbd>+<Kbd>Enter</Kbd> for a new line
            </span>
            <InputGroupButton
              type="submit"
              variant="default"
              size="icon-xs"
              className="ml-auto"
              aria-label="Send message"
              disabled={!draft.trim()}
            >
              <SendHorizontalIcon aria-hidden />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </section>
  );
}
