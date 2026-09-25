"use client";

import * as React from "react";
import {
  ChevronsDownUpIcon,
  ChevronsUpDownIcon,
  PaperclipIcon,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from "@/registry/base/ui/message-scroller";

type Email = {
  id: string;
  from: string;
  initials: string;
  to: string;
  date: string;
  body: string[];
  attachment?: string;
};

const emails: Email[] = [
  {
    id: "em-1",
    from: "Inês Duarte",
    initials: "ID",
    to: "to Harbor team",
    date: "Sep 12",
    body: [
      "Hi all, attached is the draft contract for the Lisbon offsite at Casa do Rio, Oct 14 to 16.",
      "It covers 42 rooms, the riverside hall for two days, and catering for all meals. The hold expires on Sep 26.",
    ],
    attachment: "casa-do-rio-contract-draft.pdf",
  },
  {
    id: "em-2",
    from: "Tom Becker",
    initials: "TB",
    to: "to Inês, Harbor team",
    date: "Sep 15",
    body: [
      "Thanks Inês. Finance is fine with the total, but the cancellation clause is 100% within 30 days. Can we get that down to 50%?",
    ],
  },
  {
    id: "em-3",
    from: "Inês Duarte",
    initials: "ID",
    to: "to Tom, Harbor team",
    date: "Sep 18",
    body: [
      "The venue agreed to 50% inside 30 days and 100% inside 7 days. Updated draft attached.",
      "They also added a free late checkout on the 16th for anyone on the afternoon flight.",
    ],
    attachment: "casa-do-rio-contract-v2.pdf",
  },
  {
    id: "em-4",
    from: "Grace Liu",
    initials: "GL",
    to: "to Inês, Tom, Harbor team",
    date: "Sep 22",
    body: [
      "Legal reviewed v2. Two small edits: the liability cap should reference the total contract value, and the governing law should be Portugal on both sides.",
      "With those in, I'm happy for Tom to sign.",
    ],
  },
  {
    id: "em-5",
    from: "Tom Becker",
    initials: "TB",
    to: "to Inês, Grace, Harbor team",
    date: "Sep 24",
    body: [
      "Signed and returned with Grace's edits. Inês, can you confirm the deposit invoice goes to finance@harbor.co?",
      "Room list is due Oct 1, so please add your travel dates to the sheet by Friday.",
    ],
  },
];

const latestId = emails[emails.length - 1].id;

function ThreadToolbar({
  allOpen,
  onToggleAll,
}: {
  allOpen: boolean;
  onToggleAll: () => void;
}) {
  const { scrollToMessage } = useMessageScroller();

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
      <div className="min-w-0 flex-1">
        <h2
          id="message-scroller-05-subject"
          className="text-sm font-medium text-balance"
        >
          Re: Lisbon offsite venue contract
        </h2>
        <p className="text-xs text-muted-foreground">
          {emails.length} messages · 4 people
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          onToggleAll();
          requestAnimationFrame(() =>
            scrollToMessage(latestId, { align: "start" }),
          );
        }}
      >
        {allOpen ? (
          <ChevronsDownUpIcon data-icon="inline-start" aria-hidden="true" />
        ) : (
          <ChevronsUpDownIcon data-icon="inline-start" aria-hidden="true" />
        )}
        {allOpen ? "Collapse all" : "Expand all"}
      </Button>
    </div>
  );
}

function EmailRow({
  email,
  open,
  onToggle,
}: {
  email: Email;
  open: boolean;
  onToggle: () => void;
}) {
  const bodyId = `${email.id}-body`;

  return (
    <article className="border-b last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-3 text-start outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
      >
        <Avatar size="sm" className="mt-0.5">
          <AvatarFallback>{email.initials}</AvatarFallback>
        </Avatar>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-medium">{email.from}</span>
            <time className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {email.date}
            </time>
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {open ? email.to : email.body[0]}
          </span>
        </span>
      </button>
      {open ? (
        <div id={bodyId} className="flex flex-col gap-3 ps-13 pe-4 pb-4 text-sm">
          {email.body.map((paragraph) => (
            <p key={paragraph} className="text-pretty">
              {paragraph}
            </p>
          ))}
          {email.attachment ? (
            <p className="flex w-fit max-w-full items-center gap-2 rounded-md border bg-muted/40 px-2.5 py-1.5 text-xs">
              <PaperclipIcon
                aria-hidden="true"
                className="size-3.5 shrink-0 text-muted-foreground"
              />
              <span className="truncate">{email.attachment}</span>
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export default function MessageScroller05() {
  const [openIds, setOpenIds] = React.useState<string[]>([latestId]);
  const allOpen = openIds.length === emails.length;

  function toggle(id: string) {
    setOpenIds((current) =>
      current.includes(id)
        ? current.filter((openId) => openId !== id)
        : [...current, id],
    );
  }

  return (
    <section
      aria-labelledby="message-scroller-05-subject"
      className="flex h-[28rem] w-full max-w-lg flex-col overflow-hidden rounded-xl border bg-card text-card-foreground"
    >
      <MessageScrollerProvider
        autoScroll={false}
        defaultScrollPosition="last-anchor"
      >
        <ThreadToolbar
          allOpen={allOpen}
          onToggleAll={() =>
            setOpenIds(allOpen ? [latestId] : emails.map((email) => email.id))
          }
        />
        <MessageScroller className="min-h-0 flex-1">
          <MessageScrollerViewport aria-label="Email thread">
            <MessageScrollerContent className="gap-0">
              {emails.map((email) => (
                <MessageScrollerItem
                  key={email.id}
                  messageId={email.id}
                  scrollAnchor={email.id === latestId}
                >
                  <EmailRow
                    email={email}
                    open={openIds.includes(email.id)}
                    onToggle={() => toggle(email.id)}
                  />
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton variant="outline" className="shadow-sm" />
        </MessageScroller>
      </MessageScrollerProvider>
    </section>
  );
}
