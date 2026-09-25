"use client";

import * as React from "react";
import {
  BellRing,
  CheckCheck,
  Copy,
  Eye,
  Heart,
  MailOpen,
  MessageSquareReply,
  MoreHorizontal,
  PartyPopper,
  Pin,
  ThumbsUp,
  Trash2,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";

const REACTIONS = [
  { key: "thumbs-up", label: "Thumbs up", icon: ThumbsUp, base: 2 },
  { key: "heart", label: "Love it", icon: Heart, base: 0 },
  { key: "party", label: "Celebrate", icon: PartyPopper, base: 1 },
  { key: "eyes", label: "Looking into it", icon: Eye, base: 0 },
  { key: "done", label: "Done", icon: CheckCheck, base: 0 },
] as const;

type ReactionKey = (typeof REACTIONS)[number]["key"];

const REMINDERS = [
  { label: "In 20 minutes", time: "2:40 PM" },
  { label: "In 1 hour", time: "3:20 PM" },
  { label: "Tomorrow", time: "9:00 AM" },
  { label: "Next Monday", time: "9:00 AM" },
];

export default function DropdownMenu04() {
  const [mine, setMine] = React.useState<ReactionKey[]>(["party"]);
  const [pinned, setPinned] = React.useState(false);
  const [deleted, setDeleted] = React.useState(false);
  const [notice, setNotice] = React.useState("");

  function toggleReaction(key: ReactionKey) {
    setMine((prev) =>
      prev.includes(key) ? prev.filter((value) => value !== key) : [...prev, key],
    );
  }

  const visibleReactions = REACTIONS.map((reaction) => ({
    ...reaction,
    count: reaction.base + (mine.includes(reaction.key) ? 1 : 0),
    active: mine.includes(reaction.key),
  })).filter((reaction) => reaction.count > 0);

  if (deleted) {
    return (
      <div className="flex w-full max-w-sm items-center justify-between gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
        <p aria-live="polite">This message was deleted.</p>
        <Button variant="ghost" size="sm" onClick={() => setDeleted(false)}>
          Undo
        </Button>
      </div>
    );
  }

  return (
    <article
      aria-labelledby="dropdown-menu-04-author"
      className="group/message w-full max-w-sm rounded-xl border border-border bg-card p-3 text-card-foreground shadow-xs"
    >
      <div className="flex items-start gap-3">
        <Avatar>
          <AvatarFallback>DK</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span id="dropdown-menu-04-author" className="truncate text-sm font-medium">
              Daniel Kim
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">2:20 PM</span>
            {pinned ? (
              <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <Pin aria-hidden="true" className="size-3" />
                Pinned
              </span>
            ) : null}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Message actions"
                    className="-my-1 ml-auto shrink-0"
                  >
                    <MoreHorizontal aria-hidden="true" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuGroup className="flex justify-between gap-0.5 px-0.5 pb-1">
                  <DropdownMenuLabel className="sr-only">React</DropdownMenuLabel>
                  {REACTIONS.map(({ key, label, icon: Icon }) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      label={label}
                      aria-label={label}
                      checked={mine.includes(key)}
                      onCheckedChange={() => toggleReaction(key)}
                      className="size-9 justify-center rounded-md p-0 data-checked:bg-muted data-checked:text-foreground *:data-[slot=dropdown-menu-checkbox-item-indicator]:hidden"
                    >
                      <Icon aria-hidden="true" />
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setNotice("Replying in thread.")}>
                  <MessageSquareReply aria-hidden="true" />
                  Reply in thread
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard
                      ?.writeText("The staging deploy is green. Shipping the release notes at 3.")
                      .catch(() => {});
                    setNotice("Message text copied.");
                  }}
                >
                  <Copy aria-hidden="true" />
                  Copy text
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setPinned((value) => !value);
                    setNotice(pinned ? "Unpinned from #release." : "Pinned to #release.");
                  }}
                >
                  <Pin aria-hidden="true" />
                  {pinned ? "Unpin from channel" : "Pin to channel"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setNotice("Marked as unread from here.")}>
                  <MailOpen aria-hidden="true" />
                  Mark unread
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <BellRing aria-hidden="true" />
                    Remind me
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-48">
                    {REMINDERS.map((reminder) => (
                      <DropdownMenuItem
                        key={reminder.label}
                        onClick={() =>
                          setNotice(`We'll remind you at ${reminder.time}.`)
                        }
                      >
                        {reminder.label}
                        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                          {reminder.time}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => setDeleted(true)}>
                  <Trash2 aria-hidden="true" />
                  Delete message
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-sm">
            The staging deploy is green. Shipping the release notes at 3.
          </p>
          {visibleReactions.length > 0 ? (
            <ul aria-label="Reactions" className="mt-1 flex flex-wrap gap-1">
              {visibleReactions.map(({ key, label, icon: Icon, count, active }) => (
                <li key={key}>
                  <button
                    type="button"
                    aria-pressed={active}
                    aria-label={`${label}, ${count}`}
                    onClick={() => toggleReaction(key)}
                    className="flex h-6 items-center gap-1 rounded-full border border-border px-2 text-xs tabular-nums outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring aria-pressed:border-primary/40 aria-pressed:bg-primary/10"
                  >
                    <Icon aria-hidden="true" className="size-3" />
                    {count}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <p aria-live="polite" className="min-h-4 text-xs text-muted-foreground">
            {notice}
          </p>
        </div>
      </div>
    </article>
  );
}
