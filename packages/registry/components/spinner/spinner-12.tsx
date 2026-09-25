"use client";

import { ArrowUpIcon, CheckCheckIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/base/ui/input-group";
import { Spinner } from "@/registry/base/ui/spinner";

type ChatMessage = {
  id: number;
  from: "agent" | "customer";
  text: string;
  status?: "sending" | "delivered";
};

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    from: "agent",
    text: "Hi Jordan, I'm Ava from Parcelry support. What can I help you with today?",
  },
];

const agentReplies = [
  "Found it. Order PX-48213 left our Denver warehouse this morning and is due Thursday by 8 pm. I've sent the tracking link to your email.",
  "Got it. I've added that to your ticket PR-2291, and a teammate will follow up by email within a day.",
];

export default function Spinner12() {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("Where is my order PX-48213?");
  const [agentWorking, setAgentWorking] = useState(false);
  const timers = useRef<number[]>([]);
  const nextId = useRef(2);
  const replyCount = useRef(0);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const id of pending) window.clearTimeout(id);
    };
  }, []);

  useEffect(() => {
    const node = scroller.current;
    if (node && (messages.length > 0 || agentWorking)) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages, agentWorking]);

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const id = nextId.current++;
    setMessages((prev) => [
      ...prev,
      { id, from: "customer", text, status: "sending" },
    ]);
    setDraft("");
    later(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "delivered" } : m)),
      );
      setAgentWorking(true);
    }, 800);
    later(() => {
      const text =
        agentReplies[Math.min(replyCount.current++, agentReplies.length - 1)];
      setAgentWorking(false);
      setMessages((prev) => [
        ...prev,
        { id: nextId.current++, from: "agent", text },
      ]);
    }, 3000);
  }

  return (
    <section
      aria-labelledby="spinner-12-title"
      className="flex h-[26rem] w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground"
    >
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Avatar>
          <AvatarImage src="/placeholder.svg" alt="" />
          <AvatarFallback>AR</AvatarFallback>
        </Avatar>
        <div className="grid gap-0.5">
          <h3 id="spinner-12-title" className="text-sm font-medium">
            Ava Ramirez
          </h3>
          <p className="text-xs text-muted-foreground">
            Parcelry support · replies in about 2 min
          </p>
        </div>
      </header>

      <div
        ref={scroller}
        role="log"
        aria-label="Conversation with Ava"
        className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
      >
        {messages.map((message) =>
          message.from === "agent" ? (
            <p
              key={message.id}
              className="max-w-[85%] self-start rounded-2xl rounded-bl-md bg-muted px-3 py-2 text-sm"
            >
              {message.text}
            </p>
          ) : (
            <div
              key={message.id}
              className="flex max-w-[85%] flex-col items-end gap-1 self-end"
            >
              <p
                className={`rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm text-primary-foreground transition-opacity ${
                  message.status === "sending" ? "opacity-70" : ""
                }`}
              >
                {message.text}
              </p>
              <span className="flex items-center gap-1 text-[0.6875rem] text-muted-foreground">
                {message.status === "sending" ? (
                  <>
                    <Spinner className="size-3" aria-label="Sending message" />
                    Sending
                  </>
                ) : (
                  <>
                    <CheckCheckIcon aria-hidden="true" className="size-3" />
                    Delivered
                  </>
                )}
              </span>
            </div>
          ),
        )}
        {agentWorking ? (
          <div className="flex items-center gap-2 self-start rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground">
            <Spinner className="size-3.5" aria-label="Ava is looking this up" />
            Ava is checking shipment records
          </div>
        ) : null}
      </div>

      <form onSubmit={send} className="border-t border-border p-3">
        <InputGroup>
          <InputGroupInput
            aria-label="Message"
            placeholder="Write a message"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="submit"
              size="icon-xs"
              variant="default"
              aria-label="Send message"
              disabled={!draft.trim()}
              className="rounded-full"
            >
              <ArrowUpIcon aria-hidden="true" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </section>
  );
}
