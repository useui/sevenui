"use client";

import * as React from "react";
import { ArrowUpIcon, CheckIcon, HashIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { Marker, MarkerContent } from "@/registry/base/ui/marker";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
  useMessageScrollerVisibility,
} from "@/registry/base/ui/message-scroller";

type ChannelMessage = {
  id: string;
  author: string;
  initials: string;
  time: string;
  text: string;
};

const channel: ChannelMessage[] = [
  { id: "c1", author: "Ava Chen", initials: "AC", time: "9:02 AM", text: "Morning! Launch checklist is pinned in the channel header." },
  { id: "c2", author: "Marcus Webb", initials: "MW", time: "9:05 AM", text: "Pricing page copy is final. Legal signed off last night." },
  { id: "c3", author: "Ava Chen", initials: "AC", time: "9:11 AM", text: "Great. Can someone own the status page announcement?" },
  { id: "c4", author: "Jonas Berg", initials: "JB", time: "9:14 AM", text: "I'll take it. Drafting now, will share by 10." },
  { id: "c5", author: "Lina Park", initials: "LP", time: "9:26 AM", text: "Heads up: the onboarding email still links to the old docs URL." },
  { id: "c6", author: "Marcus Webb", initials: "MW", time: "9:31 AM", text: "Good catch. Fixing the template in Customer.io." },
  { id: "c7", author: "Ava Chen", initials: "AC", time: "9:40 AM", text: "Let's do a final go/no-go at 11:30. Calendar invite sent." },
  { id: "c8", author: "Jonas Berg", initials: "JB", time: "9:58 AM", text: "Status page draft is in the doc. Two options for the headline." },
  { id: "c9", author: "Lina Park", initials: "LP", time: "10:04 AM", text: "Option B reads better to me. Shorter and names the feature." },
  { id: "c10", author: "Marcus Webb", initials: "MW", time: "10:12 AM", text: "Email template is fixed and re-queued for 12:00 UTC." },
  { id: "c11", author: "Ava Chen", initials: "AC", time: "10:20 AM", text: "Staging looks clean. Error rate flat for the last hour." },
  { id: "c12", author: "Jonas Berg", initials: "JB", time: "10:26 AM", text: "Going with option B. Scheduled to publish at 11:45." },
];

// Messages after this one arrived while the reader was away.
const lastReadIndex = 6;
const firstUnread = channel[lastReadIndex + 1];
const unreadCount = channel.length - lastReadIndex - 1;

function UnreadBanner({
  read,
  onMarkRead,
}: {
  read: boolean;
  onMarkRead: () => void;
}) {
  const { scrollToMessage } = useMessageScroller();
  const { visibleMessageIds } = useMessageScrollerVisibility();
  const firstUnreadVisible = visibleMessageIds.includes(firstUnread.id);

  if (read) return null;

  return (
    <div className="flex items-center gap-2 border-b bg-muted/60 px-4 py-2 text-xs">
      <p className="min-w-0 flex-1 truncate">
        <span className="font-medium">{unreadCount} new messages</span>{" "}
        <span className="text-muted-foreground">since {firstUnread.time}</span>
      </p>
      {firstUnreadVisible ? null : (
        <Button
          variant="ghost"
          size="xs"
          onClick={() =>
            scrollToMessage(firstUnread.id, {
              align: "start",
              behavior: "smooth",
            })
          }
        >
          <ArrowUpIcon aria-hidden="true" data-icon="inline-start" />
          Jump
        </Button>
      )}
      <Button variant="outline" size="xs" onClick={onMarkRead}>
        <CheckIcon aria-hidden="true" data-icon="inline-start" />
        Mark as read
      </Button>
    </div>
  );
}

export default function MessageScroller11() {
  const [read, setRead] = React.useState(false);

  return (
    <section
      aria-labelledby="channel-title"
      className="flex h-[28rem] w-full max-w-lg flex-col overflow-hidden rounded-xl border bg-background"
    >
      <header className="flex items-center gap-1.5 border-b px-4 py-3">
        <HashIcon aria-hidden="true" className="size-4 text-muted-foreground" />
        <h2 id="channel-title" className="text-sm font-medium">
          launch-planning
        </h2>
        <span className="ms-auto text-xs text-muted-foreground">
          8 members
        </span>
      </header>
      <MessageScrollerProvider defaultScrollPosition="last-anchor">
        <UnreadBanner read={read} onMarkRead={() => setRead(true)} />
        <MessageScroller className="flex-1">
          <MessageScrollerViewport
            className="py-2"
            aria-label="Messages in launch-planning"
          >
            <MessageScrollerContent className="gap-0">
              {channel.map((message, index) => (
                <MessageScrollerItem
                  key={message.id}
                  messageId={message.id}
                  scrollAnchor={message.id === firstUnread.id}
                  className="flex flex-col"
                >
                  {message.id === firstUnread.id && !read ? (
                    <Marker
                      variant="separator"
                      className="px-4 py-1 text-xs font-medium text-destructive before:bg-destructive/40 after:bg-destructive/40"
                    >
                      <MarkerContent>New</MarkerContent>
                    </Marker>
                  ) : null}
                  <article
                    className={
                      !read && index > lastReadIndex
                        ? "flex gap-3 bg-accent/40 px-4 py-2"
                        : "flex gap-3 px-4 py-2 hover:bg-muted/50"
                    }
                  >
                    <Avatar className="mt-0.5">
                      <AvatarFallback className="text-xs">
                        {message.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-baseline gap-2">
                        <span className="text-sm font-medium">
                          {message.author}
                        </span>
                        <time className="text-xs text-muted-foreground tabular-nums">
                          {message.time}
                        </time>
                      </p>
                      <p className="text-sm text-pretty text-foreground/90">
                        {message.text}
                      </p>
                    </div>
                  </article>
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>
    </section>
  );
}
