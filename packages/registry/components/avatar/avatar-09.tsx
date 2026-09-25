"use client";

import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Textarea } from "@/registry/base/ui/textarea";

type Comment = {
  id: number;
  author: string;
  initials: string;
  image?: string;
  role?: string;
  time: string;
  body: string;
};

const initialComments: Comment[] = [
  {
    id: 1,
    author: "Priya Raman",
    initials: "PR",
    image: "/placeholder.svg",
    role: "Author",
    time: "2h ago",
    body: "The export job times out on workspaces with more than 40k rows. I traced it to the CSV writer buffering everything in memory.",
  },
  {
    id: 2,
    author: "Marcus Webb",
    initials: "MW",
    time: "1h ago",
    body: "Confirmed on staging. Streaming the rows in 5k chunks brings the Acme export down from 94s to 11s.",
  },
];

export default function Avatar09() {
  const [comments, setComments] = React.useState(initialComments);
  const [draft, setDraft] = React.useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setComments((current) => [
      ...current,
      {
        id: current.length + 1,
        author: "Elena Cruz",
        initials: "EC",
        time: "Just now",
        body,
      },
    ]);
    setDraft("");
  }

  return (
    <section
      aria-labelledby="avatar-09-title"
      className="flex w-full max-w-md flex-col gap-5"
    >
      <h3 id="avatar-09-title" className="text-sm font-medium">
        Discussion
        <span className="ml-1.5 text-muted-foreground tabular-nums">
          {comments.length}
        </span>
      </h3>
      <ol className="relative flex flex-col gap-5 before:absolute before:top-2 before:bottom-2 before:left-4 before:w-px before:bg-border">
        {comments.map((comment) => (
          <li key={comment.id} className="relative flex gap-3">
            <Avatar className="ring-4 ring-background">
              {comment.image && (
                <AvatarImage src={comment.image} alt="" />
              )}
              <AvatarFallback>{comment.initials}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <span className="font-medium">{comment.author}</span>
                {comment.role && (
                  <Badge variant="outline" className="h-4.5 px-1.5">
                    {comment.role}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {comment.time}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
                {comment.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground">
            EC
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <label htmlFor="avatar-09-reply" className="sr-only">
            Write a reply
          </label>
          <Textarea
            id="avatar-09-reply"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Reply to the thread…"
            className="min-h-20 resize-none"
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={!draft.trim()}>
              Comment
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
