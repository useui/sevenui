"use client";

import * as React from "react";
import { CircleAlert, Inbox, RotateCw } from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/registry/base/ui/alert";
import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/registry/base/ui/message-scroller";
import { Skeleton } from "@/registry/base/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type ViewState = "ready" | "loading" | "empty" | "error";

const states: { value: ViewState; label: string }[] = [
  { value: "ready", label: "Ready" },
  { value: "loading", label: "Loading" },
  { value: "empty", label: "Empty" },
  { value: "error", label: "Error" },
];

const messages = [
  {
    id: "st-1",
    mine: false,
    text: "Hi Omar, your replacement keyboard shipped this morning.",
  },
  { id: "st-2", mine: true, text: "Thanks! Is there a tracking number?" },
  {
    id: "st-3",
    mine: false,
    text: "Yes: 1Z 999 AA1 0123 4567 84. It should arrive Thursday.",
  },
  {
    id: "st-4",
    mine: true,
    text: "Do I need to send the old one back?",
  },
  {
    id: "st-5",
    mine: false,
    text: "Only if you want the $20 credit. A prepaid label is in the box.",
  },
  { id: "st-6", mine: true, text: "Great, I'll drop it off this weekend." },
];

const skeletonRows = [
  { id: "sk-1", mine: false, width: "w-3/5" },
  { id: "sk-2", mine: true, width: "w-2/5" },
  { id: "sk-3", mine: false, width: "w-4/5" },
  { id: "sk-4", mine: true, width: "w-1/2" },
  { id: "sk-5", mine: false, width: "w-2/3" },
];

export default function MessageScroller04() {
  const [state, setState] = React.useState<ViewState>("ready");

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <ToggleGroup
        aria-label="Conversation state"
        variant="outline"
        size="sm"
        spacing={0}
        className="w-full"
        value={[state]}
        onValueChange={(value) => {
          const next = value[0] as ViewState | undefined;
          if (next) setState(next);
        }}
      >
        {states.map((item) => (
          <ToggleGroupItem key={item.value} value={item.value} className="flex-1">
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <MessageScrollerProvider>
        <MessageScroller className="h-80 rounded-xl border">
          <MessageScrollerViewport
            className="p-3"
            aria-label="Support conversation"
            aria-busy={state === "loading"}
          >
            <MessageScrollerContent
              className={
                state === "empty" || state === "error"
                  ? "justify-center gap-3"
                  : "gap-3"
              }
            >
              {state === "ready"
                ? messages.map((message) => (
                    <MessageScrollerItem
                      key={message.id}
                      messageId={message.id}
                      scrollAnchor={message.mine}
                      className="flex flex-col"
                    >
                      <Bubble
                        variant={message.mine ? "default" : "secondary"}
                        align={message.mine ? "end" : "start"}
                      >
                        <BubbleContent>{message.text}</BubbleContent>
                      </Bubble>
                    </MessageScrollerItem>
                  ))
                : null}
              {state === "loading" ? (
                <>
                  <span className="sr-only">Loading messages</span>
                  {skeletonRows.map((row) => (
                    <MessageScrollerItem
                      key={row.id}
                      aria-hidden="true"
                      className={
                        row.mine ? "flex justify-end" : "flex justify-start"
                      }
                    >
                      <Skeleton className={`h-10 rounded-3xl ${row.width}`} />
                    </MessageScrollerItem>
                  ))}
                </>
              ) : null}
              {state === "empty" ? (
                <MessageScrollerItem>
                  <Empty className="border-none p-4">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Inbox aria-hidden="true" />
                      </EmptyMedia>
                      <EmptyTitle>No messages yet</EmptyTitle>
                      <EmptyDescription>
                        Replies from the support team will appear here. Most
                        tickets get a first answer within two hours.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </MessageScrollerItem>
              ) : null}
              {state === "error" ? (
                <MessageScrollerItem>
                  <Alert variant="destructive">
                    <CircleAlert aria-hidden="true" />
                    <AlertTitle>Couldn't load this conversation</AlertTitle>
                    <AlertDescription>
                      <p>
                        The connection timed out. Your messages are safe; try
                        again to reload them.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setState("ready")}
                      >
                        <RotateCw data-icon="inline-start" aria-hidden="true" />
                        Retry
                      </Button>
                    </AlertDescription>
                  </Alert>
                </MessageScrollerItem>
              ) : null}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>
    </div>
  );
}
