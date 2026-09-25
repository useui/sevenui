"use client";

import * as React from "react";
import { History } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";
import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@/registry/base/ui/marker";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/registry/base/ui/message-scroller";
import { Spinner } from "@/registry/base/ui/spinner";

type DayMessage = { id: string; mine: boolean; time: string; text: string };
type Day = { id: string; label: string; messages: DayMessage[] };

// Oldest first. The last day is visible on mount; older days load on demand.
const history: Day[] = [
  {
    id: "mar-3",
    label: "Monday, March 3",
    messages: [
      {
        id: "d1-1",
        mine: true,
        time: "09:12",
        text: "Hi Priya, welcome aboard! I'm your onboarding buddy this month.",
      },
      {
        id: "d1-2",
        mine: false,
        time: "09:20",
        text: "Thank you! Where should I start with the design system?",
      },
      {
        id: "d1-3",
        mine: true,
        time: "09:24",
        text: "Read the token guide first, then pair with Leo on the button audit.",
      },
    ],
  },
  {
    id: "mar-5",
    label: "Wednesday, March 5",
    messages: [
      {
        id: "d2-1",
        mine: false,
        time: "13:40",
        text: "Leo and I finished the audit. 14 buttons use hard-coded colors.",
      },
      {
        id: "d2-2",
        mine: true,
        time: "13:52",
        text: "Nice find. Open one ticket per surface so product teams can own them.",
      },
    ],
  },
  {
    id: "mar-10",
    label: "Monday, March 10",
    messages: [
      {
        id: "d3-1",
        mine: false,
        time: "10:05",
        text: "All 14 tickets are filed. Six are already merged.",
      },
      {
        id: "d3-2",
        mine: true,
        time: "10:07",
        text: "That's a great first week. Want to present the audit at Thursday's guild?",
      },
      {
        id: "d3-3",
        mine: false,
        time: "10:11",
        text: "Yes! I'll keep it to ten minutes with before and after screenshots.",
      },
      {
        id: "d3-4",
        mine: true,
        time: "10:12",
        text: "Perfect. I'll book the slot and share the deck template.",
      },
    ],
  },
];

export default function MessageScroller07() {
  const [loaded, setLoaded] = React.useState(1);
  const [pending, setPending] = React.useState(false);
  const days = history.slice(history.length - loaded);
  const hasMore = loaded < history.length;

  // Simulates a network round trip for the previous page of history.
  React.useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => {
      setLoaded((count) => Math.min(count + 1, history.length));
      setPending(false);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [pending]);

  return (
    <div className="flex h-[26rem] w-full max-w-md flex-col overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Avatar>
          <AvatarImage src="/placeholder.svg" alt="" />
          <AvatarFallback>PN</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">Priya Nair</p>
          <p className="truncate text-xs text-muted-foreground">
            Product designer, joined March 3
          </p>
        </div>
      </div>
      <MessageScrollerProvider>
        <MessageScroller className="min-h-0 flex-1">
          <MessageScrollerViewport
            className="px-3 py-4"
            aria-label="Conversation with Priya Nair"
            aria-busy={pending}
          >
            {/* The loader sits outside the content so the first message changes
                on each prepend, which lets the scroller keep the reading position. */}
            <div className="flex justify-center pb-4">
              {hasMore ? (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => setPending(true)}
                >
                  {pending ? (
                    <Spinner data-icon="inline-start" />
                  ) : (
                    <History data-icon="inline-start" aria-hidden="true" />
                  )}
                  {pending ? "Loading earlier messages" : "Load earlier messages"}
                </Button>
              ) : (
                <Marker className="w-auto text-xs">
                  <MarkerIcon>
                    <History className="size-3.5" aria-hidden="true" />
                  </MarkerIcon>
                  <MarkerContent>
                    This is the start of your conversation with Priya.
                  </MarkerContent>
                </Marker>
              )}
            </div>
            <MessageScrollerContent className="gap-2">
              {days.map((day) => (
                <React.Fragment key={day.id}>
                  <MessageScrollerItem className="py-2">
                    <Marker variant="separator" className="text-xs">
                      <MarkerContent>{day.label}</MarkerContent>
                    </Marker>
                  </MessageScrollerItem>
                  {day.messages.map((message) => (
                    <MessageScrollerItem
                      key={message.id}
                      messageId={message.id}
                      scrollAnchor={message.mine}
                      className="flex flex-col gap-0.5"
                    >
                      <Bubble
                        variant={message.mine ? "default" : "muted"}
                        align={message.mine ? "end" : "start"}
                      >
                        <BubbleContent>{message.text}</BubbleContent>
                      </Bubble>
                      <time
                        className={
                          message.mine
                            ? "self-end px-3 text-[0.6875rem] text-muted-foreground tabular-nums"
                            : "px-3 text-[0.6875rem] text-muted-foreground tabular-nums"
                        }
                      >
                        {message.time}
                      </time>
                    </MessageScrollerItem>
                  ))}
                </React.Fragment>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>
    </div>
  );
}
