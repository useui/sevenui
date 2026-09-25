"use client";

import * as React from "react";
import { CircleCheck, FileCode2, RotateCcw } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageGroup,
  MessageHeader,
} from "@/registry/base/ui/message";
import { Textarea } from "@/registry/base/ui/textarea";

type Comment = {
  id: string;
  author: string;
  initials: string;
  time: string;
  body: string;
};

const initialComments: Comment[] = [
  {
    id: "c1",
    author: "Priya Raman",
    initials: "PR",
    time: "2h ago",
    body: "This retries forever if the webhook endpoint is down. Can we cap it and surface the failure?",
  },
  {
    id: "c2",
    author: "Marcus Lee",
    initials: "ML",
    time: "1h ago",
    body: "Good catch. Capping at 5 attempts with exponential backoff, then marking the delivery as failed.",
  },
];

export default function Message06() {
  const [comments, setComments] = React.useState(initialComments);
  const [draft, setDraft] = React.useState("");
  const [resolved, setResolved] = React.useState(false);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setComments((prev) => [
      ...prev,
      {
        id: `c${prev.length + 1}`,
        author: "You",
        initials: "YO",
        time: "Just now",
        body,
      },
    ]);
    setDraft("");
  };

  return (
    <section
      aria-label="Review thread on webhooks/deliver.ts"
      className="w-full max-w-md overflow-hidden rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex items-center gap-2 border-b bg-muted/50 px-3 py-2">
        <FileCode2
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground"
        />
        <span className="min-w-0 flex-1 truncate font-mono text-xs">
          src/webhooks/deliver.ts
        </span>
        {resolved ? (
          <Badge variant="secondary">
            <CircleCheck aria-hidden="true" />
            Resolved
          </Badge>
        ) : (
          <Badge variant="outline">{comments.length} comments</Badge>
        )}
      </header>

      <pre className="overflow-x-auto border-b bg-background px-3 py-2 font-mono text-xs leading-relaxed">
        <code>
          <span className="text-muted-foreground">41 </span>
          {"  while (!ok) {\n"}
          <span className="text-muted-foreground">42 </span>
          {"    ok = await send(event);\n"}
          <span className="text-muted-foreground">43 </span>
          {"  }"}
        </code>
      </pre>

      {resolved ? (
        <div className="flex items-center justify-between gap-3 px-3 py-3 text-sm">
          <p className="text-muted-foreground">
            You resolved this conversation.
          </p>
          <Button variant="ghost" size="sm" onClick={() => setResolved(false)}>
            <RotateCcw data-icon="inline-start" aria-hidden="true" />
            Reopen
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-3">
          <MessageGroup className="gap-4">
            {comments.map((comment) => (
              <Message key={comment.id}>
                <MessageAvatar className="self-start">
                  <Avatar size="sm">
                    <AvatarFallback>{comment.initials}</AvatarFallback>
                  </Avatar>
                </MessageAvatar>
                <MessageContent className="gap-1">
                  <MessageHeader className="gap-1.5 px-0">
                    <span className="text-foreground">{comment.author}</span>
                    <span aria-hidden="true">·</span>
                    <time>{comment.time}</time>
                  </MessageHeader>
                  <Bubble variant="ghost">
                    <BubbleContent>{comment.body}</BubbleContent>
                  </Bubble>
                </MessageContent>
              </Message>
            ))}
          </MessageGroup>

          <form onSubmit={submit} className="flex flex-col gap-2">
            <label htmlFor="message-06-reply" className="sr-only">
              Reply to thread
            </label>
            <Textarea
              id="message-06-reply"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Reply…"
              className="min-h-16 text-sm"
            />
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setResolved(true)}
              >
                Resolve conversation
              </Button>
              <Button type="submit" size="sm" disabled={!draft.trim()}>
                Comment
              </Button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
