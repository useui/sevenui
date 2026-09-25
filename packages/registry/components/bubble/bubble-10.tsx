"use client";

import * as React from "react";
import { BikeIcon, PhoneIcon, SendHorizontalIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Bubble, BubbleContent, BubbleGroup } from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/base/ui/input-group";
import { Progress } from "@/registry/base/ui/progress";

const presets = [
  "Leave it at the door",
  "Please ring the bell",
  "Coming down now",
];

const courierMessages = [
  "Hi! I picked up your order from Green Fork.",
  "I'm about 6 minutes away. Anything I should know about the building?",
];

export default function Bubble10() {
  const [sent, setSent] = React.useState<{ id: number; text: string }[]>([]);
  const nextId = React.useRef(1);
  const [draft, setDraft] = React.useState("");

  function send(text: string) {
    const value = text.trim();
    if (!value) return;
    const id = nextId.current++;
    setSent((current) => [...current, { id, text: value }]);
    setDraft("");
  }

  return (
    <section
      aria-label="Chat with your courier"
      className="flex w-full max-w-xs flex-col overflow-hidden rounded-3xl border bg-background shadow-sm"
    >
      <header className="flex flex-col gap-3 border-b bg-card px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarImage src="/placeholder.svg" alt="" />
            <AvatarFallback>DK</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <h2 className="truncate text-sm font-medium">
              Daniel · your courier
            </h2>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <BikeIcon aria-hidden className="size-3.5" />
              Order 4821 · arriving 12:42
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            aria-label="Call Daniel"
            nativeButton={false}
            render={<a href="#call-daniel" />}
          >
            <PhoneIcon aria-hidden />
          </Button>
        </div>
        <Progress value={78} aria-label="Delivery progress" />
      </header>

      <div className="flex flex-col gap-3 px-3 py-4" aria-live="polite">
        <BubbleGroup>
          {courierMessages.map((message) => (
            <Bubble key={message} variant="secondary">
              <BubbleContent>{message}</BubbleContent>
            </Bubble>
          ))}
        </BubbleGroup>

        {sent.length > 0 && (
          <BubbleGroup>
            {sent.map((message) => (
              <Bubble key={message.id} align="end">
                <BubbleContent>{message.text}</BubbleContent>
              </Bubble>
            ))}
            <p className="self-end px-3 text-xs text-muted-foreground">
              Delivered
            </p>
          </BubbleGroup>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t bg-card p-3">
        <fieldset className="min-w-0 flex flex-wrap gap-1.5">
          <legend className="sr-only">Quick replies</legend>
          {presets.map((preset) => (
            <Button
              key={preset}
              variant="outline"
              size="xs"
              className="rounded-full"
              onClick={() => send(preset)}
            >
              {preset}
            </Button>
          ))}
        </fieldset>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            send(draft);
          }}
        >
          <InputGroup className="rounded-full">
            <InputGroupInput
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Message Daniel"
              aria-label="Message Daniel"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="submit"
                size="icon-xs"
                variant="default"
                className="rounded-full"
                aria-label="Send message"
                disabled={!draft.trim()}
              >
                <SendHorizontalIcon aria-hidden />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </form>
      </div>
    </section>
  );
}
