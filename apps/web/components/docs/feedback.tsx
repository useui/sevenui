"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";

const buttonClass =
  "inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-foreground text-sm transition-colors hover:border-foreground";

type GtagWindow = Window & {
  gtag?: (command: "event", event: string, props: Record<string, string>) => void;
};

export function DocsFeedback({ title }: { title: string }) {
  const [voted, setVoted] = useState(false);

  const vote = (helpful: "no" | "yes") => {
    (window as GtagWindow).gtag?.("event", "feedback", {
      helpful,
      path: location.pathname,
      title,
    });
    setVoted(true);
  };

  return (
    <section
      aria-label="Was this page helpful?"
      className="mx-auto mt-12 flex max-w-content items-center justify-between gap-4 border-border border-t pt-6"
    >
      <p className="text-muted-foreground text-sm">Was this page helpful?</p>
      <div className={voted ? "hidden" : "flex items-center gap-2"}>
        <button className={buttonClass} onClick={() => vote("yes")} type="button">
          <ThumbsUp aria-hidden="true" size={16} />
          Yes
        </button>
        <button className={buttonClass} onClick={() => vote("no")} type="button">
          <ThumbsDown aria-hidden="true" size={16} />
          No
        </button>
      </div>
      <p className={voted ? "text-muted-foreground text-sm" : "hidden text-muted-foreground text-sm"}>
        Thanks for your feedback!
      </p>
    </section>
  );
}
